import { Router } from "../../router";

export function renderTournaments() {
  document.getElementById("app")!.innerHTML = `
    <div class="min-h-screen w-full bg-gray-900 text-white flex flex-col">

      <!-- HEADER -->
      <div class="w-full flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <h1 class="text-xl font-bold">Tournois</h1>
        <button id="back-dashboard" class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">← Retour</button>
      </div>

      <!-- CONTENU -->
      <div class="flex flex-col p-6 space-y-8">

        <!-- Choix du format -->
        <div class="space-y-4">
          <h2 class="text-lg font-bold border-b border-gray-700 pb-2 text-left">Créer un tournoi</h2>
          <div class="flex gap-4">
            <button id="createTournament" class="px-6 py-3 bg-green-600 rounded hover:bg-green-700 font-semibold">
              Tournoi 8 joueurs
            </button>
          </div>
          <p id="tournament-message" class="text-sm mt-2"></p>
        </div>

        <!-- Liste des tournois en attente -->
        <div class="space-y-4">
          <h2 class="text-lg font-bold border-b border-gray-700 pb-2 text-left">Tournois en attente</h2>
          <div id="pending-tournaments" class="space-y-2">
            <p class="text-gray-400">Chargement des tournois...</p>
          </div>
          <!-- Message d'erreur -->
          <p id="error" class="text-sm text-red-500"></p>
        </div>

      </div>
    </div>
  `;
}




// ==================================================================================================
// 									MET A JOUR LES TOURNOIS											||
// ===================================================================================================

export type Tournament = {
	id: number;
	tournament_name: string;
	player_1: number;
	player_2?: number | null;
	player_3?: number | null;
	player_4?: number | null;
	player_5?: number | null;
	player_6?: number | null;
	player_7?: number | null;
	player_8?: number | null;
	tournament_date: string;
}



async function fetchTournament(): Promise<{
	statusCode: number;
	message: string;
	tournaments: Tournament[]
}> {
	const response = await fetch("/back/api/get/tournament/pending", { // changer la route
		method: "GET",
		credentials: 'include',
	});

	if (!response.ok) {
		console.error(`HTTP error! status: ${response.status}`);
		const text = await response.text();
		console.error('Response:', text);
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	return data;
}



function countPlayers(tournament: Tournament): number {
  const players = [
    tournament.player_1,
    tournament.player_2,
    tournament.player_3,
    tournament.player_4,
    tournament.player_5,
    tournament.player_6,
    tournament.player_7,
    tournament.player_8,
  ];
  // On compte ceux qui sont définis (et non null)
  return players.filter(p => p !== null && p !== undefined).length;
}

export async function setTournament(router: Router) {
	try {
		const data = await fetchTournament();
		const container = document.getElementById("pending-tournaments")!;

		if (data.statusCode === 404 || !data.tournaments || data.tournaments.length === 0) {
			container.innerHTML = '<p class="text-gray-400">Aucun tournoi disponible.</p>';
			return;
		}

		container.innerHTML = ""; // reset affichage
		data.tournaments.forEach(tournament => {
			const playerCount = countPlayers(tournament);

			const tournamentHTML = `
				<button
					class="w-full bg-gray-800 p-3 rounded-lg hover:bg-gray-700 text-left"
					data-id="${tournament.id}"
					data-name="${tournament.tournament_name}">
					<div class="flex justify-between items-center">
						<div>
							<p class="font-semibold">${tournament.tournament_name}</p>
							<p class="text-xs text-gray-400">Created the ${new Date(tournament.tournament_date).toLocaleString("en-EN")}</p>
						</div>
						<span class="text-sm font-bold text-green-400">${playerCount}/8</span>
					</div>
				</button>
			`;
			container.insertAdjacentHTML("beforeend", tournamentHTML);
		});
	} catch (err) {
		console.error("Error fetching data tournament : ", err);
	}
}




// ==================================================================================================
// 									CREATION TOURNOIS												||
// ===================================================================================================

async function saveTournament(playerTname: string, nameOfTournament: string): Promise<{
	statusCode: number;
	message: string;
	tournaments: Tournament[]
}> {
	const response = await fetch("/back/api/createTournament", { // changer la route
		method: "POST",
		credentials: 'include',
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			tournamentName: nameOfTournament,
			playerTName: playerTname
		}),
	});

	if (!response.ok) {
		console.error(`HTTP error! status: ${response.status}`);
		const text = await response.text();
		console.error('Response:', text);
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	return data;
}


async function createTournament() {

	const btn = document.getElementById("createTournament");
	btn?.addEventListener("click", async (e) => {
		e.preventDefault();

		const nameOfTournament = prompt("Enter the name of the tournament : ") || "Tournament";
		const tournamentName = prompt("Enter your name ! ") || "name tournament";

		try {
			const data = await saveTournament(tournamentName, nameOfTournament);
			if (data.statusCode >= 400) {
				if (data.statusCode === 401) {data.message = "Invalid name for tournament or username"}
				const errorMessage = document.getElementById("error");
				if (errorMessage) {
					errorMessage.textContent = data.message;
				}
			}

		} catch (err) {
			console.log("Error creating tournament : ", err);
		}
	});
}





// ==================================================================================================
// 											JOIN TOURNAMENT											||
// ===================================================================================================


async function tryJoinTournament(tournamentName: string, playerTName: string): Promise<{
	statusCode: number;
	message: string;
}> {
	const response = await fetch("/back/api/joinTournament", { // changer la route
		method: "POST",
		credentials: 'include',
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			tournamentName: tournamentName,
			playerTName: playerTName
		}),
	});

	if (!response.ok) {
		console.error(`HTTP error! status: ${response.status}`);
		const text = await response.text();
		console.error('Response:', text);
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	return data;
}




// il faut que chaque nouveau tournois affiché puisse etre cliquable pour s'inscrire.
// Le clique entrainera un prompt pour demander le name
// puis on va envoyer sur le back
async function joinTournament() {
	const container = document.getElementById("pending-tournaments");
	container?.addEventListener("click", async (e) => {
		const target = e.target as HTMLElement;
		const button = target.closest("button[data-id]") as HTMLButtonElement;
		if (!button) return;

		const tournamentName = button.getAttribute("data-name") || "";
		const playerTName = prompt("Enter your name !") || "player";

		console.log(`Player ${playerTName} joins tournament : ${tournamentName}`);
		try {
			const data = await tryJoinTournament(tournamentName, playerTName);
			if (data.statusCode >= 400) {
				if (data.statusCode === 401) {data.message = "Invalid name for username"}
				const errorMessage = document.getElementById("error");
				if (errorMessage) {
					errorMessage.textContent = data.message;
				}
			}


		} catch (err) {
			console.error("Error fetching data tournament : ", err);
		}

	});
}




export async function tournamentHandler(router: Router) {

	await setTournament(router);

	setInterval(async () => {
		await setTournament(router);
	}, 5000);

	await createTournament();
	await joinTournament();
}

