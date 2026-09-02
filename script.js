const independenceEvents = [
    {
        name: "First War of Independence",
        date: "1857",
        image: "assets/1857.jpeg",
        fullDate: "10 May 1857",
        description: "The Indian Rebellion of 1857 was a major uprising in India against the rule of the British East India Company. It began as a mutiny of sepoys in Meerut and spread across northern and central India, marking the beginning of organized resistance against British colonial rule."
    },
    {
        name: "Indian National Congress",
        date: "1885",
        image: "assets/1885.jpeg",
        fullDate: "28 December 1885",
        description: "The Indian National Congress was founded by Allan Octavian Hume along with Dadabhai Naoroji and Dinshaw Wacha. It became the primary vehicle for the Indian independence movement and played a crucial role in achieving freedom from British rule."
    },
    {
        name: "Partition of Bengal",
        date: "1905",
        image: "assets/1905.jpeg",
        fullDate: "7 July 1905",
        description: "The partition of Bengal was carried out by British Viceroy Lord Curzon, dividing Bengal into two provinces. This divide-and-rule policy sparked massive protests and led to the Swadeshi movement, strengthening the independence struggle."
    },
    {
        name: "Jallianwala Bagh Massacre",
        date: "1919",
        image: "assets/1919.jpg",
        fullDate: "13 April 1919",
        description: "British troops under General Dyer opened fire on unarmed civilians gathered at Jallianwala Bagh in Amritsar. This tragic massacre galvanized the independence movement and turned many moderate Indians into radical freedom fighters."
    },
    {
        name: "Non-Cooperation Movement",
        date: "1920",
        image: "assets/1920.jpg",
        fullDate: "1 August 1920",
        description: "Launched by Mahatma Gandhi, this was the first major civil disobedience movement. Indians were called to withdraw cooperation from British institutions, boycott foreign goods, and resign from government positions."
    },
    {
        name: "Salt March (Dandi March)",
        date: "1930",
        image: "assets/1930.jpeg",
        fullDate: "12 March 1930",
        description: "Gandhi's iconic 240-mile march from Sabarmati Ashram to Dandi to break the British salt monopoly. This act of civil disobedience inspired millions of Indians to join the independence movement and demonstrated the power of non-violent resistance."
    },
    {
        name: "Quit India Movement",
        date: "1942",
        image: "assets/1942.jpeg",
        fullDate: "8 August 1942",
        description: "Gandhi's final major movement demanding immediate independence with the slogan 'Do or Die'. Despite severe repression and arrest of leaders, mass protests across the country demonstrated that British rule could only continue through force."
    },
    {
        name: "Indian Independence",
        date: "1947",
        image: "assets/1947.jpeg",
        fullDate: "15 August 1947",
        description: "India finally achieved independence from 200 years of British colonial rule. Nehru delivered his famous 'Tryst with Destiny' speech as India awakened to life and freedom, though it came with the tragic partition of the subcontinent.",
        quote: "At the stroke of midnight, when the world slept, India awoke to life and freedom.",
        cta: {
            text: "Learn more about this event →",
            href: "https://en.wikipedia.org/wiki/Independence_Day_(India)"
        }
    }
];

const cards = [];
const dots = [];
let currentIndex = 0;
let isAnimating = false;
let autoRotateInterval;
let scrollTimeout;
const autoRotateDelay = 10000; // 10 seconds
let isScrolling = false;
let lastScrollTime = 0;
let overlayOpen = false;
let audioInitialized = false;
let confettiPlayedFor1947 = false;

// Audio helpers
function updateAudioToggleIcon(audio, btn) {
    if (!audio || !btn) return;
    const isPlaying = !audio.paused && !audio.muted;
    btn.textContent = isPlaying ? '🔊' : '🔇';
    btn.setAttribute('aria-label', isPlaying ? 'Mute background music' : 'Play background music');
}

function setupAudioControls() {
    const audio = document.getElementById('bgAudio');
    const btn = document.getElementById('audioToggle');
    if (!audio || !btn) return;

    // Ensure initial state
    audio.volume = 0.5;
    updateAudioToggleIcon(audio, btn);

    // First user interaction to start playback (autoplay policy)
    const startOnFirstInteraction = async () => {
        if (audioInitialized) return;
        audioInitialized = true;
        try {
            await audio.play();
            audio.muted = false;
        } catch (e) {
            // If blocked, keep muted until user toggles
        }
        updateAudioToggleIcon(audio, btn);
        window.removeEventListener('click', startOnFirstInteraction);
        window.removeEventListener('keydown', startOnFirstInteraction);
        window.removeEventListener('touchstart', startOnFirstInteraction);
    };
    window.addEventListener('click', startOnFirstInteraction, { once: false });
    window.addEventListener('keydown', startOnFirstInteraction, { once: false });
    window.addEventListener('touchstart', startOnFirstInteraction, { once: false });

    // Toggle button
    btn.addEventListener('click', async () => {
        if (audio.paused) {
            try { await audio.play(); audio.muted = false; } catch { }
        } else {
            audio.pause();
        }
        updateAudioToggleIcon(audio, btn);
    });

    // Keep icon in sync when playback changes for any reason
    ['play', 'pause', 'volumechange', 'ended'].forEach(ev => {
        audio.addEventListener(ev, () => updateAudioToggleIcon(audio, btn));
    });
}

function createCards() {
    const track = document.querySelector('.carousel-track');
    const dotsContainer = document.getElementById('dotsContainer');

    independenceEvents.forEach((event, index) => {
        // Create card
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-index', index);
        card.innerHTML = `
            <img src="${event.image}" alt="${event.name}" loading="lazy" decoding="async">
            <div class="card-content">
                <div class="card-date">${event.fullDate}</div>
                <div class="card-title">${event.name}</div>
                <div class="card-description">${event.description.substring(0, 100)}...</div>
            </div>
        `;
        track.appendChild(card);
        cards.push(card);

        // Create dot
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot';
        dot.setAttribute('data-index', index);
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to event ${index + 1}: ${event.name}`);
        dot.setAttribute('aria-selected', 'false');
        dotsContainer.appendChild(dot);
        dots.push(dot);
    });
}

function updateCarousel(newIndex, isScroll = false) {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex = (newIndex + cards.length) % cards.length;

    cards.forEach((card, i) => {
        const offset = (i - currentIndex + cards.length) % cards.length;

        card.classList.remove(
            "center",
            "left-1",
            "left-2",
            "right-1",
            "right-2",
            "hidden"
        );

        if (offset === 0) {
            card.classList.add("center");
        } else if (offset === 1) {
            card.classList.add("right-1");
        } else if (offset === 2) {
            card.classList.add("right-2");
        } else if (offset === cards.length - 1) {
            card.classList.add("left-1");
        } else if (offset === cards.length - 2) {
            card.classList.add("left-2");
        } else {
            card.classList.add("hidden");
        }
    });

    dots.forEach((dot, i) => {
        const isActive = i === currentIndex;
        dot.classList.toggle("active", isActive);
        dot.setAttribute('aria-selected', String(isActive));
        dot.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    // Update member info
    const eventName = document.getElementById('eventName');
    const eventDate = document.getElementById('eventDate');

    eventName.style.opacity = "0";
    eventDate.style.opacity = "0";

    setTimeout(() => {
        const currentEvent = independenceEvents[currentIndex];
        eventName.textContent = currentEvent.name;
        eventDate.textContent = currentEvent.date;

        eventName.style.opacity = "1";
        eventDate.style.opacity = "1";
    }, 300);

    setTimeout(() => {
        isAnimating = false;
        if (isScroll) {
            isScrolling = false;
        }
    }, 800);

    // Trigger confetti when reaching the 1947 slide (even without overlay)
    const currentEvent = independenceEvents[currentIndex];
    if (currentEvent && currentEvent.date === '1947' && !confettiPlayedFor1947) {
        confettiPlayedFor1947 = true;
        launchConfetti();
    }
}

function startAutoRotate() {
    stopAutoRotate();
    autoRotateInterval = setInterval(() => {
        updateCarousel(currentIndex + 1);
    }, autoRotateDelay);
}

function stopAutoRotate() {
    if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
    }
}

function handleScroll(e) {
    const now = Date.now();
    if (now - lastScrollTime < 500) {
        return;
    }
    lastScrollTime = now;

    if (e.type === 'wheel') {
        e.preventDefault();
    }

    const delta = Math.sign(e.deltaY || e.deltaX || e.detail || e.wheelDelta);

    if (delta !== 0 && !isScrolling) {
        isScrolling = true;
        stopAutoRotate();

        if (delta > 0) {
            updateCarousel(currentIndex + 1, true);
        } else {
            updateCarousel(currentIndex - 1, true);
        }

        const scrollIndicator = document.querySelector('.scroll-indicator');
        scrollIndicator.classList.add('show');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => { scrollIndicator.classList.remove('show'); }, 1000);
    }
}

// Overlay helpers
function updateOverlayContent() {
    const ev = independenceEvents[currentIndex];
    const img = document.getElementById('overlayImage');
    const name = document.getElementById('overlayName');
    const date = document.getElementById('overlayDate');
    const desc = document.getElementById('overlayDesc');
    const quote = document.getElementById('overlayQuote');
    const cta = document.getElementById('overlayCta');
    img.src = ev.image;
    img.alt = ev.name;
    name.textContent = ev.name;
    date.textContent = ev.fullDate;
    desc.textContent = ev.description;

    // Quote
    if (quote) {
        if (ev.quote) {
            quote.textContent = ev.quote;
            quote.setAttribute('aria-hidden', 'false');
            quote.style.display = 'block';
        } else {
            quote.textContent = '';
            quote.setAttribute('aria-hidden', 'true');
            quote.style.display = 'none';
        }
    }

    // CTA
    if (cta) {
        if (ev.cta && ev.cta.href) {
            cta.textContent = ev.cta.text || 'Learn more';
            cta.href = ev.cta.href;
            cta.setAttribute('aria-hidden', 'false');
            cta.style.display = 'inline-block';
        } else {
            cta.textContent = '';
            cta.removeAttribute('href');
            cta.setAttribute('aria-hidden', 'true');
            cta.style.display = 'none';
        }
    }
}

function openOverlay() {
    updateOverlayContent();
    const overlay = document.getElementById('detailOverlay');
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    overlayOpen = true;
    stopAutoRotate();
    document.getElementById('overlayClose').focus();

    // Trigger confetti when Indian Independence is shown
    const ev = independenceEvents[currentIndex];
    if (ev && ev.date === '1947' && !confettiPlayedFor1947) {
        confettiPlayedFor1947 = true;
        launchConfetti();
    }
}

function closeOverlay() {
    const overlay = document.getElementById('detailOverlay');
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    overlayOpen = false;
}

function setupEventListeners() {
    const leftArrow = document.querySelector(".nav-arrow.left");
    const rightArrow = document.querySelector(".nav-arrow.right");

    leftArrow.addEventListener("click", () => { stopAutoRotate(); updateCarousel(currentIndex - 1); openOverlay(); });
    rightArrow.addEventListener("click", () => { stopAutoRotate(); updateCarousel(currentIndex + 1); openOverlay(); });

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => { stopAutoRotate(); updateCarousel(i); openOverlay(); });
        dot.addEventListener("keydown", (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); stopAutoRotate(); updateCarousel(i); openOverlay();
            }
        });
    });

    cards.forEach((card, i) => {
        card.tabIndex = 0;
        card.addEventListener("click", () => { stopAutoRotate(); updateCarousel(i); openOverlay(); });
        card.addEventListener("keydown", (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); stopAutoRotate(); updateCarousel(i); openOverlay();
            }
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { updateCarousel(currentIndex - 1); openOverlay(); }
        else if (e.key === "ArrowRight") { updateCarousel(currentIndex + 1); openOverlay(); }
        else if (e.key === 'Escape' && overlayOpen) { closeOverlay(); }
    });

    // Touch events
    let touchStartX = 0, touchEndX = 0;
    document.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; stopAutoRotate(); });
    document.addEventListener("touchend", (e) => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); });
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) updateCarousel(currentIndex + 1); else updateCarousel(currentIndex - 1);
        }
    }

    // Scroll events
    window.addEventListener('wheel', (e) => { if (overlayOpen) return; handleScroll(e); }, { passive: false });

    // For touch devices
    let isScrollingLocal = false;
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const diff = touchStartX - touch.screenX;
            if (Math.abs(diff) > 50 && !isScrollingLocal) {
                isScrollingLocal = true; stopAutoRotate();
                if (diff > 0) { updateCarousel(currentIndex + 1, true); openOverlay(); }
                else { updateCarousel(currentIndex - 1, true); openOverlay(); }
            }
        }
    }, { passive: true });

    // Overlay close interactions
    document.getElementById('overlayClose').addEventListener('click', closeOverlay);
    document.getElementById('detailOverlay').addEventListener('click', (e) => { if (e.target.id === 'detailOverlay') closeOverlay(); });
}

// Initialize everything
window.addEventListener('DOMContentLoaded', () => {
    createCards();
    setupEventListeners();
    updateCarousel(0);
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) { startAutoRotate(); }

    const carousel = document.querySelector('.carousel-container');
    carousel.addEventListener('mouseenter', stopAutoRotate);
    carousel.addEventListener('mouseleave', () => { if (!overlayOpen) startAutoRotate(); });

    // Setup background audio controls
    setupAudioControls();

    // Prepare confetti container lazily
    ensureConfettiContainer();
});

// ---------------- Confetti helpers ----------------
function ensureConfettiContainer() {
    if (document.querySelector('.confetti-container')) return;
    const c = document.createElement('div');
    c.className = 'confetti-container';
    document.body.appendChild(c);
}

function randomBetween(min, max) { return Math.random() * (max - min) + min; }

function launchConfetti() {
    ensureConfettiContainer();
    const container = document.querySelector('.confetti-container');
    const colors = ['#FF9933', '#FFFFFF', '#138808']; // saffron, white, green
    const count = 160;
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const size = randomBetween(6, 14);
        piece.style.width = `${size}px`;
        piece.style.height = `${size}px`;
        piece.style.left = `${randomBetween(0, 100)}vw`;
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        const duration = randomBetween(3.5, 6.5);
        const delay = randomBetween(0, 1.8);
        const spinDur = randomBetween(1.5, 2.8);
        piece.style.animationDuration = `${duration}s, ${spinDur}s`;
        piece.style.animationDelay = `${delay}s, 0s`;
        container.appendChild(piece);
        // Cleanup after falling
        setTimeout(() => { piece.remove(); }, (duration + delay) * 1000 + 800);
    }
}
