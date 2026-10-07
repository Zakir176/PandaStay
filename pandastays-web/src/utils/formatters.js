/**
 * PandaStays Formatters & Text Utilities
 * Centralized formatting helpers for financial, date, and identity data.
 */

/**
 * Format numeric value to Zambian Kwacha (ZMW)
 * @param {number|string} amount 
 * @param {boolean} useKwachaPrefix - If true, formats as 'K2,500', otherwise 'ZMW 2,500'
 * @returns {string}
 */
export function formatCurrency(amount, useKwachaPrefix = false) {
  const num = Number(amount) || 0
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
  return useKwachaPrefix ? `K${formatted}` : `ZMW ${formatted}`
}

/**
 * Format Date to readable standard format: '12 Jan 2026'
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Format Date and Time: '12 Jan 2026, 14:30'
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Extract 2-letter uppercase initials from full name: 'John Phiri' -> 'JP'
 * @param {string} name 
 * @param {number} maxChars 
 * @returns {string}
 */
export function getInitials(name, maxChars = 2) {
  if (!name || typeof name !== 'string') return 'PS'
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .filter(Boolean)
    .join('')
    .substring(0, maxChars)
    .toUpperCase()
}

/**
 * Clean and format Zambian Mobile Money phone numbers: '+260 97 1234567'
 * @param {string} phone 
 * @returns {string}
 */
export function formatPhoneNumber(phone) {
  if (!phone) return ''
  const cleaned = phone.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+260') && cleaned.length >= 12) {
    return `+260 ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`
  }
  return phone
}

/**
 * Format Zambian National Registration Card (NRC): '123456/11/1'
 * @param {string} nrc 
 * @returns {string}
 */
export function formatNRC(nrc) {
  if (!nrc) return 'NRC-Verified'
  return nrc.trim()
}
