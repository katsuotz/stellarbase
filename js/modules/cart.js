import { formatPrice } from '../utils/formatters.js'

export class CartManager {
  constructor(container, selectors = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    this.selectors = {
      cartToggle: '[data-cart-toggle]',
      cartCount: '[data-cart-count]',
      ...selectors
    }
    this.cart = []
    this.instanceId = Math.random().toString(36).substr(2, 9)
    this.loadCartFromStorage()
    this.createCartSidebar()
    this.elements = this.getElements()
    this.bindEvents()
    this.updateDisplay()
  }

  createCartSidebar() {
    const cartSidebarHTML = `
      <div id="cartSidebar-${this.instanceId}" data-cart-sidebar class="cart-sidebar hidden">
        <div class="cart-backdrop" data-cart-backdrop></div>
        <div class="cart-content">
          <div class="cart-header">
            <h2>Shopping Cart</h2>
            <button data-cart-close class="close-btn" aria-label="Close cart">×</button>
          </div>

          <div class="cart-body">
            <div data-cart-items class="cart-items"></div>

            <div data-cart-empty class="empty-cart">
              <p>Your cart is empty</p>
              <p class="empty-cart-subtitle">Add some items to get started</p>
            </div>
          </div>

          <div class="cart-footer">
            <div class="cart-total">
              <div class="total-row">
                <span>Total:</span>
                <span data-cart-total class="total-amount">$0.00</span>
              </div>
            </div>
            <button data-checkout-btn class="btn btn-primary btn-lg w-full">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', cartSidebarHTML)
  }

  getElements() {
    const findElement = (selector) => {
      return this.container.querySelector(selector) || document.querySelector(selector)
    }

    const cartSidebar = document.getElementById(`cartSidebar-${this.instanceId}`)

    return {
      cartToggle: findElement(this.selectors.cartToggle),
      closeCart: cartSidebar.querySelector('[data-cart-close]'),
      cartSidebar: cartSidebar,
      cartCount: findElement(this.selectors.cartCount),
      cartItems: cartSidebar.querySelector('[data-cart-items]'),
      emptyCart: cartSidebar.querySelector('[data-cart-empty]'),
      cartTotal: cartSidebar.querySelector('[data-cart-total]'),
      checkoutBtn: cartSidebar.querySelector('[data-checkout-btn]'),
      cartBackdrop: cartSidebar.querySelector('[data-cart-backdrop]')
    }
  }

  loadCartFromStorage() {
    try {
      const savedCart = localStorage.getItem('shopping-cart')
      if (savedCart) {
        this.cart = JSON.parse(savedCart)
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      this.cart = []
    }
  }

  saveCartToStorage() {
    try {
      localStorage.setItem('shopping-cart', JSON.stringify(this.cart))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }

  bindEvents() {
    this.elements.cartToggle?.addEventListener('click', () => this.toggle())
    this.elements.closeCart?.addEventListener('click', () => this.toggle())
    this.elements.cartBackdrop?.addEventListener('click', () => this.toggle())
  }

  toggle() {
    if (this.elements.cartSidebar?.classList.contains('hidden')) {
      this.elements.cartSidebar.classList.remove('hidden')
      document.body.style.overflow = 'hidden'
    } else {
      this.elements.cartSidebar?.classList.add('hidden')
      document.body.style.overflow = null
    }
  }

  addItem(product, variant, quantity) {
    if (!product || !variant || variant.stock === 0) {
      return false
    }

    const existingItemIndex = this.cart.findIndex(item =>
      item.productId === product.id && item.variantId === variant.id
    )

    if (existingItemIndex >= 0) {
      const existingItem = this.cart[existingItemIndex]
      const newQuantity = existingItem.quantity + quantity

      if (newQuantity <= variant.stock) {
        existingItem.quantity = newQuantity
        existingItem.totalPrice = existingItem.price * newQuantity
      } else {
        existingItem.quantity = variant.stock
        existingItem.totalPrice = existingItem.price * variant.stock
      }
    } else {
      const cartItem = {
        productId: product.id,
        variantId: variant.id,
        title: product.title,
        variantLabel: product.variantLabel,
        variant: variant.name,
        price: variant.price,
        quantity: quantity,
        totalPrice: variant.price * quantity,
        image: product.image,
        sku: variant.sku
      }
      this.cart.push(cartItem)
    }

    this.updateDisplay()
    this.saveCartToStorage()
    this.toggle()
    return true
  }

  removeItem(index) {
    if (index >= 0 && index < this.cart.length) {
      this.cart.splice(index, 1)
      this.updateDisplay()
      this.saveCartToStorage()
    }
  }

  updateDisplay() {
    if (!this.elements.cartCount) return

    this.elements.cartCount.textContent = this.getItemCount()

    if (this.cart.length === 0) {
      if (this.elements.cartItems) this.elements.cartItems.style.display = 'none'
      if (this.elements.emptyCart) this.elements.emptyCart.style.display = 'flex'
      if (this.elements.cartTotal) this.elements.cartTotal.textContent = '$0.00'
      if (this.elements.checkoutBtn) this.elements.checkoutBtn.disabled = true
      return
    }

    if (this.elements.cartItems) this.elements.cartItems.style.display = 'flex'
    if (this.elements.emptyCart) this.elements.emptyCart.style.display = 'none'
    if (this.elements.checkoutBtn) this.elements.checkoutBtn.disabled = false

    if (this.elements.cartItems) {
      this.elements.cartItems.innerHTML = this.cart.map((item, index) => `
        <div class="cart-item">
          <img src="${item.image || 'https://placehold.co/400x400?text=No Image'}" alt="${item.title}" class="cart-item-image">
          <div class="cart-item-details">
            <div class="flex">
              <h4 class="cart-item-title">${item.title}</h4>
              <span role="button" class="remove-item" aria-label="Remove item" data-remove-item="${index}" >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </span>
            </div>
            <div class="cart-item-variant">${item.variantLabel}: ${item.variant}</div>
            <div class="cart-item-price-row">
              <span class="cart-item-quantity">Qty: ${item.quantity}</span>
              <span class="cart-item-price">${formatPrice(item.totalPrice)}</span>
            </div>
          </div>
        </div>
      `).join('')

      if (!this.elements.cartItems.hasAttribute('data-events-bound')) {
        this.elements.cartItems.addEventListener('click', (e) => {
          const removeBtn = e.target.closest('[data-remove-item]')
          if (removeBtn) {
            const index = parseInt(removeBtn.getAttribute('data-remove-item'))
            this.removeItem(index)
          }
        })
        this.elements.cartItems.setAttribute('data-events-bound', 'true')
      }
    }

    const total = this.getTotal()
    if (this.elements.cartTotal) {
      this.elements.cartTotal.textContent = formatPrice(total)
    }
  }

  getItemCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  getTotal() {
    return this.cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }
}
