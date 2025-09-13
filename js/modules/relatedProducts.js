import { formatPrice } from '../utils/formatters.js'

export class RelatedProductsElement extends HTMLElement {
  constructor() {
    super()
    this.products = []
    this.onProductSelect = null
  }

  connectedCallback() {
    this.createRelatedProductsSection()
    this.elements = this.getElements()
    this.bindEvents()
  }

  createRelatedProductsSection() {
    this.innerHTML = `
      <section class="related-products">
        <h2>Related Products</h2>
        <div class="related-grid" data-related-products></div>
      </section>
    `
  }

  getElements() {
    return {
      relatedProducts: this.querySelector('[data-related-products]')
    }
  }

  bindEvents() {
    this.addEventListener('click', (e) => {
      const relatedItem = e.target.closest('[data-product-id]')
      if (relatedItem) {
        const productId = parseInt(relatedItem.getAttribute('data-product-id'))
        if (this.onProductSelect) {
          this.onProductSelect(productId)
        }
      }
    })
  }

  setProducts(products) {
    this.products = products
  }

  setOnProductSelect(callback) {
    this.onProductSelect = callback
  }

  render(excludeProductId = null) {
    if (!this.elements.relatedProducts) return

    const relatedProducts = excludeProductId
      ? this.products.filter(product => product.id !== excludeProductId)
      : this.products

    this.elements.relatedProducts.innerHTML = relatedProducts.map(product => `
      <div class="related-item card" data-product-id="${product.id}">
        <img src="${product.image || 'https://placehold.co/400x400?text=No Image'}" alt="" class="related-image">
        <div class="card-body flex justify-between items-center">
          <div>
            <h4>${product.title}</h4>
            <p>${product.isOnSale ? formatPrice(product.salePrice) : formatPrice(product.basePrice)}</p>
          </div>
          <div class="stars">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
               <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clip-rule="evenodd"></path>
            </svg>
            <span class="rating-count">${product.rating}</span>
          </div>
        </div>
      </div>`).join('')
  }
}

customElements.define('related-products', RelatedProductsElement)
