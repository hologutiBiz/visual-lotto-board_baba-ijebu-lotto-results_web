// renderGame.js — updated to fetch missing years
import { fetchGameResults } from './fetchResults.js';

export function renderGameResults(gameKey, yearlyData, container) {
    // Build year list — current year + reasonable historical range
    const currentYear = new Date().getFullYear();
    const startYear = 2023; // your earliest data year
    const allPossibleYears = [];
    for (let y = currentYear; y >= startYear; y--) {
        allPossibleYears.push(String(y));
    }

    const selectorWrapper = document.createElement('div');
    selectorWrapper.style.cssText = 'margin: 20px 0; text-align: center; padding: 15px; background: #f5f5f5; border-radius: 5px;';

    const label = document.createElement('label');
    label.textContent = 'Select Year: ';
    label.style.cssText = 'font-weight: bold; margin-right: 10px; font-size: 16px;';

    const selector = document.createElement('select');
    selector.id = 'yearSelector';
    selector.style.cssText = 'padding: 8px 12px; font-size: 14px; border: 2px solid #2282c7; border-radius: 4px; cursor: pointer; background: white;';

    allPossibleYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === String(currentYear)) option.selected = true;
        selector.appendChild(option);
    });

    selectorWrapper.appendChild(label);
    selectorWrapper.appendChild(selector);
    container.appendChild(selectorWrapper);

    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'resultsContainer';
    container.appendChild(resultsContainer);

    // Local cache so we don't re-fetch the same year twice
    const fetchedYears = { ...yearlyData };

    async function renderYear(selectedYear) {
        resultsContainer.innerHTML = '<p style="text-align:center;padding:20px;">Loading...</p>';

        try {
            // Fetch from server if we don't already have this year
            if (!fetchedYears[selectedYear]) {
                const result = await fetchGameResults(gameKey, selectedYear);
                // result shape: { [gameKey]: { [year]: [...draws] } }
                const draws = result?.[gameKey]?.[selectedYear];
                fetchedYears[selectedYear] = draws || [];
            }

            const draws = fetchedYears[selectedYear];
            resultsContainer.innerHTML = '';

            if (!draws || draws.length === 0) {
                resultsContainer.innerHTML = `<p style="text-align: center; padding: 20px; color: #666;">No results available for ${selectedYear}</p>`;
                return;
            }

            const table = document.createElement('table');
            table.innerHTML = `
                <caption class="game-year">${selectedYear}</caption>
                <thead>
                    <tr>
                        <th class="serial-num">S/N</th>
                        <th>DATE</th>
                        <th colspan="5">WINNING</th>
                        <th colspan="5">MACHINE</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector('tbody');

            draws.forEach(draw => {
                const winning = draw.winningNumbers
                    .map(n => `<td class="winning">${n.number || '—'}</td>`)
                    .join('');

                const machine = draw.machineNumbers
                    .map((n, i) => {
                        const extra = i === 0 ? 'fbm' : '';
                        return `<td class="machine ${extra}">${n.number || '—'}</td>`;
                    })
                    .join('');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="serial-num">${draw.serialNumber || '—'}</td>
                    <td class="days"><small>${draw.date || '—'}</small></td>
                    ${winning}
                    ${machine}
                `;

                tbody.appendChild(row);
            });

            resultsContainer.appendChild(table);
        } catch (err) {
            console.error('Game year fetch failed:', err);
            resultsContainer.innerHTML = `<p style="text-align:center;padding:20px;color:#c00;">Unable to load ${selectedYear} results. Please check your connection or try again later.</p>`;
        }

        const table = document.createElement('table');
        table.innerHTML = `
            <caption class="game-year">${selectedYear}</caption>
            <thead>
                <tr>
                    <th class="serial-num">S/N</th>
                    <th>DATE</th>
                    <th colspan="5">WINNING</th>
                    <th colspan="5">MACHINE</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');

        draws.forEach(draw => {
            const winning = draw.winningNumbers
                .map(n => `<td class="winning">${n.number || '—'}</td>`)
                .join('');

            const machine = draw.machineNumbers
                .map((n, i) => {
                    const extra = i === 0 ? 'fbm' : '';
                    return `<td class="machine ${extra}">${n.number || '—'}</td>`;
                })
                .join('');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="serial-num">${draw.serialNumber || '—'}</td>
                <td class="days"><small>${draw.date || '—'}</small></td>
                ${winning}
                ${machine}
            `;

            tbody.appendChild(row);
        });

        resultsContainer.appendChild(table);
    }

    renderYear(String(currentYear));

    selector.addEventListener('change', (e) => {
        renderYear(e.target.value);
    });
}