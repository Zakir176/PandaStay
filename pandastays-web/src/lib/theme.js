import { ref } from 'vue'

export const ACCENT_THEMES = [
  {
    name: 'Forest',
    description: 'Emerald Pine & Foliage',
    category: 'Nature',
    color: '#144D2F',
    vars: {
      '--color-primary': '#144D2F',
      '--color-primary-hover': '#0F3D24',
      '--color-primary-accent': '#34A864',
      '--color-primary-container': '#E6F3EB',
      '--color-on-primary-container': '#082515',
      '--color-hero-dark': '#0B2416',
      '--color-hero-topo': '#183C28',
      '--color-background': '#F4F6F4',
      '--color-surface-dim': '#EDF1ED'
    }
  },
  {
    name: 'Ocean',
    description: 'Deep Sapphire & Marine Blue',
    category: 'Corporate',
    color: '#1D3BB2',
    vars: {
      '--color-primary': '#1D3BB2',
      '--color-primary-hover': '#162E8E',
      '--color-primary-accent': '#3B82F6',
      '--color-primary-container': '#EAF0FF',
      '--color-on-primary-container': '#0A1B59',
      '--color-hero-dark': '#0B1938',
      '--color-hero-topo': '#152A56',
      '--color-background': '#F3F6FA',
      '--color-surface-dim': '#E9EEF6'
    }
  },
  {
    name: 'Plum',
    description: 'Royal Amethyst & Violet',
    category: 'Creative',
    color: '#5A246B',
    vars: {
      '--color-primary': '#5A246B',
      '--color-primary-hover': '#461B54',
      '--color-primary-accent': '#A855F7',
      '--color-primary-container': '#F8EEFB',
      '--color-on-primary-container': '#300D3B',
      '--color-hero-dark': '#240B2D',
      '--color-hero-topo': '#3D1B48',
      '--color-background': '#F8F4F9',
      '--color-surface-dim': '#F1E9F3'
    }
  },
  {
    name: 'Ember',
    description: 'Warm Terracotta & African Sunset',
    category: 'Warm',
    color: '#A83820',
    vars: {
      '--color-primary': '#A83820',
      '--color-primary-hover': '#852915',
      '--color-primary-accent': '#F97316',
      '--color-primary-container': '#FEF0EC',
      '--color-on-primary-container': '#52160A',
      '--color-hero-dark': '#2E0F08',
      '--color-hero-topo': '#4E1E14',
      '--color-background': '#FAF5F3',
      '--color-surface-dim': '#F4EAE6'
    }
  },
  {
    name: 'Teal',
    description: 'Nordic Lagoon & Cyan',
    category: 'Modern',
    color: '#0D6E6E',
    vars: {
      '--color-primary': '#0D6E6E',
      '--color-primary-hover': '#084F4F',
      '--color-primary-accent': '#14B8A6',
      '--color-primary-container': '#E6F7F6',
      '--color-on-primary-container': '#052A2A',
      '--color-hero-dark': '#062525',
      '--color-hero-topo': '#103E3E',
      '--color-background': '#F2F7F7',
      '--color-surface-dim': '#E8F1F1'
    }
  },
  {
    name: 'Ruby',
    description: 'Crimson Velvet & Port Wine',
    category: 'Luxury',
    color: '#9F1239',
    vars: {
      '--color-primary': '#9F1239',
      '--color-primary-hover': '#7E0B2B',
      '--color-primary-accent': '#F43F5E',
      '--color-primary-container': '#FFE8EE',
      '--color-on-primary-container': '#470517',
      '--color-hero-dark': '#2E0610',
      '--color-hero-topo': '#4D1220',
      '--color-background': '#FAF3F5',
      '--color-surface-dim': '#F4E9EC'
    }
  },
  {
    name: 'Copper',
    description: 'Zambian Mineral & Amber Gold',
    category: 'Warm',
    color: '#B45309',
    vars: {
      '--color-primary': '#B45309',
      '--color-primary-hover': '#8F3F05',
      '--color-primary-accent': '#F59E0B',
      '--color-primary-container': '#FEF3E2',
      '--color-on-primary-container': '#4A2002',
      '--color-hero-dark': '#2C1302',
      '--color-hero-topo': '#4D2409',
      '--color-background': '#FAF6F2',
      '--color-surface-dim': '#F3ECE3'
    }
  },
  {
    name: 'Indigo',
    description: 'Cyber Cobalt & Electric Indigo',
    category: 'Modern',
    color: '#4338CA',
    vars: {
      '--color-primary': '#4338CA',
      '--color-primary-hover': '#3329A3',
      '--color-primary-accent': '#6366F1',
      '--color-primary-container': '#ECEAFC',
      '--color-on-primary-container': '#18125C',
      '--color-hero-dark': '#131139',
      '--color-hero-topo': '#252163',
      '--color-background': '#F5F5FC',
      '--color-surface-dim': '#EAE9F7'
    }
  },
  {
    name: 'Sage',
    description: 'Earthy Olive & Botanical Herb',
    category: 'Nature',
    color: '#3F5E36',
    vars: {
      '--color-primary': '#3F5E36',
      '--color-primary-hover': '#2E4727',
      '--color-primary-accent': '#84CC16',
      '--color-primary-container': '#EBF2E8',
      '--color-on-primary-container': '#192915',
      '--color-hero-dark': '#192816',
      '--color-hero-topo': '#2C4227',
      '--color-background': '#F5F7F4',
      '--color-surface-dim': '#EBEFE9'
    }
  },
  {
    name: 'Slate',
    description: 'Minimalist Scandinavian Charcoal',
    category: 'Corporate',
    color: '#334155',
    vars: {
      '--color-primary': '#334155',
      '--color-primary-hover': '#242F3E',
      '--color-primary-accent': '#64748B',
      '--color-primary-container': '#E9ECF0',
      '--color-on-primary-container': '#161C24',
      '--color-hero-dark': '#0F172A',
      '--color-hero-topo': '#1E293B',
      '--color-background': '#F8FAFC',
      '--color-surface-dim': '#EDF2F7'
    }
  }
]

const STORAGE_THEME_KEY = 'pandastays_accent_theme'
const STORAGE_CUSTOM_KEY = 'pandastays_custom_theme_color'

// Helper functions to parse hex to HSL and format back to hex
function hexToHsl(hex) {
  let r = 0, g = 0, b = 0
  hex = hex.replace('#', '')
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255
    g = parseInt(hex[1] + hex[1], 16) / 255
    b = parseInt(hex[2] + hex[2], 16) / 255
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255
    g = parseInt(hex.substring(2, 4), 16) / 255
    b = parseInt(hex.substring(4, 6), 16) / 255
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

export function generateCustomTheme(primaryHex) {
  const { h, s } = hexToHsl(primaryHex)
  return {
    name: 'Custom',
    description: 'Custom User-Generated Palette',
    category: 'Custom',
    color: primaryHex,
    vars: {
      '--color-primary': primaryHex,
      '--color-primary-hover': hslToHex(h, Math.min(s + 5, 100), 20),
      '--color-primary-accent': hslToHex(h, Math.min(s + 15, 100), 55),
      '--color-primary-container': hslToHex(h, Math.min(s, 40), 94),
      '--color-on-primary-container': hslToHex(h, Math.min(s, 70), 12),
      '--color-hero-dark': hslToHex(h, Math.min(s, 65), 10),
      '--color-hero-topo': hslToHex(h, Math.min(s, 50), 18),
      '--color-background': hslToHex(h, Math.min(s, 15), 97),
      '--color-surface-dim': hslToHex(h, Math.min(s, 18), 93)
    }
  }
}

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY)
    if (saved === 'Custom') return 'Custom'
    if (saved && ACCENT_THEMES.some(t => t.name === saved)) {
      return saved
    }
  } catch (e) {
    // Ignore storage errors
  }
  return 'Forest'
}

const getInitialCustomColor = () => {
  try {
    const saved = localStorage.getItem(STORAGE_CUSTOM_KEY)
    if (saved && /^#[0-9A-Fa-f]{6}$/.test(saved)) {
      return saved
    }
  } catch (e) {
    // Ignore storage errors
  }
  return '#2563EB'
}

export const currentAccent = ref(getInitialTheme())
export const customColor = ref(getInitialCustomColor())

export const applyTheme = (themeName, hexOverride = null) => {
  let theme
  if (themeName === 'Custom') {
    const hex = hexOverride || customColor.value
    customColor.value = hex
    theme = generateCustomTheme(hex)
    try {
      localStorage.setItem(STORAGE_CUSTOM_KEY, hex)
    } catch (e) {}
  } else {
    theme = ACCENT_THEMES.find(t => t.name === themeName) || ACCENT_THEMES[0]
  }

  currentAccent.value = theme.name

  try {
    localStorage.setItem(STORAGE_THEME_KEY, theme.name)
  } catch (e) {}

  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value)
  }
}

export const initTheme = () => {
  applyTheme(currentAccent.value)
}
