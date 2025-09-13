import { fetchProducts } from './js/services/api.js'
import './js/modules/cart.js'
import { ProductManager } from './js/modules/product.js'
import { RelatedProductsManager } from './js/modules/relatedProducts.js'

let cartManager, productManager, relatedProductsManager

const initializeApp = async () => {
  try {
    const cartElement = document.querySelector('cart-sidebar')
    window.cartElement = cartElement

    relatedProductsManager = new RelatedProductsManager(document, {
      relatedProducts: '#relatedProducts'
    })

    productManager = new ProductManager(document, cartManager, relatedProductsManager, {
      productImage: '#productImage',
      productTitle: '#productTitle',
      productDescription: '#productDescription',
      ratingCount: '#ratingCount',
      reviewCount: '#reviewCount',
      salePrice: '#salePrice',
      originalPrice: '#originalPrice',
      variantLabel: '#variantLabel',
      variantSelect: '#variantSelect',
      stockLimit: '#stockLimit',
      maxStock: '#maxStock',
      addToCartBtn: '#addToCartBtn',
      breadcrumbProduct: '.breadcrumb-list li[aria-current="page"]',
      quantitySection: '#quantitySection',
      quantityInput: '#quantityInput',
      quantityMinus: '#quantityMinus',
      quantityPlus: '#quantityPlus'
    })

    window.cartManager = cartManager
    window.productManager = productManager
    window.relatedProductsManager = relatedProductsManager

    const products = await fetchProducts()
    productManager.setProducts(products)

    if (products.length) {
      const id = productManager.getProductIdFromUrl()
      productManager.selectProduct(id || products[0].id)
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
}

document.addEventListener('DOMContentLoaded', initializeApp)
