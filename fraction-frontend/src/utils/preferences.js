export const categories = [
  'Trading Cards',
  'Sealed Boxes',
  'Figures',
  'Coins',
  'Stamps',
  'Comics',
  'Sports Memorabilia',
  'Game Collectibles',
  'Toys',
  'Vintage Items',
  'Limited Editions',
  'Other Collectibles',
]

export const conditions = [
  'Mint',
  'Near Mint',
  'Excellent',
  'Good',
  'Played',
  'Damaged',
]

export const platformCredit = {
  code: 'FRC',
  label: 'Fraction Credits',
}

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

export const formatCredits = (amount) => {
  return `${Number(amount || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ${platformCredit.code}`
}

export const toCredits = (amount) => Number(amount || 0)
