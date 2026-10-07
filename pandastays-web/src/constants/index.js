/**
 * PandaStays Domain Constants
 * Standardized enumerations and configurations used across portals.
 */

export const USER_ROLES = {
  LANDLORD: 'landlord',
  TENANT: 'tenant',
  GUEST: 'guest'
}

export const BED_STATUS = {
  VACANT: 'vacant',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved'
}

export const PAYMENT_METHODS = {
  MOMO_MTN: {
    key: 'momo_mtn',
    label: 'MTN MoMo',
    provider: 'MTN Mobile Money',
    icon: 'smartphone',
    badgeClass: 'bg-yellow-400/20 text-yellow-700'
  },
  MOMO_AIRTEL: {
    key: 'momo_airtel',
    label: 'Airtel Money',
    provider: 'Airtel Money',
    icon: 'smartphone',
    badgeClass: 'bg-red-500/20 text-red-600'
  },
  MOMO_ZAMTEL: {
    key: 'momo_zamtel',
    label: 'Zamtel Kwacha',
    provider: 'Zamtel Kwacha',
    icon: 'smartphone',
    badgeClass: 'bg-green-500/20 text-green-700'
  },
  CASH: {
    key: 'cash',
    label: 'Cash (Physical Voucher)',
    provider: 'Direct Cash',
    icon: 'payments',
    badgeClass: 'bg-surface-container-highest text-on-surface'
  }
}

export const MAINTENANCE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Furniture',
  'Wi-Fi / Internet',
  'Security & Locks',
  'General Facility'
]

export const MAINTENANCE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved'
}

export const URGENCY_LEVELS = [
  { value: 'Low', label: 'Low — Routine repair' },
  { value: 'Medium', label: 'Medium — Impairs daily usage' },
  { value: 'High', label: 'High — Urgent, safety or utility disruption' }
]

export const DEFAULT_PROPERTY = {
  id: '22222222-0000-4000-8000-000000000001',
  landlord_id: '11111111-0000-4000-8000-000000000001',
  name: 'Mukuba House',
  address: 'Plot 402, Great East Road, Northmead, Lusaka, Zambia'
}
