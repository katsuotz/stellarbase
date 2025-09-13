export class ProductManager {
  constructor(container, cartManager, relatedProductsManager = null, selectors = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    this.selectors = {
      productImage: '[data-product-image]',
      productTitle: '[data-product-title]',
      productDescription: '[data-product-description]',
      ratingCount: '[data-rating-count]',
      reviewCount: '[data-review-count]',
      salePrice: '[data-sale-price]',
      originalPrice: '[data-original-price]',
      variantLabel: '[data-variant-label]',
      variantSelect: '[data-variant-select]',
      stockLimit: '[data-stock-limit]',
      maxStock: '[data-max-stock]',
      addToCartBtn: '[data-add-to-cart]',
      breadcrumbProduct: '[data-breadcrumb-product]',
      quantitySection: '[data-quantity-section]',
      quantityInput: '[data-quantity-input]',
      quantityMinus: '[data-quantity-minus]',
      quantityPlus: '[data-quantity-plus]',
      ...selectors
    }
    this.elements = this.getElements()
    this.cartManager = cartManager
    this.relatedProductsManager = relatedProductsManager
    this.products = []
    this.selectedProduct = null
    this.selectedVariant = null
    this.instanceId = Math.random().toString(36).substr(2, 9)
    this.bindEvents()
  }

  getElements() {
    const findElement = (selector) => {
      return this.container.querySelector(selector) || document.querySelector(selector)
    }

    return {
      productImage: findElement(this.selectors.productImage),
      productTitle: findElement(this.selectors.productTitle),
      productDescription: findElement(this.selectors.productDescription),
      ratingCount: findElement(this.selectors.ratingCount),
      reviewCount: findElement(this.selectors.reviewCount),
      salePrice: findElement(this.selectors.salePrice),
      originalPrice: findElement(this.selectors.originalPrice),
      variantLabel: findElement(this.selectors.variantLabel),
      variantSelect: findElement(this.selectors.variantSelect),
      stockLimit: findElement(this.selectors.stockLimit),
      maxStock: findElement(this.selectors.maxStock),
      addToCartBtn: findElement(this.selectors.addToCartBtn),
      breadcrumbProduct: findElement(this.selectors.breadcrumbProduct),
      quantitySection: findElement(this.selectors.quantitySection),
      quantityInput: findElement(this.selectors.quantityInput),
      quantityMinus: findElement(this.selectors.quantityMinus),
      quantityPlus: findElement(this.selectors.quantityPlus)
    }
  }

  bindEvents() {
    this.elements.variantSelect?.addEventListener('change', (e) => this.handleVariantSelect(e))
    this.elements.addToCartBtn?.addEventListener('click', () => this.addToCart())
    
    this.elements.quantityMinus?.addEventListener('click', () => this.handleReduceQuantity())
    this.elements.quantityPlus?.addEventListener('click', () => this.handleAddQuantity())

    if (this.relatedProductsManager) {
      this.relatedProductsManager.setOnProductSelect((productId) => {
        this.selectProduct(productId)
      })
    }
  }

  setProducts(products) {
    this.products = products
    if (this.relatedProductsManager) {
      this.relatedProductsManager.setProducts(products)
    }
  }

  selectProduct(id) {
    this.selectedProduct = this.products.find(e => e.id === id)
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
    
    if (this.relatedProductsManager) {
      this.relatedProductsManager.render(this.selectedProduct?.id)
    }
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  renderPrice() {
    if (!this.elements.salePrice) return

    if (this.selectedProduct.isOnSale) {
      this.elements.salePrice.textContent = `$${this.selectedProduct?.salePrice || 0}`
      if (this.elements.originalPrice) {
        this.elements.originalPrice.textContent = `$${this.selectedProduct?.basePrice || 0}`
        this.elements.originalPrice.classList.remove('hidden')
      }
    } else {
      this.elements.salePrice.textContent = `$${this.selectedProduct?.basePrice || 0}`
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
        this.elements.salePrice.textContent = `$${this.selectedVariant?.price || 0}`
      }
      if (this.elements.originalPrice) {
        this.elements.originalPrice.textContent = `$${this.selectedVariant?.originalPrice || 0}`
        this.elements.originalPrice.classList.remove('hidden')
      }
    } else {
      if (this.elements.salePrice) {
        this.elements.salePrice.textContent = `$${this.selectedVariant?.price || 0}`
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

  addToCart() {
    const quantity = this.getQuantityValue()
    const success = this.cartManager?.addItem(this.selectedProduct, this.selectedVariant, quantity)
    if (success) {
      console.log('Added to cart:', this.selectedProduct, this.selectedVariant)
    }
  }
}
