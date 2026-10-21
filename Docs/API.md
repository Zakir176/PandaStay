# PandaStays API & Webhook Specification

**API Version:** 1.0.0  
**Base Server URL:** `http://localhost:3001` (Development) / `https://api.pandastays.zm` (Production)  
**Protocol:** HTTPS / TLS 1.3  
**Content-Type:** `application/json`  

---

## 1. Authentication & Security Headers

The PandaStays backend API gateway enforces role-based access control and cryptographic payload verification.

### 1.1 Bearer Token Authentication
Client requests originating from authenticated landlords or tenants must include the Supabase session JWT in the standard authorization header:

```http
Authorization: Bearer <supabase_jwt_access_token>
```

The server middleware (`server/middleware/auth.js`) verifies the JWT against Supabase Auth:
- `requireAuth`: Verifies token validity; attaches `req.user` to the request.
- `requireLandlord`: Verifies token and asserts user exists in `landlords` table. Fails closed with HTTP `403 Forbidden` if unauthorized.

### 1.2 Rate Limiting & Protection
- General API endpoints: Limited to 100 requests per 15-minute window per IP.
- MoMo Push endpoints: Limited to 10 requests per minute per IP to prevent telecom network abuse.
- Security Headers: Configured via `helmet` (HSTS, Content-Security-Policy, X-Frame-Options).

---

## 2. Mobile Money Payment Endpoints (`/api/momo`)

### 2.1 Trigger Mobile Money STK Push
Initiates a prompt on the student's mobile device requesting their Mobile Money PIN.

- **Endpoint:** `POST /api/momo/push`
- **Authentication:** Required (`requireAuth`)
- **Rate Limit:** 10 requests / min

#### Request Body
```json
{
  "tenancyId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 2500,
  "phone": "0971122334",
  "operator": "mtn",
  "country": "zm"
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `tenancyId` | `string` (UUID) | Yes | Valid active tenancy ID. |
| `amount` | `number` | Yes | Positive integer in ZMW (Kwacha). |
| `phone` | `string` | Yes | 10-digit Zambian mobile number (`097...` or `096...` or `095...`). |
| `operator` | `string` | Yes | One of: `mtn`, `airtel`, `zamtel`. |
| `country` | `string` | No | Default: `zm`. |

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "reference": "LNC-MTN-20261021-00123",
  "paymentId": "4bf83f64-8817-4562-b3fc-1c963f66afa8",
  "receiptNumber": "REC-2026-007",
  "verificationToken": "d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f9",
  "status": "pending",
  "message": "Mobile Money STK push prompt dispatched to 0971122334. Please enter your PIN on your mobile phone."
}
```

#### Error Responses
- `400 Bad Request`: Missing mandatory parameters or invalid phone format.
- `401 Unauthorized`: Missing or invalid Bearer token.
- `502 Bad Gateway`: Lenco API error or telecom network rejection.

---

### 2.2 Query Collection Status
Retrieves real-time status of an ongoing collection directly from the Lenco gateway.

- **Endpoint:** `GET /api/momo/status/:reference`
- **Authentication:** Required (`requireAuth`)

#### Path Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `reference` | `string` | The gateway reference code (e.g., `LNC-MTN-20261021-00123`). |

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "reference": "LNC-MTN-20261021-00123",
  "status": "success",
  "amount": 2500,
  "settledAt": "2026-10-21T07:42:10.000Z"
}
```

---

## 3. Webhook Ingestion (`/api/webhooks`)

### 3.1 Lenco Webhook Listener
Receives asynchronous payment settlement notifications from Lenco.

- **Endpoint:** `POST /api/webhooks/lenco`
- **Authentication:** Cryptographic Header Signature (`x-lenco-signature`)

#### Webhook Security & Verification Algorithm
Each incoming payload must be verified using HMAC-SHA512 against the raw request body buffer:

$$\text{Signature} = \text{HMAC-SHA512}(\text{rawBody}, \text{LENCO\_SECRET\_KEY})$$

The server verifies the signature in constant-time using `crypto.timingSafeEqual` to prevent timing attacks.

#### Payload Schema (`collection.successful`)
```json
{
  "event": "collection.successful",
  "data": {
    "reference": "LNC-MTN-20261021-00123",
    "amount": 2500.00,
    "currency": "ZMW",
    "fee": 37.50,
    "status": "successful",
    "operator": "mtn",
    "mobileNumber": "0971122334",
    "completedAt": "2026-10-21T07:45:00Z",
    "subaccountId": "sub_landlord_9981"
  }
}
```

#### Server Processing Workflow
1. Verify `x-lenco-signature`. If invalid, return `401 Unauthorized`.
2. Check database for existing payment with matching `gateway_reference`.
3. Query Lenco `GET /collections/status/:reference` to prevent spoofing.
4. Update payment status to `success` and set `paid_at = completedAt`.
5. Update child `bed_spaces` status to `occupied` and `paymentStatus = 'paid'`.
6. Return `200 OK` with `{"received": true}` within 1500ms to prevent gateway retries.

---

## 4. Digital Receipt Verification (`/api/receipts`)

### 4.1 Public Verification by Token
Validates the authenticity of an issued digital receipt. Designed for zero-auth public consumption via QR codes.

- **Endpoint:** `GET /api/receipts/verify/:token`
- **Authentication:** Public (No token required)
- **Rate Limit:** 60 requests / min

#### Successful Response (`200 OK`)
```json
{
  "verified": true,
  "receipt": {
    "receiptNumber": "REC-2026-006",
    "status": "success",
    "amount": 2500,
    "currency": "ZMW",
    "paidAt": "2026-10-21 06:48",
    "tenantName": "Natasha Zimba",
    "bedLabel": "Bed 101-A (Window)",
    "propertyName": "Mukuba House",
    "method": "MTN Mobile Money",
    "gatewayReference": "MANUAL-320549"
  }
}
```

#### Invalid / Unverified Response (`404 Not Found`)
```json
{
  "verified": false,
  "error": "Digital receipt token could not be verified against the PandaStays registry."
}
```

---

## 5. Tenant Profile Synchronization (`/api/tenants`)

### 5.1 Auto-Link Auth Profile
Links an authenticated student tenant's Supabase UID to their pre-existing landlord-created tenant dossier.

- **Endpoint:** `POST /api/tenants/link`
- **Authentication:** Required (`requireAuth`)

#### Request Body
```json
{
  "email": "natasha.zimba@unza.zm"
}
```

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "linked": true,
  "tenantId": "8fa85f64-5717-4562-b3fc-2c963f66afa1",
  "name": "Natasha Zimba"
}
```
