let products = []
let relatedProducts = []
let selectedProduct, selectedVariant

const elements = {
  productSelect: document.getElementById('productSelect'),
  productImage: document.getElementById('productImage'),
  productTitle: document.getElementById('productTitle'),
  ratingCount: document.getElementById('ratingCount'),
  reviewCount: document.getElementById('reviewCount'),
  salePrice: document.getElementById('salePrice'),
  originalPrice: document.getElementById('originalPrice'),
  stockStatus: document.getElementById('stockStatus'),
  variantSelect: document.getElementById('variantSelect'),
  quantityInput: document.getElementById('quantityInput'),
  quantityMinus: document.getElementById('quantityMinus'),
  quantityPlus: document.getElementById('quantityPlus'),
  stockLimit: document.getElementById('stockLimit'),
  maxStock: document.getElementById('maxStock'),
  addToCartBtn: document.getElementById('addToCartBtn'),
  buttonText: document.getElementById('buttonText'),
  productDescription: document.getElementById('productDescription'),
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
  elements.variantSelect.innerHTML = '<option value="">Select size</option>'
  elements.addToCartBtn.disabled = true

  selectedProduct?.variants.forEach((variant) => {
    const option = document.createElement('option')
    option.value = variant.id
    option.textContent = `${variant.size} ${variant.stock === 0 ? '(Out of Stock)' : ''}`
    option.disabled = variant.stock === 0
    elements.variantSelect.appendChild(option)
  })
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
    elements.salePrice.textContent = `$${selectedVariant?.originalPrice || 0}`
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
    updateQuantityButton(qty)
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

elements.variantSelect.addEventListener('change', handleVariantSelect)
elements.quantityMinus.addEventListener('click', handleReduceQuantity);
elements.quantityPlus.addEventListener('click', handleAddQuantity);

const selectProduct = (idx) => {
  selectedProduct = products[idx]
  renderProduct()
  relatedProducts = products.filter(e => e.id !== selectedProduct.id)
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
        selectProduct(0)
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
