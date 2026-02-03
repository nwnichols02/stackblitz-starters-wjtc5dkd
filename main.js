(function () {
  const SUBSCRIBERS_KEY = 'abc_subscribers';
  const FEEDBACK_KEY = 'abc_feedback';
  const PROMO_DISMISSED_KEY = 'promoDismissed';

  function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');

    if (!navToggle || !mainNav) return;

    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    mainNav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
      s;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  function highlightActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const isActive =
        currentPath.endsWith(href) ||
        (currentPath === '/' && href === 'index.html') ||
        (currentPath.endsWith('/') && href === 'index.html');

      if (isActive) {
        link.classList.add('nav-link--active');
      } else {
        link.classList.remove('nav-link--active');
      }
    });
  }

  function getSubscribers() {
    try {
      const subscribers = localStorage.getItem(SUBSCRIBERS_KEY);
      return subscribers ? JSON.parse(subscribers) : [];
    } catch (e) {
      console.error('Error reading subscribers:', e);
      return [];
    }
  }

  function saveSubscriber(email) {
    try {
      const subscribers = getSubscribers();
      if (!subscribers.includes(email.toLowerCase())) {
        subscribers.push(email.toLowerCase());
        localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers));
      }
      return true;
    } catch (e) {
      console.error('Error saving subscriber:', e);
      return false;
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function handleSubscribeSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const messageEl =
      form.nextElementSibling || form.querySelector('.subscribe-message');
    const email = emailInput.value.trim();

    let message = messageEl;
    if (!message || !message.classList.contains('subscribe-message')) {
      message = document.getElementById(
        form.id.replace('subscribe-form', 'subscribe-message')
      );
    }

    if (!email || !isValidEmail(email)) {
      emailInput.classList.add('error');
      if (message) {
        message.textContent = 'Please enter a valid email address.';
        message.className = 'subscribe-message error';
        message.style.display = 'block';
      }
      return;
    }

    const subscribers = getSubscribers();
    if (subscribers.includes(email.toLowerCase())) {
      if (message) {
        message.textContent =
          "You're already subscribed! Thank you for your interest.";
        message.className = 'subscribe-message success';
        message.style.display = 'block';
      }
      emailInput.value = '';
      emailInput.classList.remove('error');
      return;
    }

    if (saveSubscriber(email)) {
      emailInput.value = '';
      emailInput.classList.remove('error');
      if (message) {
        message.textContent =
          'Thank you for subscribing! Check your inbox for updates.';
        message.className = 'subscribe-message success';
        message.style.display = 'block';
      }
      showToast('Successfully subscribed!', 'success');
    } else {
      if (message) {
        message.textContent = 'Something went wrong. Please try again.';
        message.className = 'subscribe-message error';
        message.style.display = 'block';
      }
    }
  }

  function initSubscribeForms() {
    const mainForm = document.getElementById('subscribe-form-main');
    if (mainForm) {
      mainForm.addEventListener('submit', handleSubscribeSubmit);
    }

    const footerForm = document.getElementById('subscribe-form-footer');
    if (footerForm) {
      footerForm.addEventListener('submit', handleSubscribeSubmit);
    }
  }

  function initPromoBanner() {
    const promoBanner = document.getElementById('promo-banner');
    const promoDismiss = document.getElementById('promo-dismiss');

    if (!promoBanner) return;

    const isDismissed = sessionStorage.getItem(PROMO_DISMISSED_KEY);

    if (isDismissed) {
      promoBanner.classList.add('hidden');
      return;
    }

    if (promoDismiss) {
      promoDismiss.addEventListener('click', () => {
        promoBanner.classList.add('hidden');
        sessionStorage.setItem(PROMO_DISMISSED_KEY, 'true');
      });
    }
  }

  function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const customOrderCheckbox = document.getElementById('custom-order');
    const customOrderFields = document.getElementById('custom-order-fields');

    if (!contactForm) return;

    if (customOrderCheckbox && customOrderFields) {
      customOrderCheckbox.addEventListener('change', () => {
        customOrderFields.style.display = customOrderCheckbox.checked
          ? 'block'
          : 'none';
      });
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      console.log('Contact form submitted:', data);

      const messageEl = document.getElementById('contact-form-message');
      if (messageEl) {
        messageEl.textContent =
          "Thank you for your message! We'll get back to you within 24-48 hours.";
        messageEl.style.display = 'block';
      }

      contactForm.reset();
      if (customOrderFields) {
        customOrderFields.style.display = 'none';
      }

      showToast('Message sent successfully!', 'success');
    });
  }

  function getFeedback() {
    try {
      const feedback = localStorage.getItem(FEEDBACK_KEY);
      return feedback ? JSON.parse(feedback) : [];
    } catch (e) {
      console.error('Error reading feedback:', e);
      return [];
    }
  }

  function saveFeedback(feedbackItem) {
    try {
      const feedback = getFeedback();
      feedback.unshift({
        ...feedbackItem,
        id: Date.now(),
        date: new Date().toLocaleDateString(),
      });
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
      return true;
    } catch (e) {
      console.error('Error saving feedback:', e);
      return false;
    }
  }

  function renderFeedbackList() {
    const feedbackList = document.getElementById('feedback-list');
    const noFeedbackMessage = document.getElementById('no-feedback-message');

    if (!feedbackList) return;

    const feedback = getFeedback();

    if (feedback.length === 0) {
      if (noFeedbackMessage) {
        noFeedbackMessage.style.display = 'block';
      }
      return;
    }

    if (noFeedbackMessage) {
      noFeedbackMessage.style.display = 'none';
    }

    const recentFeedback = feedback.slice(0, 10);

    let html = '';
    recentFeedback.forEach((item) => {
      const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
      html += `
        <article class="feedback-item">
          <div class="feedback-header">
            <span class="feedback-author">${escapeHtml(item.name)}</span>
            <span class="feedback-rating" aria-label="${
              item.rating
            } out of 5 stars">${stars}</span>
          </div>
          <p class="feedback-comment">${escapeHtml(item.comment)}</p>
        </article>
      `;
    });

    feedbackList.innerHTML = html;
  }

  function initFeedbackForm() {
    const feedbackForm = document.getElementById('feedback-form');

    if (!feedbackForm) return;

    renderFeedbackList();

    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(feedbackForm);
      const name = formData.get('name').trim();
      const rating = parseInt(formData.get('rating'), 10);
      const comment = formData.get('comment').trim();

      if (!name || !rating || !comment) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const feedbackItem = { name, rating, comment };

      if (saveFeedback(feedbackItem)) {
        feedbackForm.reset();

        const messageEl = document.getElementById('feedback-form-message');
        if (messageEl) {
          messageEl.textContent =
            'Thank you for your feedback! We appreciate hearing from you.';
          messageEl.style.display = 'block';

          setTimeout(() => {
            messageEl.style.display = 'none';
          }, 5000);
        }

        renderFeedbackList();

        showToast('Feedback submitted successfully!', 'success');
      } else {
        showToast('Error submitting feedback. Please try again.', 'error');
      }
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });

          history.pushState(null, null, targetId);
        }
      });
    });
  }

  function init() {
    initMobileNav();
    highlightActiveNav();
    initSubscribeForms();
    initPromoBanner();
    initContactForm();
    initFeedbackForm();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
