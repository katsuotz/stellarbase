let products = []
let relatedProducts = []
let selectedProduct, selectedVariant
let cart = []

const elements = {
  productSelect: document.getElementById('productSelect'),
  productImage: document.getElementById('productImage'),
  productTitle: document.getElementById('productTitle'),
  ratingCount: document.getElementById('ratingCount'),
  reviewCount: document.getElementById('reviewCount'),
  salePrice: document.getElementById('salePrice'),
  originalPrice: document.getElementById('originalPrice'),
  stockStatus: document.getElementById('stockStatus'),
  variantLabel: document.getElementById('variantLabel'),
  variantSelect: document.getElementById('variantSelect'),
  quantityInput: document.getElementById('quantityInput'),
  quantityMinus: document.getElementById('quantityMinus'),
  quantityPlus: document.getElementById('quantityPlus'),
  stockLimit: document.getElementById('stockLimit'),
  maxStock: document.getElementById('maxStock'),
  addToCartBtn: document.getElementById('addToCartBtn'),
  buttonText: document.getElementById('buttonText'),
  productDescription: document.getElementById('productDescription'),
  cartToggle: document.getElementById('cartToggle'),
  closeCart: document.getElementById('closeCart'),
  cartSidebar: document.getElementById('cartSidebar'),
  cartCount: document.getElementById('cartCount'),
  cartItems: document.getElementById('cartItems'),
  emptyCart: document.getElementById('emptyCart'),
  cartTotal: document.getElementById('cartTotal'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  relatedProducts: document.getElementById('relatedProducts'),
}

const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return 'Price not available'
  }
  return `$${price.toFixed(2)}`
}

const renderProduct = () => {
  elements.productImage.src = selectedProduct?.image || 'https://placehold.co/400x400?text=No+Image'
  elements.productTitle.textContent = selectedProduct?.title || 'Product name unavailable'
  elements.productDescription.textContent = selectedProduct?.description || '-'
  renderPrice()
  renderVariant()
  elements.ratingCount.textContent = selectedProduct?.rating
  const breadcrumbProduct = document.querySelector('.breadcrumb-list li[aria-current="page"]');
  if (breadcrumbProduct) {
    breadcrumbProduct.textContent = selectedProduct?.title || 'Product name unavailable';
  }
  elements.reviewCount.textContent = `(${selectedProduct?.reviews || 0} reviews)`
  elements.quantityInput.value = 1
  renderRelatedProducts()
}

const renderPrice = () => {
  if (selectedProduct.isOnSale) {
    elements.salePrice.textContent = `$${selectedProduct?.salePrice || 0}`
    elements.originalPrice.textContent = `$${selectedProduct?.basePrice || 0}`
    elements.originalPrice.classList.remove('hidden')
  } else {
    elements.salePrice.textContent = `$${selectedProduct?.basePrice || 0}`
    elements.originalPrice.classList.add('hidden')
  }
}

const renderVariant = () => {
  selectedVariant = undefined
  elements.variantLabel.textContent = selectedProduct.variantLabel
  elements.variantSelect.innerHTML = `<option value="">Select ${selectedProduct.variantLabel.toLowerCase()}</option>`
  elements.addToCartBtn.disabled = true

  selectedProduct?.variants.forEach((variant) => {
    const option = document.createElement('option')
    option.value = variant.id
    option.textContent = `${variant.name} ${variant.stock === 0 ? '(Out of Stock)' : ''}`
    option.disabled = variant.stock === 0
    elements.variantSelect.appendChild(option)
  })
}

const renderRelatedProducts = () => {
  elements.relatedProducts.innerHTML = relatedProducts.map(product => `
    <div class="related-item card" onclick="selectProduct(${product.id})">
      <img src="${product.image || 'https://placehold.co/400x400?text=No Image'}" alt="" class="related-image">
      <div class="card-body flex justify-between items-center">
        <div>
          <h4>${product.title}</h4>
          <p>$24.99</p>
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

const handleVariantSelect = (e) => {
  selectedVariant = selectedProduct.variants.find(variant => variant.id === e.target.value)
  if (!selectedVariant) {
    elements.stockLimit.classList.add('hidden')
    elements.addToCartBtn.disabled = true
    return
  }

  if (selectedVariant.originalPrice) {
    elements.salePrice.textContent = `$${selectedVariant?.price || 0}`
    elements.originalPrice.textContent = `$${selectedVariant?.originalPrice || 0}`
    elements.originalPrice.classList.remove('hidden')
  } else {
    elements.salePrice.textContent = `$${selectedVariant?.price || 0}`
    elements.originalPrice.classList.add('hidden')
  }

  const {stock} = selectedVariant

  if (stock > 0 && stock <= 10) {
    elements.maxStock.textContent = stock
    elements.stockLimit.classList.remove('hidden')
  } else {
    elements.stockLimit.classList.add('hidden')
  }
  elements.addToCartBtn.disabled = false
  let qty = parseInt(elements.quantityInput.value)
  if (qty > stock) qty = stock
  updateQuantityButton(qty)
}

const handleReduceQuantity = () => {
  let qty = parseInt(elements.quantityInput.value)
  if (qty > 1) {
    qty--;
    updateQuantityButton(qty)
  }
}

const handleAddQuantity = () => {
  const maxStock = selectedVariant ? selectedVariant.stock : 0;
  let qty = parseInt(elements.quantityInput.value)
  if (qty < maxStock) {
    qty++;
    updateQuantityButton(qty, maxStock)
  }
}

const updateQuantityButton = (qty, maxStock = null) => {
  elements.quantityMinus.disabled = false
  elements.quantityPlus.disabled = false
  if (qty === 1) {
    elements.quantityMinus.disabled = true
  }
  if (qty === maxStock) {
    elements.quantityPlus.disabled = true
  }
  elements.quantityInput.value = qty
}

const toggleCart = () => {
  if (elements.cartSidebar.classList.contains('hidden')) {
    elements.cartSidebar.classList.remove('hidden')
    document.body.style.overflow = 'hidden'
  } else {
    elements.cartSidebar.classList.add('hidden')
    document.body.style.overflow = null
  }
}

const addToCart = () => {
  console.log(selectedProduct, selectedVariant)
  if (!selectedProduct || !selectedVariant || selectedVariant.stock === 0) {
    return
  }

  const existingItemIndex = cart.findIndex(item =>
    item.productId === selectedProduct.id && item.variantId === selectedVariant.id
  )
  const qty = parseInt(elements.quantityInput.value)

  if (existingItemIndex >= 0) {
    const existingItem = cart[existingItemIndex]
    const newQuantity = existingItem.quantity + qty

    if (newQuantity <= selectedVariant.stock) {
      existingItem.quantity = newQuantity
      existingItem.totalPrice = existingItem.price * newQuantity
    } else {
      existingItem.quantity = selectedVariant.stock
    }
  } else {
    const cartItem = {
      productId: selectedProduct.id,
      variantId: selectedVariant.id,
      title: selectedProduct.title,
      variantLabel: selectedProduct.variantLabel,
      variant: selectedVariant.name,
      price: selectedVariant.price,
      quantity: qty,
      totalPrice: selectedVariant.price * qty,
      image: selectedProduct.image,
      sku: selectedVariant.sku
    }
    cart.push(cartItem)
  }

  updateCartDisplay()
  toggleCart()
}

const updateCartDisplay = () => {
  if (!elements.cartCount) return

  elements.cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (cart.length === 0) {
    elements.cartItems.style.display = 'none'
    elements.emptyCart.style.display = 'flex'
    elements.cartTotal.textContent = '$0.00'
    if (elements.checkoutBtn) {
      elements.checkoutBtn.disabled = true
    }
    return
  }

  elements.cartItems.style.display = 'flex'
  elements.emptyCart.style.display = 'none'
  if (elements.checkoutBtn) {
    elements.checkoutBtn.disabled = false
  }

  elements.cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image || 'https://placehold.co/400x400?text=No Image'}" alt="${item.title}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="flex">
          <h4 class="cart-item-title">${item.title}</h4>
          <span role="button" class="remove-item" aria-label="Remove item" onclick="removeFromCart(${index})" >
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

  const total = cart.reduce((sum, item) => sum + item.totalPrice, 0)
  elements.cartTotal.textContent = formatPrice(total)
}

const removeFromCart = (index) => {
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1)
    updateCartDisplay()
  }
}

elements.variantSelect.addEventListener('change', handleVariantSelect)
elements.quantityMinus.addEventListener('click', handleReduceQuantity)
elements.quantityPlus.addEventListener('click', handleAddQuantity)
elements.cartToggle.addEventListener('click', toggleCart)
elements.closeCart.addEventListener('click', toggleCart)
elements.addToCartBtn.addEventListener('click', addToCart)

const selectProduct = (id) => {
  selectedProduct = products.find(e => e.id === id)
  relatedProducts = products.filter(e => e.id !== id)
  renderProduct()
}

const fetchData = () => {
  fetch('./json/products.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      products = data.products
      if (products.length) {
        selectProduct(products[0].id)
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

const initializeApp = () => {
  fetchData()
}

document.addEventListener('DOMContentLoaded', initializeApp)
