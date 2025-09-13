import { fetchProducts } from './js/services/api.js'
import './js/modules/cart.js'
import './js/modules/product.js'
import './js/modules/relatedProducts.js'

const initializeApp = async () => {
  try {
    const cartElement = document.querySelector('cart-sidebar')
    const relatedProductsElement = document.querySelector('related-products')
    const productElement = document.querySelector('product-detail')

    productElement.setCartElement(cartElement)
    productElement.setRelatedProductsElement(relatedProductsElement)

    window.cartElement = cartElement
    window.productElement = productElement
    window.relatedProductsElement = relatedProductsElement

    const products = await fetchProducts()
    productElement.setProducts(products)

    if (products.length) {
      const id = productElement.getProductIdFromUrl()
      productElement.selectProduct(id || products[0].id)
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
}

document.addEventListener('DOMContentLoaded', initializeApp)
