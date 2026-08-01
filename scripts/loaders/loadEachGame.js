// loadGame.js

import { fetchGameResults } from '../fetchResults.js';
import { gameConfigs } from '../gameConfigs.js';
import { renderGameResults } from '../renderGame.js';
import { showError } from '../../utils/showError.js';

const desktopContainer = document.getElementById('gameContainer');
const mobileContainer = document.getElementById('mobileGameContainer');
const desktopStatus = document.getElementById('statusMessage');
const mobileStatus = document.getElementById('mobileStatusMessage');
const desktopHeading = document.getElementById('desktopGameHeading');
const mobileHeading = document.getElementById('mobileGameHeading');

// Detect game from URL
const slug = window.location.pathname.split('/').pop().replace('.html', '');
const config = gameConfigs.find(cfg => cfg.slug === slug);

if (!config) {
    desktopContainer.innerHTML = `<p>Unknown game: ${slug}</p>`;
    throw new Error(`No config found for slug "${slug}"`);
}

// Mark the active game in both the desktop sidebar and mobile chip strip
document.querySelectorAll('.desktop-game-links .game-link, .mobile-game-switcher .game-chip').forEach(link => {
    if (link.getAttribute('data-slug') === slug) link.classList.add('active');
});

// Set headings to match the current game
if (desktopHeading) desktopHeading.innerHTML = `${config.label} <span style="color:#ff0000;">Results</span>`;
if (mobileHeading) mobileHeading.textContent = `${config.label} Results`;

// 🎯 Inject Megapot banners (in-content + sticky) — mobile view only
injectMegapotBanners();

// Load game results directly (no session check)
loadSingleGame();

async function loadSingleGame() {
    try {
        desktopStatus.textContent = `Loading ${config.label} results...`;
        if (mobileStatus) mobileStatus.textContent = `Loading ${config.label} results...`;

        const allResults = await fetchGameResults(config.key, new Date().getFullYear());
        const data = allResults[config.key];

        if (!data) {
            desktopContainer.innerHTML = `<p>No ${config.label} data found.</p>`;
            if (mobileContainer) mobileContainer.innerHTML = `<p>No ${config.label} data found.</p>`;
            return;
        }

        // Render the same data into both the desktop and mobile containers
        renderGameResults(config.key, data, desktopContainer);
        if (mobileContainer) renderGameResults(config.key, data, mobileContainer);

        desktopStatus.textContent = '';
        if (mobileStatus) mobileStatus.textContent = '';
    } catch (err) {
        console.error("Fetch error:", err);
        showError(`Unable to load ${config.label} results due to a network or server issue.`);
    }
}

// Subscribe & Login buttons (Optional UI links)
function linkButton() {
    document.querySelector("#subscribeBtn")?.addEventListener("click", () => {
        window.location.href = "https://lottoforecast.visuallottoboard.com/subscription";
    });

    document.querySelector("#loginBtn")?.addEventListener("click", () => {
        window.location.href = "https://lottoforecast.visuallottoboard.com/";
    });
}
linkButton();

// Hamburger menu toggle (mobile only — CSS hides this button on desktop)
function initMenuToggle() {
    const toggleBtn = document.getElementById('menuToggle');
    const actions = document.getElementById('headerActions');
    toggleBtn?.addEventListener('click', () => {
        actions.classList.toggle('menu-open');
    });
}
initMenuToggle();

// Megapot banner injection (mobile view only — desktop uses the dedicated promo column)
function injectMegapotBanners() {
    const MEGAPOT_LINK = "https://megapot.io/?utm_source=visuallotto&ref=NFHHTA";
    const mobileView = document.querySelector('.mobile-view');
    if (!mobileView || !mobileContainer) return;

    // --- In-content banner: insert right after the results table ---
    const inContentWrapper = document.createElement('div');
    inContentWrapper.className = 'megapot-banner-wrapper';
    inContentWrapper.id = 'megapotInArticle';
    inContentWrapper.innerHTML = `
        <a href="${MEGAPOT_LINK}" target="_blank" rel="noopener sponsored" aria-label="Megapot - Play the Internet Lottery" id="megapot-link-inarticle" data-banner-position="in_article">
        <img src="/assets/megapot/900_x_750.png" alt="Megapot - Play to Win" class="megapot-banner">
        </a>
    `;
    mobileContainer.insertAdjacentElement('afterend', inContentWrapper);

    // --- Sticky bottom banner: always visible, collapses to a slim tab on tap (pulse animation applied) ---
    const stickyBanner = document.createElement('div');
    stickyBanner.className = 'megapot-sticky-banner';
    stickyBanner.id = 'megapotSticky';
    stickyBanner.innerHTML = `
        <a href="${MEGAPOT_LINK}" target="_blank" rel="noopener sponsored" aria-label="Megapot - Play the Internet Lottery" id="megapot-link-sticky" data-banner-position="sticky">
        <img src="/assets/megapot/2184_x_270.png" alt="Megapot - Play to Win" class="megapot-sticky-desktop megapot-pulse">
        <img src="/assets/megapot/960_x_150.png" alt="Megapot - Play to Win" class="megapot-sticky-mobile megapot-pulse">
        </a>
        <button class="megapot-close" id="megapotClose" aria-label="Collapse ad">▼</button>
        <div class="megapot-collapsed-label">
        <span>🎰 Megapot</span>
        </div>
    `;
    document.body.appendChild(stickyBanner);

    document.getElementById('megapotClose')?.addEventListener('click', () => {
        stickyBanner.classList.toggle('collapsed');
        const btn = document.getElementById('megapotClose');
        btn.textContent = stickyBanner.classList.contains('collapsed') ? '▲' : '▼';
        btn.setAttribute('aria-label', stickyBanner.classList.contains('collapsed') ? 'Expand ad' : 'Collapse ad');
    });
}