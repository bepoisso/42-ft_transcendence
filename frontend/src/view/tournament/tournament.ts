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
            <button id="create-tournament-8" class="px-6 py-3 bg-green-600 rounded hover:bg-green-700 font-semibold">
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

async function setTournament(router: Router): Promise<{}> {
	const response = await fetch("/back/api/get/user/private", { // changer la route
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


export async function tournamentHandler(router: Router) {

	try {
		const data = await setTournament(router);

	} catch (err) {
		console.error("Error fetching data tournament : ", err);
		router.navigate("/login");
		return undefined;
	}


}

