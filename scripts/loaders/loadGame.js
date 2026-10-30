import { fetchGameResults } from '../fetchResults.js';
import { gameConfigs } from '../gameConfigs.js';
import { renderGameResults } from '../renderGame.js';
import { showError } from '../../utils/showError.js';

const container = document.getElementById('gameContainer');
const status = document.getElementById('statusMessage');
const nav = document.querySelector('.each-game-active-wrapper');

// Detect game from URL
const slug = window.location.pathname.split('/').pop().replace('.html', '');
const config = gameConfigs.find(cfg => cfg.slug === slug);

if (!config) {
  container.innerHTML = `<p>Unknown game: ${slug}</p>`;
  throw new Error(`No config found for slug "${slug}"`);
}

// 🔗 Build subnavbar with all games
gameConfigs.forEach(cfg => {
  const link = document.createElement('a');
  link.href = `/games/${cfg.slug}.html`;
  link.textContent = cfg.label;
  if (cfg.slug === slug) link.classList.add('active');
  nav.appendChild(link);
});

// Load game results directly (no session check)
loadSingleGame();

async function loadSingleGame() {
  try {
    status.textContent = `Loading ${config.label} results...`;
    const allResults = await fetchGameResults();
    const data = allResults[config.key];

    if (!data) {
      container.innerHTML = `<p>No ${config.label} data found.</p>`;
      return;
    }

    renderGameResults(config.key, data, container);
    status.textContent = '';
  } catch (err) {
    console.error("Fetch error:", err);
    showError(`Unable to load ${config.label} results due to a network or server issue.`);
  }
}

// Subscribe & Login buttons (Optional UI links)
function linkButton() {
  document.querySelector("#subscribeBtn")?.addEventListener("click", () => {
    window.location.href = "https://app.visuallottoboard.com/subscription";
  });

  document.querySelector("#loginBtn")?.addEventListener("click", () => {
    window.location.href = "https://app.visuallottoboard.com/";
  });
}
linkButton();
