"use strict";

//Logic to get actual year to footer
document.getElementById("footer-year").textContent = new Date().getFullYear();

// Load data in localStorage
let matchesData = JSON.parse(localStorage.getItem("matchesData")) || [];
let matchIdCounter = matchesData.length
  ? Math.max(...matchesData.map((m) => m.id)) + 1
  : 0;

// Save the data on Local Storage
function saveMatches() {
  localStorage.setItem("matchesData", JSON.stringify(matchesData));
}

function renderMatches() {
  const matchHistory = document.getElementById("matchHistory");
  matchHistory.innerHTML =
    "<h2 class='item-menu hist-titulo'>PARTIDAS REGISTRADAS</h2>  <p id='msg-nomatches'>Sem partidas para exibir no momento</p>";

  if (matchesData && matchesData.length) {
    document.getElementById("msg-nomatches").style.display = "none";
  } else {
    document.getElementById("msg-nomatches").style.display = "block";
  }
  matchesData.forEach((match) => {
    const matchEntry = document.createElement("div");
    matchEntry.classList.add("match-entry");
    matchEntry.dataset.matchId = match.id;

    matchEntry.innerHTML = `
          <div class="match-header">
            <span><strong class="team">Clã do Pé</strong> (${match.ourSets}) x (${match.opponentSets}) <strong class="team">${match.opponentName}</strong> - ${match.matchDate}</span>
            <div>
              <button class="toggle-button" onclick="toggleDropdown(${match.id}, this)">▼</button>
              <button class="toggle-button" style="background-color: red;" onclick="deleteMatch(${match.id})">X</button>
            </div>
          </div>
          <div class="dropdown-content" id="dropdown-${match.id}" style="display: none;">
            <div id="set-list-${match.id}"></div>
            <div class="set-form" id="set-form-${match.id}">
              <input type="number" id="ourScoreInput-${match.id}" min="0" placeholder="Nosso Placar">
              <input type="number" id="opponentScoreInput-${match.id}" min="0" placeholder="Placar Adversário">
              <button class="add-button" onclick="confirmSet(${match.id})">Adicionar Set</button>
            </div>
          </div>
        `;

    matchHistory.appendChild(matchEntry);
    renderSets(match.id);
  });
}

function renderSets(matchId) {
  const match = matchesData.find((m) => m.id === matchId);
  const setList = document.getElementById(`set-list-${matchId}`);
  if (!setList) return;
  setList.innerHTML = "";
  match.sets.forEach((set, index) => {
    const setEntry = document.createElement("div");
    setEntry.classList.add("set-entry");
    setEntry.innerHTML = `
          <label>${index + 1}º set:</label>
          <input type="number" min="0" value="${
            set.ourScore
          }" placeholder="Nosso Placar" onchange="updateSet(${matchId}, ${index}, this, 'our')">
          <input type="number" min="0" value="${
            set.opponentScore
          }" placeholder="Placar Adversário" onchange="updateSet(${matchId}, ${index}, this, 'opponent')">
          <button class="toggle-button" style="background-color: red;" onclick="deleteSet(${matchId}, ${index})">X</button>
        `;
    setList.appendChild(setEntry);
  });
}

function updateSet(matchId, setIndex, inputElement, team) {
  const match = matchesData.find((m) => m.id === matchId);
  if (team === "our") {
    match.sets[setIndex].ourScore = inputElement.value;
  } else {
    match.sets[setIndex].opponentScore = inputElement.value;
  }
  saveMatches();
}

//Helper function to convert to brazilian date type
function formatBrazilianDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function addMatch() {
  const ourSets = document.getElementById("ourSets").value;
  const opponentSets = document.getElementById("opponentSets").value;
  const opponentName = document.getElementById("opponentName").value;
  const matchDate = document.getElementById("matchDate").value;

  if (!ourSets || !opponentSets || !opponentName || !matchDate) {
    alert("Preencha todos os campos!");
    return;
  }

  const newMatch = {
    id: matchIdCounter++,
    ourSets: ourSets,
    opponentSets: opponentSets,
    opponentName: opponentName,
    matchDate: formatBrazilianDate(matchDate),
    sets: [], // Array para os sets
  };

  matchesData.push(newMatch);
  saveMatches();
  renderMatches();

  document.getElementById("ourSets").value = "";
  document.getElementById("opponentSets").value = "";
  document.getElementById("opponentName").value = "";
  document.getElementById("matchDate").value = "";
}

function toggleDropdown(matchId, button) {
  const dropdown = document.getElementById(`dropdown-${matchId}`);
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

function deleteMatch(matchId) {
  matchesData = matchesData.filter((m) => m.id !== matchId);
  saveMatches();
  renderMatches();
}

function confirmSet(matchId) {
  const ourScoreInput = document.getElementById(`ourScoreInput-${matchId}`);
  const opponentScoreInput = document.getElementById(
    `opponentScoreInput-${matchId}`
  );
  const ourScore = ourScoreInput.value;
  const opponentScore = opponentScoreInput.value;

  if (ourScore === "" || opponentScore === "") {
    alert("Preencha ambos os placares!");
    return;
  }

  const match = matchesData.find((m) => m.id === matchId);
  match.sets.push({ ourScore: ourScore, opponentScore: opponentScore });
  saveMatches();
  renderMatches();

  // Makes the dropdown remains after refreshing the page
  const dropdown = document.getElementById(`dropdown-${matchId}`);
  dropdown.style.display = "block";
}

function deleteSet(matchId, setIndex) {
  const match = matchesData.find((m) => m.id === matchId);
  match.sets.splice(setIndex, 1);
  saveMatches();
  renderMatches();
  const dropdown = document.getElementById(`dropdown-${matchId}`);
  dropdown.style.display = "block";
}

// Make everything works after refreshing
window.onload = function () {
  renderMatches();
};
