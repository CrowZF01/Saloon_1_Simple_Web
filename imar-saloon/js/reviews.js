import { supabase } from '../connection/supabase.js'

function getAvatarColor(name) {
    const colors = [
        '#0f9d58', // Green
        '#db4437', // Red
        '#f4b400', // Yellow/Orange
        '#4285f4', // Blue
        '#ab47bc', // Purple
        '#00acc1', // Cyan
        '#ff7043', // Deep Orange
        '#78909c'  // Grey Blue
    ];
    let hash = 0;
    if (name) {
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

function getAvatarHtml(name, avatar) {
    if (avatar && avatar.trim().startsWith('http')) {
        return `<img src="${avatar}" alt="${name}" class="reviewer-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="initials-avatar" style="background-color: ${getAvatarColor(name)}; display:none;">${name.charAt(0).toUpperCase()}</div>`;
    }
    const initial = name ? name.charAt(0).toUpperCase() : 'U';
    const color = getAvatarColor(name);
    return `<div class="initials-avatar" style="background-color: ${color}; display:flex;">${initial}</div>`;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += `<span class="star-icon full">&#9733;</span>`;
        } else {
            starsHtml += `<span class="star-icon empty">&#9733;</span>`;
        }
    }
    return starsHtml;
}

function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
        <div class="review-card-header">
            <div class="reviewer-info">
                <div class="reviewer-avatar">
                    ${getAvatarHtml(review.name, review.avatar)}
                </div>
                <div class="reviewer-meta">
                    <span class="reviewer-name">${review.name}</span>
                    <span class="review-date">${review.date}</span>
                </div>
            </div>
            <img class="google-logo" src="https://cdn.trustindex.io/assets/platform/Google/icon.svg" alt="Google">
        </div>
        <div class="review-rating-row">
            <div class="stars-container">
                ${generateStars(review.rating)}
            </div>
            <span class="verified-badge" title="Verified Google Review">
                <svg viewBox="0 0 24 24" class="verified-svg">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </span>
        </div>
        <p class="review-content-text">${review.review_text}</p>
    `;
    return card;
}

function renderHeaderBar(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="reviews-header-bar">
            <div class="reviews-header-left">
                <span class="google-brand-text">
                    <span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span>
                </span>
                <span class="excellent-text">Excellent</span>
                <div class="header-stars">
                    <span class="star-icon full">&#9733;</span>
                    <span class="star-icon full">&#9733;</span>
                    <span class="star-icon full">&#9733;</span>
                    <span class="star-icon full">&#9733;</span>
                    <span class="star-icon full">&#9733;</span>
                </div>
                <span class="header-rating-score">4.7</span>
                <span class="header-reviews-count">| 135 reviews</span>
            </div>
            <a href="https://search.google.com/local/writereview?placeid=ChIJyZQVBthZei4RzENk6aTyZ5Y" target="_blank" class="write-review-btn">Write a review</a>
        </div>
    `;
}

async function loadReviews() {
    // Check if on Beranda (carousel) or Review page (grid)
    const carouselTrack = document.getElementById('reviews-carousel-track');
    const carouselHeader = document.getElementById('reviews-carousel-header');
    const gridContainer = document.getElementById('reviews-grid-container');
    const gridHeader = document.getElementById('reviews-grid-header');

    if (!carouselTrack && !gridContainer) return;

    try {
        console.log("Mengambil ulasan dari Supabase...");
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        if (reviews && reviews.length > 0) {
            // Render to Beranda Carousel
            if (carouselTrack) {
                renderHeaderBar(carouselHeader);
                carouselTrack.innerHTML = '';
                const homeReviews = reviews.slice(0, 6);
                homeReviews.forEach(review => {
                    carouselTrack.appendChild(createReviewCard(review));
                });
                setupCarousel();
            }

            // Render to Review Page Grid
            if (gridContainer) {
                renderHeaderBar(gridHeader);
                gridContainer.innerHTML = '';
                reviews.forEach(review => {
                    gridContainer.appendChild(createReviewCard(review));
                });
            }
        }
    } catch (err) {
        console.error("Gagal memuat ulasan dari Supabase:", err);
    }
}

function setupCarousel() {
    const track = document.getElementById('reviews-carousel-track');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    if (!track || !prevBtn || !nextBtn) return;

    let scrollAmount = 0;
    
    const getCardWidth = () => {
        const firstCard = track.firstElementChild;
        if (!firstCard) return 0;
        const style = window.getComputedStyle(firstCard);
        const marginRight = parseFloat(style.marginRight) || 0;
        return firstCard.offsetWidth + marginRight;
    };

    nextBtn.addEventListener('click', () => {
        const cardWidth = getCardWidth();
        const maxScroll = track.scrollWidth - track.clientWidth;
        scrollAmount = Math.min(scrollAmount + cardWidth, maxScroll);
        track.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    prevBtn.addEventListener('click', () => {
        const cardWidth = getCardWidth();
        scrollAmount = Math.max(scrollAmount - cardWidth, 0);
        track.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Auto slide every 6 seconds
    let autoSlideInterval = setInterval(() => {
        const cardWidth = getCardWidth();
        if (cardWidth === 0) return;
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (scrollAmount >= maxScroll - 5) {
            scrollAmount = 0;
        } else {
            scrollAmount = Math.min(scrollAmount + cardWidth, maxScroll);
        }
        track.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }, 6000);

    const resetInterval = () => {
        clearInterval(autoSlideInterval);
    };

    track.addEventListener('mouseenter', resetInterval);
    prevBtn.addEventListener('click', resetInterval);
    nextBtn.addEventListener('click', resetInterval);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadReviews);
} else {
    loadReviews();
}
