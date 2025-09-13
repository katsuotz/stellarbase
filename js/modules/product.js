import { formatPrice } from "../utils/formatters.js";

export class ProductElement extends HTMLElement {
  constructor() {
    super()
    this.cartElement = null
    this.relatedProductsElement = null
    this.products = []
    this.selectedProduct = null
    this.selectedVariant = null
    this.instanceId = Math.random().toString(36).substr(2, 9)
  }

  connectedCallback() {
    this.createProductSection()
    this.elements = this.getElements()
    this.bindEvents()
  }

  createProductSection() {
    this.innerHTML = `
      <section class="product-section">
        <div class="product-grid">
          <!-- Product Image -->
          <div class="product-image-section">
            <div class="product-image-container">
              <img data-product-image src="https://placehold.co/400x400?text=Loading..." alt=""
                   class="product-image">
            </div>
          </div>

          <!-- Product Details -->
          <div class="product-details-section">
            <div class="product-header">
              <h1 data-product-title class="product-title">Loading...</h1>
              <div class="product-rating">
                <div class="stars">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                       aria-hidden="true" data-slot="icon">
                    <path fill-rule="evenodd"
                          d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                          clip-rule="evenodd"></path>
                  </svg>
                  <span data-rating-count class="rating-count"></span>
                </div>
                <span data-review-count class="review-count">(0 reviews)</span>
              </div>
            </div>

            <!-- Price Section -->
            <div class="price-section">
              <div class="price-display">
                <span data-sale-price class="current-price">$0.00</span>
                <span data-original-price class="original-price hidden">$0.00</span>
              </div>
            </div>

            <!-- Variant Selector -->
            <div class="variant-section">
              <label for="variantSelect" class="form-label" data-variant-label>Size:</label>
              <select id="variantSelect" data-variant-select class="form-control">
                <option value="">Select size</option>
              </select>
            </div>

            <!-- Quantity Selector -->
            <div class="quantity-section hidden" data-quantity-section>
              <label class="form-label">Quantity:</label>
              <div class="quantity-controls">
                <button data-quantity-minus class="quantity-btn btn btn-outline" type="button" disabled>−
                </button>
                <input data-quantity-input type="number" value="1" min="1"
                       class="quantity-input form-control" readonly>
                <button data-quantity-plus class="quantity-btn btn btn-outline" type="button" disabled> +
                </button>
              </div>
              <div data-stock-limit class="stock-limit hidden">Only <span data-max-stock>0</span> left in stock
              </div>
            </div>

            <!-- Add to Cart Button -->
            <div class="add-to-cart-section">
              <button data-add-to-cart class="btn btn-primary btn-lg w-full" disabled>
                Add to Cart
              </button>
            </div>

            <!-- Product Description -->
            <div class="product-description">
              <h3>Description</h3>
              <p data-product-description>-</p>
            </div>
          </div>
        </div>
      </section>
    `
    this.id = this.instanceId
  }

  setCartElement(cartElement) {
    this.cartElement = cartElement
  }

  setRelatedProductsElement(relatedProductsElement) {
    this.relatedProductsElement = relatedProductsElement
    if (this.relatedProductsElement) {
      this.relatedProductsElement.setOnProductSelect((productId) => {
        this.selectProduct(productId)
      })
    }
  }

  getElements() {
    return {
      productImage: this.querySelector('[data-product-image]'),
      productTitle: this.querySelector('[data-product-title]'),
      productDescription: this.querySelector('[data-product-description]'),
      ratingCount: this.querySelector('[data-rating-count]'),
      reviewCount: this.querySelector('[data-review-count]'),
      salePrice: this.querySelector('[data-sale-price]'),
      originalPrice: this.querySelector('[data-original-price]'),
      variantLabel: this.querySelector('[data-variant-label]'),
      variantSelect: this.querySelector('[data-variant-select]'),
      stockLimit: this.querySelector('[data-stock-limit]'),
      maxStock: this.querySelector('[data-max-stock]'),
      addToCartBtn: this.querySelector('[data-add-to-cart]'),
      breadcrumbProduct: document.querySelector('[data-breadcrumb-product]'),
      quantitySection: this.querySelector('[data-quantity-section]'),
      quantityInput: this.querySelector('[data-quantity-input]'),
      quantityMinus: this.querySelector('[data-quantity-minus]'),
      quantityPlus: this.querySelector('[data-quantity-plus]')
    }
  }

  bindEvents() {
    this.elements.variantSelect?.addEventListener('change', (e) => this.handleVariantSelect(e))
    this.elements.addToCartBtn?.addEventListener('click', () => this.addToCart())
    
    this.elements.quantityMinus?.addEventListener('click', () => this.handleReduceQuantity())
    this.elements.quantityPlus?.addEventListener('click', () => this.handleAddQuantity())
  }

  setProducts(products) {
    this.products = products
    if (this.relatedProductsElement) {
      this.relatedProductsElement.setProducts(products)
    }
  }

  selectProduct(id) {
    this.selectedProduct = this.products.find(e => e.id === id)
    this.updateUrl(id)
    this.render()
  }

  render() {
    if (this.elements.productImage) {
      this.elements.productImage.src = this.selectedProduct?.image || 'https://placehold.co/400x400?text=No+Image'
    }
    if (this.elements.productTitle) {
      this.elements.productTitle.textContent = this.selectedProduct?.title || 'Product name unavailable'
    }
    if (this.elements.productDescription) {
      this.elements.productDescription.textContent = this.selectedProduct?.description || '-'
    }
    
    this.renderPrice()
    this.renderVariant()
    this.updateMetaTags()
    
    if (this.elements.ratingCount) {
      this.elements.ratingCount.textContent = this.selectedProduct?.rating
    }
    
    if (this.elements.breadcrumbProduct) {
      this.elements.breadcrumbProduct.textContent = this.selectedProduct?.title || 'Product name unavailable'
    }
    
    if (this.elements.reviewCount) {
      this.elements.reviewCount.textContent = `(${this.selectedProduct?.reviews || 0} reviews)`
    }
    
    this.setQuantityValue(1)
    this.hideQuantity()
    
    if (this.relatedProductsElement) {
      this.relatedProductsElement.render(this.selectedProduct?.id)
    }
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  renderPrice() {
    if (!this.elements.salePrice) return

    if (this.selectedProduct.isOnSale) {
      this.elements.salePrice.textContent = `${formatPrice(this.selectedProduct?.salePrice)}`
      if (this.elements.originalPrice) {
        this.elements.originalPrice.textContent = `${formatPrice(this.selectedProduct?.basePrice)}`
        this.elements.originalPrice.classList.remove('hidden')
      }
    } else {
      this.elements.salePrice.textContent = `${formatPrice(this.selectedProduct?.basePrice)}`
      if (this.elements.originalPrice) {
        this.elements.originalPrice.classList.add('hidden')
      }
    }
  }

  renderVariant() {
    if (!this.elements.variantSelect || !this.selectedProduct) return

    this.selectedVariant = undefined
    if (this.elements.variantLabel) {
      this.elements.variantLabel.textContent = this.selectedProduct.variantLabel
    }
    
    this.elements.variantSelect.innerHTML = `<option value="">Select ${this.selectedProduct.variantLabel.toLowerCase()}</option>`
    
    if (this.elements.addToCartBtn) {
      this.elements.addToCartBtn.textContent = 'Add to Cart'
      this.elements.addToCartBtn.disabled = true
    }

    this.selectedProduct?.variants.forEach((variant) => {
      const option = document.createElement('option')
      option.value = variant.id
      option.textContent = `${variant.name} ${variant.stock === 0 ? '(Out of Stock)' : ''}`
      option.disabled = variant.stock === 0
      this.elements.variantSelect.appendChild(option)
    })
  }


  handleVariantSelect(e) {
    this.selectedVariant = this.selectedProduct.variants.find(variant => variant.id === e.target.value)
    if (!this.selectedVariant) {
      this.elements.stockLimit?.classList.add('hidden')
      if (this.elements.addToCartBtn) {
        this.elements.addToCartBtn.disabled = true
      }
      return
    }

    if (this.selectedVariant.originalPrice) {
      if (this.elements.salePrice) {
        this.elements.salePrice.textContent = `${formatPrice(this.selectedVariant?.price)}`
      }
      if (this.elements.originalPrice) {
        this.elements.originalPrice.textContent = `${formatPrice(this.selectedVariant?.originalPrice)}`
        this.elements.originalPrice.classList.remove('hidden')
      }
    } else {
      if (this.elements.salePrice) {
        this.elements.salePrice.textContent = `${formatPrice(this.selectedVariant?.price)}`
      }
      if (this.elements.originalPrice) {
        this.elements.originalPrice.classList.add('hidden')
      }
    }

    const {stock} = this.selectedVariant

    if (stock > 0 && stock <= 10) {
      if (this.elements.maxStock) {
        this.elements.maxStock.textContent = stock
      }
      this.elements.stockLimit?.classList.remove('hidden')
    } else {
      this.elements.stockLimit?.classList.add('hidden')
    }
    
    let qty = this.getQuantityValue()
    if (qty > stock) qty = stock
    this.updateQuantityButtons(qty, stock)

    if (this.selectedVariant?.price && stock) {
      if (this.elements.addToCartBtn) {
        this.elements.addToCartBtn.textContent = 'Add to Cart'
        this.elements.addToCartBtn.disabled = false
      }
      this.showQuantity()
    } else {
      if (this.elements.addToCartBtn) {
        this.elements.addToCartBtn.textContent = 'Product is currently not for sale'
        this.elements.addToCartBtn.disabled = true
      }
      this.hideQuantity()
    }
  }

  handleReduceQuantity() {
    let qty = parseInt(this.elements.quantityInput.value)
    if (qty > 1) {
      qty--
      this.updateQuantityButtons(qty)
    }
  }

  handleAddQuantity() {
    const maxStock = this.selectedVariant ? this.selectedVariant.stock : 0
    let qty = parseInt(this.elements.quantityInput.value)
    if (qty < maxStock) {
      qty++
      this.updateQuantityButtons(qty, maxStock)
    }
  }

  updateQuantityButtons(qty, maxStock = null) {
    if (!this.elements.quantityMinus || !this.elements.quantityPlus || !this.elements.quantityInput) return

    this.elements.quantityMinus.disabled = false
    this.elements.quantityPlus.disabled = false
    
    if (qty === 1) {
      this.elements.quantityMinus.disabled = true
    }
    if (qty === maxStock) {
      this.elements.quantityPlus.disabled = true
    }
    this.elements.quantityInput.value = qty
  }

  showQuantity() {
    this.elements.quantitySection?.classList.remove('hidden')
  }

  hideQuantity() {
    this.elements.quantitySection?.classList.add('hidden')
  }

  setQuantityValue(value) {
    if (this.elements.quantityInput) {
      this.elements.quantityInput.value = value
    }
  }

  getQuantityValue() {
    return this.elements.quantityInput ? parseInt(this.elements.quantityInput.value) : 1
  }

  updateMetaTags() {
    if (!this.selectedProduct) return

    const title = `${this.selectedProduct.title} - Stellarbase Store`
    const description = this.selectedProduct.description
    const keywords = this.selectedProduct.tags ? this.selectedProduct.tags.join(', ') : ''
    const image = this.selectedProduct.image || 'https://placehold.co/1200x630?text=Stellarbase+Store'

    document.title = title
    this.updateMetaTag('name', 'description', description)
    this.updateMetaTag('name', 'keywords', keywords)
    this.updateMetaTag('property', 'og:title', title)
    this.updateMetaTag('property', 'og:description', description)
    this.updateMetaTag('property', 'og:image', image)
    this.updateMetaTag('name', 'twitter:title', title)
    this.updateMetaTag('name', 'twitter:description', description)
    this.updateMetaTag('name', 'twitter:image', image)
  }

  updateMetaTag(attribute, attributeValue, content) {
    let metaTag = document.querySelector(`meta[${attribute}="${attributeValue}"]`)
    if (metaTag) {
      metaTag.setAttribute('content', content)
    } else {
      metaTag = document.createElement('meta')
      metaTag.setAttribute(attribute, attributeValue)
      metaTag.setAttribute('content', content)
      document.head.appendChild(metaTag)
    }
  }

  getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search)
    const productId = urlParams.get('productId')
    return productId ? parseInt(productId) : null
  }

  updateUrl(productId) {
    const url = new URL(window.location)
    url.searchParams.set('productId', productId)
    window.history.pushState({ productId }, '', url)
  }

  addToCart() {
    const quantity = this.getQuantityValue()
    this.cartElement?.addItem(this.selectedProduct, this.selectedVariant, quantity)
  }
}

customElements.define('product-detail', ProductElement)
