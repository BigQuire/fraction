export const categories = [
  'Anime',
  'Fantasy',
  'Cyberpunk',
  'Nature',
  'Portrait',
  'Character Design',
  'Landscape',
  'Sci-Fi',
  'Horror',
  'Abstract',
  'Game Art',
  'Comics',
]

export const currencies = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
]

export const regions = [
  'United States',
  'Malaysia',
  'Singapore',
  'Australia',
  'Europe',
]

export const languages = [
  { code: 'en', label: 'English' },
  { code: 'ms', label: 'Malay' },
  { code: 'zh', label: 'Chinese' },
]

export const getStoredSettings = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
  const storedSettings = JSON.parse(localStorage.getItem('fraction-settings') || 'null')

  return {
    theme: 'dark',
    language: 'en',
    region: 'Malaysia',
    currency: 'USD',
    ...storedSettings,
    ...storedUser?.settings,
  }
}

export const applyTheme = (theme = 'dark') => {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(
    'fraction-settings',
    JSON.stringify({
      ...getStoredSettings(),
      theme,
    })
  )
}

export const formatMoney = (amount, currencyCode = 'USD') => {
  const currency = currencies.find((item) => item.code === currencyCode) || currencies[0]
  return `${currency.symbol}${Number(amount || 0).toLocaleString()}`
}
