/* ========================================
   BRÆIN SERVICE PARTNER - Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    Navigation.init();
    Header.init();
    Forms.init();
    Animations.init();
    SmoothScroll.init();
});

/* ========================================
   Navigation Module
   ======================================== */

const Navigation = {
    nav: null,
    toggle: null,
    links: null,
    isOpen: false,

    init() {
        this.nav = document.querySelector('.nav');
        this.toggle = document.querySelector('.nav-toggle');
        this.links = document.querySelectorAll('.nav__link');

        if (!this.nav || !this.toggle) return;

        this.bindEvents();
        this.setActiveLink();
    },

    bindEvents() {
        // Toggle button click
        this.toggle.addEventListener('click', () => this.toggleNav());

        // Close nav when clicking a link
        this.links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                    this.closeNav();
                }
            });
        });

        // Close nav when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.nav.contains(e.target) && !this.toggle.contains(e.target)) {
                this.closeNav();
            }
        });

        // Close nav on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeNav();
            }
        });

        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024 && this.isOpen) {
                this.closeNav();
            }
        });
    },

    toggleNav() {
        this.isOpen ? this.closeNav() : this.openNav();
    },

    openNav() {
        this.isOpen = true;
        this.nav.classList.add('active');
        this.toggle.classList.add('active');
        this.toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    },

    closeNav() {
        this.isOpen = false;
        this.nav.classList.remove('active');
        this.toggle.classList.remove('active');
        this.toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    },

    setActiveLink() {
        const currentPath = window.location.pathname;
        this.links.forEach(link => {
            const href = link.getAttribute('href');
            if (currentPath.endsWith(href) ||
                (currentPath.endsWith('/') && href === 'index.html') ||
                (currentPath === '/' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
};

/* ========================================
   Header Module (Scroll Effects)
   ======================================== */

const Header = {
    header: null,
    scrollThreshold: 50,

    init() {
        this.header = document.querySelector('.header');
        if (!this.header) return;

        this.bindEvents();
        this.checkScroll();
    },

    bindEvents() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.checkScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    },

    checkScroll() {
        if (window.scrollY > this.scrollThreshold) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
    }
};

/* ========================================
   Forms Module
   ======================================== */

const Forms = {
    form: null,
    submitBtn: null,
    messageEl: null,

    init() {
        this.form = document.getElementById('contact-form');
        if (!this.form) return;

        this.submitBtn = this.form.querySelector('button[type="submit"]');
        this.messageEl = this.form.querySelector('.form-message');

        this.bindEvents();
    },

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    },

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        field.classList.remove('error');
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) existingError.remove();

        // Required field check
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Dette feltet er påkrevd';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Vennligst oppgi en gyldig e-postadresse';
            }
        }

        // Phone validation (Norwegian format)
        if (field.type === 'tel' && value) {
            const phoneRegex = /^(\+47)?[\s-]?[0-9]{8}$/;
            const cleanPhone = value.replace(/[\s-]/g, '');
            if (!phoneRegex.test(cleanPhone) && cleanPhone.length < 8) {
                isValid = false;
                errorMessage = 'Vennligst oppgi et gyldig telefonnummer';
            }
        }

        if (!isValid) {
            field.classList.add('error');
            const errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            errorEl.textContent = errorMessage;
            errorEl.style.cssText = 'color: #dc3545; font-size: 0.875rem; display: block; margin-top: 0.25rem;';
            field.parentElement.appendChild(errorEl);
        }

        return isValid;
    },

    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    },

    async handleSubmit(e) {
        e.preventDefault();

        // Validate form
        if (!this.validateForm()) {
            this.showMessage('Vennligst fyll ut alle påkrevde felt korrekt.', 'error');
            return;
        }

        // Get form data
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address') || '',
            projectType: formData.get('projectType'),
            description: formData.get('description'),
            wantSiteVisit: formData.get('siteVisit') === 'on'
        };

        // Show loading state
        this.setLoading(true);

        try {
            // Simulate API call (replace with actual Resend API integration)
            await this.sendToAPI(data);

            this.showMessage(
                'Takk for din henvendelse! Vi har mottatt meldingen din og kontakter deg så snart som mulig, vanligvis innen én arbeidsdag.',
                'success'
            );
            this.form.reset();

        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage(
                'Beklager, det oppstod en feil ved innsending. Vennligst prøv igjen eller ring oss direkte.',
                'error'
            );
        } finally {
            this.setLoading(false);
        }
    },

    async sendToAPI(data) {
        // For now, we'll simulate the API call
        // In production, replace this with actual Resend API integration

        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                // Log the data that would be sent
                console.log('Form data to be sent:', data);

                // For demo purposes, always succeed
                // In production, you would make the actual API call here:
                /*
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error('Failed to send message');
                }

                return response.json();
                */

                resolve({ success: true });
            }, 1500);
        });
    },

    setLoading(isLoading) {
        if (isLoading) {
            this.submitBtn.classList.add('btn--loading');
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.classList.remove('btn--loading');
            this.submitBtn.disabled = false;
        }
    },

    showMessage(text, type) {
        if (!this.messageEl) {
            this.messageEl = document.createElement('div');
            this.messageEl.className = 'form-message';
            this.form.insertBefore(this.messageEl, this.form.firstChild);
        }

        this.messageEl.textContent = text;
        this.messageEl.className = `form-message ${type}`;
        this.messageEl.style.display = 'block';

        // Scroll to message
        this.messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Auto-hide success message
        if (type === 'success') {
            setTimeout(() => {
                this.messageEl.style.display = 'none';
            }, 10000);
        }
    }
};

/* ========================================
   Animations Module
   ======================================== */

const Animations = {
    observerOptions: {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    },

    init() {
        if (!('IntersectionObserver' in window)) return;

        this.setupScrollAnimations();
    },

    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '.service-card, .feature-item, .value-card, .project-card, .section-header'
        );

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            observer.observe(el);
        });
    }
};

/* ========================================
   Smooth Scroll Module
   ======================================== */

const SmoothScroll = {
    init() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerOffset = 100;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

/* ========================================
   Utility Functions
   ======================================== */

// Debounce function for performance
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format phone number for display
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 8) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
}

// Click-to-call functionality for mobile
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function(e) {
        // Track phone clicks for analytics if needed
        console.log('Phone click tracked');
    });
});
