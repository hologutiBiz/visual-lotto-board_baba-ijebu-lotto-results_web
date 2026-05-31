const RESULT_API = "https://visual-lotto-board-results-file.netlify.app/.netlify/functions/get-babaijebu-results";
// const RESULT_API = "https://visual-lotto-board-results-file.netlify.app/.netlify/functions/dummyResults"

function normalizeGameName(gameName) {
    const nameMap = {
        "06": "o6",
        "clubmaster": "club master",
        "mark_II": "mark-ii",
        "msp": "monday special",
        "lucky_g": "lucky-g",
        "king": "premier king"   
    }

    const normalized = normalizeGameName.toLowerCase();
    return nameMap[normalized] || nameMap[gameName] || normalized;
}

export async function fetchGameResults() {
    try {
        const res = await fetch(RESULT_API, {
            method: "GET",
            credentials: "include",
            headers: {
              'Content-Type': 'application/json'
            },
      });

      // Detect network-level issue (res undefined or failed fetch)
      if (!res) {
          throw new Error("Network failure");
      }

      // Detect server-side error
      if (!res.ok) {
          if (res.status === 403) {
              throw new Error("Access denied");
          } else if (res.status === 404) {
              throw new Error("Results not found");
          } else {
              throw new Error(`Server error: ${res.status}`);
          }
      }

      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
          displayErrorMessage("No results available at this time.");
      }

      const transformedData = transformToYearlyStructure(data);
      return transformedData;

    } catch (err) {
        let message = "An unknown error occurred.";

        if (!navigator.onLine) {
            message = "No internet connection.";
        } else if (err.message.includes("Access denied")) {
            message = "Access to results is restricted.";
        } else if (err.message.includes("Results not found")) {
            message = "Lotto results could not be found.";
        } else if (err.message.includes("Server error")) {
            message = "There’s a problem fetching results — please try again later.";
        } else if (err.message.includes("Network failure")) {
            message = "Network failure — check your connection.";
        }

        displayErrorMessage(message);
        console.error("⚠️ Error:", err.message);
    }
}

function transformToYearlyStructure(newResults) {
    const yearlyStructure = {};

    for (const [gameName, gameData] of Object.entries(newResults)) {
        if (!gameData.draws || !Array.isArray(gameData.draws)) {
            continue;
        }

        yearlyStructure[gameName] = {};

        for (const draw of gameData.draws) {
            const year = extractYear(draw.date || draw.displayDate);

            if (!year) continue;

            if (!yearlyStructure[gameName][year]) {
                yearlyStructure[gameName][year] = [];
            }

            const normalizedDraw = normalizeDrawEntry(draw);
            yearlyStructure[gameName][year].push(normalizedDraw);
        }
    }

    return yearlyStructure;
}

function extractYear(stringDate) {
    if (!stringDate) return null;

    const matchDate = stringDate.match(/\b(202\d)\b/);
    return matchDate ? parseInt(matchDate[1]) : null; 
}

function normalizeDrawEntry(draw) {
    return {
        serialNumber: draw.serialNumber || "",
        date: draw.displayDate || draw.date || "",
        winningNumbers: normalizePosition(draw.winningNumbers, "winning"),
        machineNumbers: normalizePosition(draw.machineNumbers, "machine")
    };
}

function normalizeDrawStructure(draws) {
    if (!Array.isArray(draws)) return [];
    return draws.map(draw => normalizeDrawEntry(draw));
}

function normalizePosition(numbers, type) {
    if (!Array.isArray(numbers)) return [];

    const positionMap = {
        "position_1": `first_box_${type}`,
        "position_2": `second_box_${type}`,
        "position_3": `center_box_${type}`,
        "position_4": `forth_box_${type}`,
        "position_5": `last_box_${type}`
    };

    return numbers.map((num, index) => {
        // Handle both new format (with position field) and potential old format
        const oldPosition = num.position
            ? positionMap[num.position]
            : positionMap[`position_${index + 1}`];

        return {
            position: oldPosition || `position_${index + 1}_${type}`,
            number: num.number
        };
    });
}

// Helper to show message on the page
function displayErrorMessage(msg) {
    const container = document.getElementById('gamesContainer');
    if (container) {
        container.innerHTML = `<p class="error-message">${msg}</p>`;
    }
}
