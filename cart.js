(function () {
  const CART_KEY = 'abc_cart';

  const cartOverlay = document.getElementById('cart-overlay');
  const cartContent = document.getElementById('cart-content');
  const cartBadge = document.getElementById('cart-badge');
  const openCartBtn = document.getElementById('open-cart');
  const closeCartBtn = document.getElementById('cart-close');
  const toast = document.getElementById('toast');
  const ariaLive = document.getElementById('aria-live');

  function getCart() {
    try {
      const cart = localStorage.getItem(CART_KEY);
      return cart ? JSON.parse(cart) : { items: [] };
    } catch (e) {
      console.error('Error reading cart from localStorage:', e);
      return { items: [] };
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }

  function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    if (cartBadge) {
      cartBadge.textContent = totalItems;
    }
  }

  function addToCart(item) {
    const cart = getCart();
    const existingIndex = cart.items.findIndex((i) => i.id === item.id);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += 1;
    } else {
      cart.items.push({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        type: item.type,
        quantity: 1,
      });
    }

    saveCart(cart);
    updateCartBadge();
    showToast(`${item.name} added to cart!`, 'success');
    announceToScreenReader(`${item.name} added to cart`);
  }

  function updateQuantity(itemId, change) {
    const cart = getCart();
    const itemIndex = cart.items.findIndex((i) => i.id === itemId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += change;

      if (cart.items[itemIndex].quantity <= 0) {
        const itemName = cart.items[itemIndex].name;
        cart.items.splice(itemIndex, 1);
        announceToScreenReader(`${itemName} removed from cart`);
      }

      saveCart(cart);
      updateCartBadge();
      renderCart();
    }
  }

  function removeFromCart(itemId) {
    const cart = getCart();
    const itemIndex = cart.items.findIndex((i) => i.id === itemId);

    if (itemIndex > -1) {
      const itemName = cart.items[itemIndex].name;
      cart.items.splice(itemIndex, 1);
      saveCart(cart);
      updateCartBadge();
      renderCart();
      announceToScreenReader(`${itemName} removed from cart`);
    }
  }

  function calculateTotal() {
    const cart = getCart();
    return cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  function renderCart() {
    if (!cartContent) return;

    const cart = getCart();

    if (cart.items.length === 0) {
      cartContent.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty.</p>
          <p>Browse our <a href="membership.html">memberships</a> or <a href="gallery.html">equipment</a> to get started!</p>
        </div>
      `;
      return;
    }

    let html = '<div class="cart-items">';

    cart.items.forEach((item) => {
      const subtotal = (item.price * item.quantity).toFixed(2);
      html += `
        <div class="cart-item" data-item-id="${item.id}">
          <div class="cart-item-info">
            <div class="cart-item-name">${escapeHtml(item.name)}</div>
            <div class="cart-item-type">${escapeHtml(item.type)}</div>
          </div>
          <div class="cart-item-controls">
            <button class="cart-qty-btn" data-action="decrease" data-id="${
              item.id
            }" aria-label="Decrease quantity">−</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="cart-qty-btn" data-action="increase" data-id="${
              item.id
            }" aria-label="Increase quantity">+</button>
          </div>
          <div class="cart-item-price">$${subtotal}</div>
          <button class="cart-remove" data-action="remove" data-id="${
            item.id
          }" aria-label="Remove ${escapeHtml(
        item.name
      )} from cart">&times;</button>
        </div>
      `;
    });

    html += '</div>';

    const total = calculateTotal().toFixed(2);
    html += `
      <div class="cart-total">
        <span>Total:</span>
        <span>$${total}</span>
      </div>
      <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="alert('Checkout functionality would be implemented here. Thank you for shopping with ABC Fitness!')">
        Proceed to Checkout
      </button>
    `;

    cartContent.innerHTML = html;

    cartContent.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', handleCartAction);
    });
  }

  function handleCartAction(e) {
    const action = e.target.dataset.action;
    const itemId = e.target.dataset.id;

    switch (action) {
      case 'increase':
        updateQuantity(itemId, 1);
        break;
      case 'decrease':
        updateQuantity(itemId, -1);
        break;
      case 'remove':
        removeFromCart(itemId);
        break;
    }
  }

  function openCart() {
    renderCart();
    if (cartOverlay) {
      cartOverlay.classList.add('open');
      cartOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (closeCartBtn) {
        closeCartBtn.focus();
      }
    }
  }

  function closeCart() {
    if (cartOverlay) {
      cartOverlay.classList.remove('open');
      cartOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (openCartBtn) {
        openCartBtn.focus();
      }
    }
  }

  function showToast(message, type = 'success') {
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function announceToScreenReader(message) {
    if (ariaLive) {
      ariaLive.textContent = message;
      setTimeout(() => {
        ariaLive.textContent = '';
      }, 1000);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function handleAddToCartClick(e) {
    const btn = e.target.closest('.btn-add-cart');
    if (!btn) return;

    const item = {
      id: btn.dataset.itemId,
      name: btn.dataset.name,
      price: btn.dataset.price,
      type: btn.dataset.type,
    };

    if (item.id && item.name && item.price && item.type) {
      addToCart(item);
    }
  }

  function init() {
    updateCartBadge();

    document.addEventListener('click', handleAddToCartClick);

    if (openCartBtn) {
      openCartBtn.addEventListener('click', openCart);
    }

    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', closeCart);
    }

    if (cartOverlay) {
      cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
          closeCart();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'Escape' &&
        cartOverlay &&
        cartOverlay.classList.contains('open')
      ) {
        closeCart();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ABCCart = {
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    openCart,
    closeCart,
  };
})();
