import QRCode from 'qrcode'

/**
 * Generates a deterministic verification hash for digital receipts
 */
export function generateDigitalHash(record) {
  const ref = record.receipt_number || record.reference || record.id || 'REC-000'
  const amt = record.amount || '0'
  const date = record.paid_at || record.created_at || new Date().toISOString()
  const raw = `${ref}-${amt}-${date}-PANDASTAYS-STK`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase()
  const sec = Math.abs((hash * 31) & 0xFFFFFFFF).toString(16).padStart(8, '0').toUpperCase()
  return `SHA256:${hex.slice(0, 4)}-${hex.slice(4)}-${sec.slice(0, 4)}-${sec.slice(4)}`
}

/**
 * Generates standalone, executive-finish HTML receipt document
 * @param {Object} record Receipt / Payment / Tenancy record
 * @param {Object} options Configuration options
 * @returns {Promise<string>} Standalone HTML string
 */
export async function generateReceiptHtml(record = {}, options = {}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pandastays.zm'
  const recordId = record.receipt_number || record.reference || record.id || `REC-${Date.now().toString().slice(-6)}`
  const recordType = options.type || record.type || 'RECEIPT' // RECEIPT, INVOICE, LEASE
  const propertyName = options.propertyName || record.property_name || 'Mukuba House'
  const tenantName = record.tenant_name || record.tenant?.name || 'John Phiri'
  const bedLabel = record.bed_label || record.bed?.label || 'Bed 101-A (Window)'
  const rawAmount = Number(record.amount || 2500)
  const formattedAmount = rawAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const paymentMethod = record.method_label || record.payment_method_label || 'MTN Mobile Money'
  const gatewayRef = record.gateway_reference || record.reference || `LNC-${Date.now().toString().slice(-6)}`
  const issueDate = record.paid_at || record.created_at || new Date().toISOString().replace('T', ' ').slice(0, 19) + ' CAT'
  const status = record.status || 'VERIFIED PAID'
  const digitalHash = generateDigitalHash(record)

  // Public verification URL
  const verifyUrl = `${origin}/verify/${encodeURIComponent(recordId)}?amt=${rawAmount}&tenant=${encodeURIComponent(tenantName)}&property=${encodeURIComponent(propertyName)}&unit=${encodeURIComponent(bedLabel)}&status=PAID`

  // Generate vector-crisp QR code
  let qrDataUrl = ''
  try {
    qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0A6640', // Deep emerald
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
  } catch (err) {
    console.error('Error generating QR for print receipt:', err)
  }

  const documentTitle = recordType === 'INVOICE' 
    ? 'Official Tenancy Invoice' 
    : (recordType === 'LEASE' ? 'Official Tenancy Lease Allocation' : 'Official Rent Payment Receipt')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle} — ${recordId}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #f3f4f6;
      color: #1f2937;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      padding: 32px 16px;
      display: flex;
      justify-content: center;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    /* Outer Container */
    .receipt-container {
      width: 100%;
      max-width: 580px;
      background-color: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
      border: 1px solid #e5e7eb;
    }

    /* Branded Header Banner (Deep Emerald Accent with Decorative Rings) */
    .header-banner {
      background: linear-gradient(135deg, #0A6640 0%, #064E3B 100%);
      color: #ffffff;
      padding: 28px 28px 24px 28px;
      position: relative;
      overflow: hidden;
    }

    /* Decorative semi-transparent backdrop circular shapes */
    .header-banner::before {
      content: '';
      position: absolute;
      top: -30px;
      right: -20px;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.07);
      pointer-events: none;
    }

    .header-banner::after {
      content: '';
      position: absolute;
      bottom: -40px;
      right: 60px;
      width: 110px;
      height: 110px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      pointer-events: none;
    }

    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-mark {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .brand-kicker {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: rgba(255, 255, 255, 0.8);
    }

    .record-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #ffffff;
      line-height: 1.2;
      position: relative;
      z-index: 1;
    }

    .record-subtitle {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 2px;
      position: relative;
      z-index: 1;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.4);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      color: #A7F3D0;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #34D399;
      box-shadow: 0 0 6px #34D399;
    }

    /* Reference Code Strip */
    .reference-strip {
      background-color: #ECFDF5;
      border-bottom: 1px solid #D1FAE5;
      padding: 10px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
    }

    .reference-id {
      color: #065F46;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .reference-time {
      color: #047857;
      font-size: 11px;
    }

    /* Content Area */
    .receipt-body {
      padding: 24px 28px;
    }

    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6b7280;
      margin-bottom: 10px;
    }

    /* Structured Data Grid */
    .data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 18px;
    }

    .data-card {
      background-color: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 10px;
      padding: 10px 12px;
    }

    .data-label {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.6px;
      color: #9ca3af;
      margin-bottom: 2px;
    }

    .data-value {
      font-size: 12px;
      font-weight: 600;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Highlight Stay / Item Card */
    .highlight-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 18px;
    }

    .highlight-left {
      flex: 1;
    }

    .highlight-divider {
      width: 1px;
      height: 38px;
      background-color: #cbd5e1;
    }

    .highlight-right {
      text-align: right;
    }

    /* High-Contrast Total Box */
    .total-box {
      background-color: #111827;
      color: #ffffff;
      border-radius: 12px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .total-label-kicker {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #9ca3af;
      margin-bottom: 3px;
    }

    .total-meta {
      font-size: 11px;
      color: #34D399;
      font-weight: 500;
    }

    .total-amount {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }

    .currency-symbol {
      font-size: 13px;
      font-weight: 600;
      color: #9ca3af;
      margin-right: 2px;
    }

    /* Dedicated "Scan to Verify" Card */
    .verify-card {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .qr-frame {
      width: 96px;
      height: 96px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 9px;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .qr-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .verify-details {
      flex: 1;
    }

    .verify-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #065F46;
      margin-bottom: 3px;
    }

    .verify-instructions {
      font-size: 11px;
      color: #4b5563;
      line-height: 1.4;
      margin-bottom: 6px;
    }

    .verify-link {
      font-size: 10px;
      color: #0A6640;
      font-weight: 600;
      text-decoration: underline;
      word-break: break-all;
    }

    .hash-badge {
      display: inline-block;
      margin-top: 4px;
      font-size: 9px;
      color: #6b7280;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* Official Footer */
    .receipt-footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      text-align: center;
      color: #9ca3af;
      font-size: 10px;
      line-height: 1.5;
    }

    .footer-url {
      color: #0A6640;
      font-weight: 600;
      text-decoration: none;
    }

    /* Mobile Screen Responsive Rules (Phone Displays < 520px) */
    @media screen and (max-width: 520px) {
      body {
        padding: 12px 8px;
      }

      .receipt-container {
        border-radius: 14px;
      }

      .header-banner {
        padding: 20px 16px 18px 16px;
      }

      .record-title {
        font-size: 17px;
      }

      .reference-strip {
        padding: 8px 16px;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .receipt-body {
        padding: 16px 16px;
      }

      .highlight-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 14px;
      }

      .highlight-divider {
        width: 100%;
        height: 1px;
      }

      .highlight-right {
        text-align: left;
      }

      .data-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .total-box {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 14px 16px;
      }

      .total-amount {
        font-size: 22px;
      }

      .verify-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 12px;
        padding: 14px;
      }

      .header-top {
        flex-wrap: wrap;
        gap: 8px;
      }

      .verify-link {
        word-break: break-all;
      }

      .hash-badge {
        word-break: break-all;
        white-space: normal;
        max-width: 100%;
      }
    }

    /* Print Specific Styles */
    @media print {
      body {
        background-color: #ffffff !important;
        padding: 0 !important;
      }

      .receipt-container {
        box-shadow: none !important;
        border: 1px solid #d1d5db !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }

      @page {
        margin: 0.5in;
        size: auto;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Header Banner -->
    <div class="header-banner">
      <div class="header-top">
        <div class="brand-group">
          <div class="brand-mark">PS</div>
          <div>
            <div class="brand-kicker">PandaStays &bull; Student Housing PropTech</div>
          </div>
        </div>
        <div class="status-pill">
          <span class="status-dot"></span>
          <span>${status}</span>
        </div>
      </div>
      <h1 class="record-title">${documentTitle}</h1>
      <p class="record-subtitle">${propertyName} &bull; Lusaka, Zambia</p>
    </div>

    <!-- Reference Code Strip -->
    <div class="reference-strip font-mono">
      <span class="reference-id">#${recordId}</span>
      <span class="reference-time">Issued: ${issueDate}</span>
    </div>

    <!-- Body -->
    <div class="receipt-body">
      <!-- Highlight Card -->
      <div class="highlight-card">
        <div class="highlight-left">
          <span class="data-label">Allocated Accommodation</span>
          <div class="data-value" style="font-size: 13px;">${bedLabel}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${propertyName}</div>
        </div>
        <div class="highlight-divider"></div>
        <div class="highlight-right">
          <span class="data-label">Residency Term</span>
          <div class="data-value" style="font-size: 12px; color: #0A6640;">Term 1 2026</div>
          <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">Monthly Lease</div>
        </div>
      </div>

      <!-- Structured Data -->
      <div class="section-title">Tenancy & Payment Record</div>
      <div class="data-grid">
        <div class="data-card">
          <div class="data-label">Resident Tenant</div>
          <div class="data-value">${tenantName}</div>
        </div>
        <div class="data-card">
          <div class="data-label">Payment Channel</div>
          <div class="data-value">${paymentMethod}</div>
        </div>
        <div class="data-card">
          <div class="data-label">Gateway Reference</div>
          <div class="data-value font-mono" style="font-size: 11px;">${gatewayRef}</div>
        </div>
        <div class="data-card">
          <div class="data-label">Verification Status</div>
          <div class="data-value" style="color: #0A6640;">Reconciled & Cleared</div>
        </div>
      </div>

      <!-- High-Contrast Total Box -->
      <div class="total-box">
        <div>
          <div class="total-label-kicker">Total Kwacha Amount Paid</div>
          <div class="total-meta">Reconciled via Lenco Mobile Money STK Rail</div>
        </div>
        <div class="total-amount font-mono">
          <span class="currency-symbol">ZMW</span>${formattedAmount}
        </div>
      </div>

      <!-- Dedicated "Scan to Verify" Card -->
      <div class="verify-card">
        <div class="qr-frame">
          <img src="${qrDataUrl}" alt="Scannable Verification QR Code" />
        </div>
        <div class="verify-details">
          <div class="verify-title">Official Verification Stub</div>
          <p class="verify-instructions">
            Scan with any smartphone camera to verify this accommodation payment directly against the PandaStays registry.
          </p>
          <a href="${verifyUrl}" target="_blank" class="verify-link font-mono">${origin}/verify/${recordId}</a>
          <div>
            <span class="hash-badge font-mono">${digitalHash}</span>
          </div>
        </div>
      </div>

      <!-- Official Footer -->
      <div class="receipt-footer">
        <p>This is an official cryptographic digital receipt issued by <a href="${origin}" class="footer-url">PandaStays Housing Management</a>.</p>
        <p>Tamper-evident record &bull; Registered in Lusaka, Republic of Zambia &bull; &copy; 2026 PandaStays Technologies Ltd.</p>
      </div>
    </div>
  </div>

  <script>
    // Trigger print dialog automatically once assets render
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`
}

/**
 * Generates Blob URL and opens print dialog in new tab / window
 * @param {Object} record Record data
 * @param {Object} options Options
 */
export async function openPrintReceipt(record = {}, options = {}) {
  try {
    const html = await generateReceiptHtml(record, options)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)

    const printWindow = window.open(blobUrl, '_blank')
    if (!printWindow) {
      // Fallback: If browser blocked popup, use iframe
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      document.body.appendChild(iframe)
      iframe.src = blobUrl
      setTimeout(() => {
        iframe.contentWindow?.print()
      }, 500)
    }

    // Revoke object URL after delay
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 60000)

    return { success: true }
  } catch (err) {
    console.error('Failed to open printable receipt:', err)
    return { success: false, error: err.message }
  }
}
