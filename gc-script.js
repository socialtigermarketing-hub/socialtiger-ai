/* ============================================================
   GRAHAME CUNNINGHAM PAINTER & DECORATOR
   Premium Heritage Website â€” JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     CONFIGURATION â€” Edit these values to update site-wide
     ========================================================== */
  const CONFIG = {
    phone: '07760 203164',
    phoneTel: '07760203164',
    companyName: 'Grahame Cunningham Painter & Decorator',
    established: '1971'
  };

  /* ==========================================================
     GALLERY PROJECTS â€” Add/remove/edit projects here
     ========================================================== */
  const galleryProjects = [
    {
      image: 'assets/images/project-1.jpg',
      title: 'Feature Wall Wallpapering',
      category: 'Wallpapering',
      location: 'Maidenhead',
      description: 'A beautifully applied feature wall with a striking butterfly pattern wallpaper, perfectly aligned and finished to transform the room with personality and charm.'
    },
    {
      image: 'assets/images/project-2.jpg',
      title: 'Complete Room Wallpaper Installation',
      category: 'Wallpapering',
      location: 'Cookham',
      description: 'Full room wallpaper installation showcasing precise pattern matching and seamless joins across every wall for a flawless, professional finish.'
    },
    {
      image: 'assets/images/project-3.jpg',
      title: 'Hallway & Staircase Painting',
      category: 'Interior Painting',
      location: 'Maidenhead',
      description: 'A warm and inviting hallway transformation with careful preparation, clean lines, and a beautifully applied colour scheme enhancing the period character of the home.'
    },
    {
      image: 'assets/images/project-4.jpg',
      title: 'Period Room Restoration',
      category: 'Interior Painting',
      location: 'Windsor',
      description: 'A stunning interior restoration featuring crisp white paintwork on ornate cornicing and ceiling details, paired with elegantly painted walls to complement the room\'s heritage features.'
    },
    {
      image: 'assets/images/project-5.jpg',
      title: 'Victorian Exterior Refresh',
      category: 'Exterior Painting',
      location: 'Marlow',
      description: 'A complete exterior painting project restoring the property\'s kerb appeal with premium weather-resistant finishes on walls, trim, and period architectural details.'
    },
    {
      image: 'assets/images/project-6.jpg',
      title: 'Decorative Interior Finishes',
      category: 'Decorative Finishes',
      location: 'Henley-on-Thames',
      description: 'Specialist decorative paint techniques applied to create depth and character, with carefully selected heritage colours enhancing the room\'s elegant proportions and period mouldings.'
    }
  ];

  /* ==========================================================
     DOM READY
     ========================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initMobileMenu();
    initScrollAnimations();
    initGallery();
    initLightbox();
    initStatCounters();
    initQuoteForm();
  });

  /* ==========================================================
     STICKY NAVIGATION
     ========================================================== */
  function initNavigation() {
    const nav = document.getElementById('navbar');
    const infoBar = document.getElementById('info-bar');
    const navLinks = document.querySelectorAll('.gc-nav__links a');
    const sections = document.querySelectorAll('section[id]');

    if (!nav) return;

    // Handle scroll â€” sticky nav background
    let lastScroll = 0;
    window.addEventListener('scroll', function () {
      const scrollY = window.scrollY;

      if (scrollY > 50) {
        nav.classList.add('gc-nav--scrolled');
      } else {
        nav.classList.remove('gc-nav--scrolled');
      }

      // Hide info bar on scroll
      if (infoBar) {
        if (scrollY > 10) {
          infoBar.style.transform = 'translateY(-100%)';
          infoBar.style.position = 'fixed';
          infoBar.style.top = '0';
          infoBar.style.left = '0';
          infoBar.style.right = '0';
          infoBar.style.zIndex = '1001';
          nav.style.top = '0';
        } else {
          infoBar.style.transform = 'translateY(0)';
          infoBar.style.position = 'relative';
          nav.style.top = 'var(--info-bar-height)';
        }
      }

      lastScroll = scrollY;
    }, { passive: true });

    // Active section highlighting
    if (sections.length && navLinks.length) {
      const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -70% 0px',
        threshold: 0
      };

      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.classList.remove('gc-active');
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('gc-active');
              }
            });
          }
        });
      }, observerOptions);

      sections.forEach(function (section) {
        observer.observe(section);
      });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const navHeight = nav.offsetHeight;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /* ==========================================================
     MOBILE MENU
     ========================================================== */
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('gc-active');
      mobileMenu.classList.toggle('gc-active');
      document.body.style.overflow = mobileMenu.classList.contains('gc-active') ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('gc-active');
        mobileMenu.classList.remove('gc-active');
        document.body.style.overflow = '';
      });
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('gc-active')) {
        hamburger.classList.remove('gc-active');
        mobileMenu.classList.remove('gc-active');
        document.body.style.overflow = '';
      }
    });
  }

  /* ==========================================================
     SCROLL ANIMATIONS
     ========================================================== */
  function initScrollAnimations() {
    const reveals = document.querySelectorAll('.gc-reveal');

    if (!reveals.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('gc-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================
     GALLERY RENDERING
     ========================================================== */
  function initGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    galleryProjects.forEach(function (project, index) {
      const item = document.createElement('div');
      item.className = 'gc-gallery__item gc-reveal';
      if (index > 0 && index <= 5) {
        item.classList.add('gc-reveal-delay-' + Math.min(index, 6));
      }
      item.setAttribute('data-index', index);

      item.innerHTML =
        '<img src="' + project.image + '" alt="' + project.title + ' - ' + project.category + '" loading="lazy">' +
        '<div class="gc-gallery__overlay">' +
        '  <span class="gc-gallery__overlay-title">' + project.title + '</span>' +
        '  <span class="gc-gallery__overlay-category">' + project.category + '</span>' +
        '</div>';

      item.addEventListener('click', function () {
        openLightbox(index);
      });

      galleryGrid.appendChild(item);
    });

    // Re-init scroll animations for dynamically added items
    initScrollAnimations();
  }

  /* ==========================================================
     LIGHTBOX
     ========================================================== */
  let currentLightboxIndex = 0;

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (!lightbox) return;

    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        navigateLightbox(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        navigateLightbox(1);
      });
    }

    // Close on backdrop click
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('gc-active')) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // Touch swipe for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          navigateLightbox(1);
        } else {
          navigateLightbox(-1);
        }
      }
    }, { passive: true });
  }

  function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !galleryProjects[index]) return;

    currentLightboxIndex = index;
    updateLightboxContent(index);
    lightbox.classList.add('gc-active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.classList.remove('gc-active');
      document.body.style.overflow = '';
    }
  }

  function navigateLightbox(direction) {
    currentLightboxIndex += direction;
    if (currentLightboxIndex < 0) currentLightboxIndex = galleryProjects.length - 1;
    if (currentLightboxIndex >= galleryProjects.length) currentLightboxIndex = 0;
    updateLightboxContent(currentLightboxIndex);
  }

  function updateLightboxContent(index) {
    const project = galleryProjects[index];
    if (!project) return;

    var imageEl = document.getElementById('lightbox-image');
    var titleEl = document.getElementById('lightbox-title');
    var categoryEl = document.getElementById('lightbox-category');
    var locationEl = document.getElementById('lightbox-location');
    var descEl = document.getElementById('lightbox-desc');

    if (imageEl) imageEl.style.backgroundImage = 'url(' + project.image + ')';
    if (titleEl) titleEl.textContent = project.title;
    if (categoryEl) categoryEl.textContent = project.category;
    if (locationEl) locationEl.innerHTML = 'ðŸ“ ' + project.location;
    if (descEl) descEl.textContent = project.description;
  }

  /* ==========================================================
     STATISTICS COUNTER ANIMATION
     ========================================================== */
  function initStatCounters() {
    const counters = document.querySelectorAll('.gc-stats__number[data-target]');

    if (!counters.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function animateCounter(element) {
    var target = parseInt(element.getAttribute('data-target'), 10);
    var suffix = element.getAttribute('data-suffix') || '';
    var duration = 2000;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);

      element.textContent = current + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = target + suffix;
      }
    }

    window.requestAnimationFrame(step);
  }

  /* ==========================================================
     QUOTE FORM HANDLING
     ========================================================== */
  function initQuoteForm() {
    var form = document.getElementById('quoteForm');
    if (!form) return;

    var fileInput = document.getElementById('projectPhotos');
    var fileLabel = form.querySelector('.gc-form__file-label');

    // File upload label update
    if (fileInput && fileLabel) {
      fileInput.addEventListener('change', function () {
        var count = fileInput.files.length;
        if (count > 0) {
          fileLabel.innerHTML = 'ðŸ“Ž ' + count + ' file' + (count > 1 ? 's' : '') + ' selected';
        } else {
          fileLabel.innerHTML = 'ðŸ“· Click to upload project photos (optional)';
        }
      });
    }

    // Form submission
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate required fields
      var isValid = true;
      var requiredFields = form.querySelectorAll('[required]');

      requiredFields.forEach(function (field) {
        var errorMsg = field.parentElement.querySelector('.gc-form__error-msg');

        if (!field.value.trim()) {
          field.classList.add('gc-error');
          if (errorMsg) errorMsg.style.display = 'block';
          isValid = false;
        } else {
          field.classList.remove('gc-error');
          if (errorMsg) errorMsg.style.display = 'none';
        }
      });

      // Email validation
      var emailField = document.getElementById('emailAddress');
      if (emailField && emailField.value.trim()) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
          emailField.classList.add('gc-error');
          var emailError = emailField.parentElement.querySelector('.gc-form__error-msg');
          if (emailError) {
            emailError.textContent = 'Please enter a valid email address';
            emailError.style.display = 'block';
          }
          isValid = false;
        }
      }

      if (isValid) {
        // Show success message
        form.style.display = 'none';
        var quoteHeader = document.querySelector('.gc-quote-header');
        if (quoteHeader) quoteHeader.style.display = 'none';

        var successMsg = document.getElementById('quoteSuccess');
        if (successMsg) {
          successMsg.classList.add('gc-active');
          // Scroll to top of success message
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // Scroll to first error
        var firstError = form.querySelector('.gc-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
      }
    });

    // Clear error on input
    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('gc-error');
        var errorMsg = field.parentElement.querySelector('.gc-form__error-msg');
        if (errorMsg) errorMsg.style.display = 'none';
      });
    });
  }

})();
