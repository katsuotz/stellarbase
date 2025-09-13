export const fetchProducts = async () => {
  try {
    const response = await fetch('./json/products.json')
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    return data.products
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}
