/**
 * Premium Developer Portfolio Interactivity
 * Author: Piyush Rajan
 * Features: Canvas Particles, Interactive Mouse-Tracking glows, Scroll reveals, Typewriter cycles, Theme management
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileNav();
    initHeaderScroll();
    initCanvasParticles();
    initTypewriter();
    initScrollReveal();
    initCardGlows();
    initScrollspy();
});

/* ==========================================================================
   1. Theme Management (Dual Dark Accents)
   ========================================================================== */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Default to 'cyber-dark' (default class in HTML) or saved theme
    const savedTheme = localStorage.getItem('portfolio-theme') || 'cyber';
    
    if (savedTheme === 'space') {
        html.classList.add('obsidian-space');
        themeToggle.textContent = '☀️';
    } else {
        html.classList.remove('obsidian-space');
        themeToggle.textContent = '🌙';
    }

    themeToggle.addEventListener('click', () => {
        html.classList.toggle('obsidian-space');
        const isSpace = html.classList.contains('obsidian-space');
        
        localStorage.setItem('portfolio-theme', isSpace ? 'space' : 'cyber');
        themeToggle.textContent = isSpace ? '☀️' : '🌙';

        // Animate toggle click
        themeToggle.style.transform = 'scale(0.85) rotate(45deg)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 150);
    });
}

/* ==========================================================================
   2. Mobile Drawer Navigation
   ========================================================================== */
function initMobileNav() {
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const navDropdown = document.querySelector('.mobile-nav-dropdown');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!navToggle || !navDropdown) return;

    function toggleMenu() {
        navToggle.classList.toggle('open');
        navDropdown.classList.toggle('open');
        document.body.style.overflow = navDropdown.classList.contains('open') ? 'hidden' : '';
    }

    navToggle.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Close drawer on click
            navToggle.classList.remove('open');
            navDropdown.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

/* ==========================================================================
   3. Header Scroll Effect
   ========================================================================== */
function initHeaderScroll() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   4. High Performance Canvas Particles Background
   ========================================================================== */
function initCanvasParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let animationFrameId;

    // Mouse coordinates track
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Resize handling
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle Blueprints
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        // Draw particle
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Update movement
        update() {
            // Screen boundaries wrap/bounce
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;

            // Interactive mouse repel effect
            if (mouse.x !== null && mouse.y !== null) {
                let dx = this.x - mouse.x;
                let dy = this.y - mouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const forceX = (dx / distance) * force * 2.5;
                    const forceY = (dy / distance) * force * 2.5;

                    this.x += forceX;
                    this.y += forceY;
                }
            }

            this.draw();
        }
    }

    // Populate particles
    function initParticles() {
        particlesArray = [];
        // Adaptive numbers based on viewport width
        let numberOfParticles = Math.floor((canvas.width * canvas.height) / 16000);
        numberOfParticles = Math.min(numberOfParticles, 85); // Cap to preserve CPU efficiency
        numberOfParticles = Math.max(numberOfParticles, 25);

        for (let i = 0; i < numberOfParticles; i++) {
            let size = Math.random() * 2 + 1;
            let x = Math.random() * (canvas.width - size * 2) + size;
            let y = Math.random() * (canvas.height - size * 2) + size;
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            
            // Randomize between cyan-ish and purple-ish node colors
            let color = Math.random() > 0.5 ? 'rgba(0, 212, 255, 0.25)' : 'rgba(179, 0, 255, 0.25)';
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Connect node lines
    function connectLines() {
        let maxDistance = 140;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    // Compute line opacity based on connection distance
                    let opacity = (1 - (distance / maxDistance)) * 0.12;
                    ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Render loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectLines();
        animationFrameId = requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   5. Interactive Subtitle Typewriter Effect
   ========================================================================== */
function initTypewriter() {
    const textElement = document.getElementById('typewriter-text');
    if (!textElement) return;

    const words = JSON.parse(textElement.getAttribute('data-words'));
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let currentWord = '';
    let typeSpeed = 100;

    function type() {
        const fullWord = words[wordIndex];

        if (isDeleting) {
            currentWord = fullWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40; // Deletes faster than types
        } else {
            currentWord = fullWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        textElement.textContent = currentWord;

        // Typwriting pauses & switches
        if (!isDeleting && charIndex === fullWord.length) {
            isDeleting = true;
            typeSpeed = 2000; // Hold word complete state
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length; // Rotate words
            typeSpeed = 500; // Pause before typing next word
        }

        setTimeout(type, typeSpeed);
    }

    // Start cycle
    setTimeout(type, 1000);
}

/* ==========================================================================
   6. Scroll Reveal Observer (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, {
        threshold: 0.12, // Reveal when 12% is in view
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   7. Card cursor coordinate trackers (Premium halo borders)
   ========================================================================== */
function initCardGlows() {
    const glowElements = document.querySelectorAll('.glow-element');

    glowElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Get coordinates relative to the card's dimensions
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

/* ==========================================================================
   8. Scrollspy Nav Highlights
   ========================================================================== */
function initScrollspy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        
        // Find current section in view
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            // Focus trigger point (offset by header height)
            if (window.scrollY >= sectionTop - 120) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // Set active class
        function highlightLink(links) {
            links.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }

        highlightLink(navLinks);
        highlightLink(mobileLinks);
    });
}
