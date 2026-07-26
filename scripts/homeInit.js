import { fetchGameResults } from './fetchResults.js';
import { gameConfigs } from './gameConfigs.js';
import { renderGameResults } from './renderGame.js';
import { showError } from '../utils/showError.js';

// const subnav = document.getElementById('subnav');
const container = document.getElementById('homePageContainer');
const status = document.getElementById('statusMessage');


//Link buttons
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

// Megapot sticky banner: show only when the in-article banner is out of view
function initMegapotSticky() {
    const sticky = document.getElementById('megapotSticky');
    const trigger = document.getElementById('megapotInArticle');
    if (!sticky || !trigger) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            sticky.classList.toggle('visible', !entry.isIntersecting);
        });
    }, { threshold: 0 });

    observer.observe(trigger);

    document.getElementById('megapotClose')?.addEventListener('click', () => {
        sticky.classList.remove('visible');
        observer.disconnect(); // stop re-showing after manual close
    });
}
initMegapotSticky();

//Load results directly (no session validation)
loadResults();

async function loadResults() {
    try {
        status.textContent = '🔄 Loading latest lotto results...';
        // if (subnav) subnav.style.display = "none";

        // Fetch only current year for homepage optimization
        const currentYear = new Date().getFullYear();
        const allResults = await fetchGameResults(null, currentYear);

        if (!allResults || Object.keys(allResults).length === 0) {
            showError("⚠️ No results available at the moment. Please check back soon.");
            return;
        }

        gameConfigs.forEach(cfg => {
            const data = allResults[cfg.key];
            if (!data) return;

            const section = document.createElement('section');
            section.classList.add('game-section');
            section.innerHTML = `<h2>${cfg.label}</h2>`;
            renderGameResults(cfg.key, data, section);
            container.appendChild(section);

            const gameName = document.createElement("span");
            gameName.textContent = `${cfg.label}`;
        });
        
        status.textContent = '';
    } catch (err) {
        console.error("Fetch error:", err);
      // const subnav = document.getElementById('subnav');

        if (!navigator.onLine) {
            status.innerHTML = "📡 No internet connection detected.";
        } else if (err.message.includes("403")) {
            status.innerHTML = "🔒 Access to results is restricted. Try visiting from an approved page.";
        } else {
            status.innerHTML = "⚠️ Couldn’t load results due to a network or server issue.";
        }

        container.innerHTML = "";
      // if (subnav) subnav.style.display = "none";
    }
}

