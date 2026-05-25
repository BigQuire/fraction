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
  { code: 'USD', symbol: '$', label: 'US Dollar', rate: 1 },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit', rate: 4.72 },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', rate: 1.35 },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', rate: 1.52 },
  { code: 'EUR', symbol: '€', label: 'Euro', rate: 0.92 },
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
  const convertedAmount = Number(amount || 0) * currency.rate

  return `${currency.symbol}${convertedAmount.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`
}

export const toBaseCurrency = (amount, currencyCode = 'USD') => {
  const currency = currencies.find((item) => item.code === currencyCode) || currencies[0]
  return Number(amount || 0) / currency.rate
}
