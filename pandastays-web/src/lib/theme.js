import { ref } from 'vue'

export const ACCENT_THEMES = [
  {
    name: 'Forest',
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
  }
]

const STORAGE_KEY = 'pandastays_accent_theme'

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && ACCENT_THEMES.some(t => t.name === saved)) {
      return saved
    }
  } catch (e) {
    // Ignore storage errors
  }
  return 'Forest'
}

export const currentAccent = ref(getInitialTheme())

export const applyTheme = (themeName) => {
  const theme = ACCENT_THEMES.find(t => t.name === themeName) || ACCENT_THEMES[0]
  currentAccent.value = theme.name

  try {
    localStorage.setItem(STORAGE_KEY, theme.name)
  } catch (e) {
    // Ignore storage errors
  }

  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value)
  }
}

export const initTheme = () => {
  applyTheme(currentAccent.value)
}
