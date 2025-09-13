export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return 'Price not available'
  }
  return `$${price.toFixed(2)}`
}
