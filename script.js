const body = document.body;

// Universal Smooth Scroller
const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const smoothScrollTo = (element, targetPos, duration) => {
    const startPos = element === window ? window.pageYOffset : element.scrollLeft;
    const distance = targetPos - startPos;
    let startTime = null;

    const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutQuad(progress);
        
        const nextPos = startPos + distance * ease;
        
        if (element === window) {
            window.scrollTo(0, nextPos);
        } else {
            element.scrollLeft = nextPos;
        }

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    };
    requestAnimationFrame(animation);
};

// ----- Modals (Page Transitions) ----- //
window.openContactForm = function(serviceName) {
    const modal = document.getElementById('contact-form-modal');
    if(modal) {
        const input = document.getElementById('hidden-service-input');
        const subtitleSpan = document.querySelector('#form-service-subtitle span');
        if (input) input.value = serviceName;
        if (subtitleSpan) subtitleSpan.textContent = serviceName;
        openModal('contact-form-modal');
    }
}

window.openModal = function(id) {
    const modal = document.getElementById(id);
    if(modal) {
        modal.classList.add('active');
        body.style.overflow = 'hidden'; // Lock background scroll
        // reset scroll position of the modal itself just in case
        modal.scrollTo(0, 0);
    }
}

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if(modal) {
        modal.classList.remove('active');
        body.style.overflow = ''; // Unlock scroll
    }
}

// ----- Dark Mode Toggle ----- //
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
};
initTheme();


document.addEventListener('DOMContentLoaded', () => {
    // Theme Button Event
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
    
    // ----- Smooth Burger Menu ----- //
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if(menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            if(navLinks.classList.contains('open')) {
                body.style.overflow = 'hidden';
                menuToggle.classList.add('active');
            } else {
                body.style.overflow = '';
                menuToggle.classList.remove('active');
            }
        });

        // Close menu when clicking a link & Handle Smooth Scroll
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                // Support explicit anchor scrolling
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#') {
                    e.preventDefault();
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        // Explicit window scroll to ensure smoothness on all systems
                        const topPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - 48;
                        smoothScrollTo(window, topPosition, 600);
                    }
                }
                
                navLinks.classList.remove('open');
                body.style.overflow = '';
                menuToggle.classList.remove('active');
            });
        });
    }

    // ----- Carousel Logic ----- //
    const track = document.getElementById('projects-carousel');
    if (track) {
        const slides = Array.from(track.children);
        const nextBtn = document.querySelector('.carousel-btn.next');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const dots = Array.from(document.querySelectorAll('.dot'));
        
        let currentIndex = 0;
        let slideInterval;

        const updateCarousel = (index) => {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            
            currentIndex = index;
            
            const slide = slides[currentIndex];
            const scrollPos = slide.offsetLeft - track.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
            
            // Temporarily disable scroll-snap to let custom smoothscroll play out perfectly
            track.style.scrollSnapType = 'none';
            smoothScrollTo(track, scrollPos, 600);
            
            // Revert back so manual finger swipes still snap correctly
            setTimeout(() => { track.style.scrollSnapType = 'x mandatory'; }, 650);
            
            // Update dots
            dots.forEach(d => d.classList.remove('active'));
            if(dots[currentIndex]) {
                dots[currentIndex].classList.add('active');
            }
        };

        const startAutoplay = () => {
            slideInterval = setInterval(() => {
                updateCarousel(currentIndex + 1);
            }, 6000); // 6 sec interval
        };

        const stopAutoplay = () => {
            clearInterval(slideInterval);
            startAutoplay(); // Restart interval to prevent quick jumping
        };

        if(nextBtn) {
            nextBtn.addEventListener('click', () => {
                updateCarousel(currentIndex + 1);
                stopAutoplay();
            });
        }

        if(prevBtn) {
            prevBtn.addEventListener('click', () => {
                updateCarousel(currentIndex - 1);
                stopAutoplay();
            });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                updateCarousel(index);
                stopAutoplay();
            });
        });

        // Track manual scroll intelligently
        track.addEventListener('scroll', () => {
            const scrollPos = track.scrollLeft;
            const centerPos = scrollPos + track.clientWidth / 2;
            
            let closestSlide = 0;
            let closestDistance = Infinity;
            
            slides.forEach((slide, i) => {
                const slideCenter = slide.offsetLeft - track.offsetLeft + slide.clientWidth / 2;
                const dist = Math.abs(centerPos - slideCenter);
                if(dist < closestDistance) {
                    closestDistance = dist;
                    closestSlide = i;
                }
            });
            
            if (closestSlide !== currentIndex) {
                currentIndex = closestSlide;
                dots.forEach(d => d.classList.remove('active'));
                if(dots[currentIndex]) {
                    dots[currentIndex].classList.add('active');
                }
            }
        }, { passive: true });

        // Start autoplay on load
        startAutoplay();
    }
});
