const API_ORIGIN = 'https://fraction-hfg4.onrender.com'

export const getArtworkImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return ''
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  return `${API_ORIGIN}/uploads/${imageUrl}`
}
