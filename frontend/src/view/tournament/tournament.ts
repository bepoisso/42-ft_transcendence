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


export async function setTournament(router: Router) {

	try {
		const data = await fetchTournament();
		if (data.statusCode === 404 || !data.tournaments || data.tournaments.length === 0) {
			// que faire ?
		}
		data.tournaments.forEach(tournament => {

		})

	} catch (err) {
		console.error("Error fetching data tournament : ", err);
		router.navigate("/home");
		return undefined;
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
			if (data.statusCode !== 200) return; // faudrait faire un erreur message ici

		} catch (err) {
			console.log("Error creating tournament : ", err);
		}
	});
}





// ==================================================================================================
// 											JOIN TOURNAMENT											||
// ===================================================================================================



// il faut que chaque nouveau tournois affiché puisse etre cliquable pour s'inscrire.
// Le clique entrainera un prompt pour demander le name
// puis on va envoyer sur le back
async function joinTournament() {
	const btn = document.getElementById("pending-tournaments");
	btn?.addEventListener("click", async (e) => {
		e.preventDefault();
		const playerTName = prompt("Enter the name of the tournament : ") || "player";
	});

}


export async function tournamentHandler(router: Router) {

	await setTournament(router); // => il faut faire une boucle
	await createTournament();
	await joinTournament();
}

