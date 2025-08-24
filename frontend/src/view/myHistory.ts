import { Router } from "../router";

export function renderHistoric() {
  document.getElementById("app")!.innerHTML = `
    <div class="min-h-screen w-full overflow-x-hidden overflow-y-auto text-white flex flex-col bg-gray-900">

      <!-- HEADER -->
      <div class="w-full flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <h1 class="text-xl font-bold">My Game History</h1>
        <button id="back-profile" class="px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-sm">
          Back to Profile
        </button>
      </div>

      <!-- CONTENU -->
      <div class="flex flex-col p-6 space-y-6">

        <!-- Stats rapides (optionnel) -->
        <div class="flex gap-6">
          <div class="flex-1 bg-gray-800 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold" id="total-games">0</p>
            <p class="text-gray-400">Total Games</p>
          </div>
          <div class="flex-1 bg-gray-800 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold" id="total-wins">0</p>
            <p class="text-gray-400">Wins</p>
          </div>
        </div>

        <!-- Liste des parties -->
        <div class="rounded-lg bg-gray-800 p-4">
          <h2 class="text-lg font-bold border-b border-gray-700 pb-2 mb-4">Game History</h2>
          <div id="game-history" class="space-y-2 max-h-[60vh] overflow-y-auto">
            <p class="text-gray-400">Chargement de l’historique...</p>
          </div>
        </div>

      </div>
    </div>
  `;

}


type Game = {
	id: number;
	player_id_left: number;
	username_left: string;
	player_id_right: number;
	username_right: string;
	player_id_won: number;
	game_date: string;
	score: string;
}

async function fetchHistory(): Promise<{
	statusCode: number,
	message?: string,
	games: Game[]
}> {
	const response = await fetch("/back/api/get/game/history", {
		method: "GET",
		credentials: 'include',
	});
	return await response.json();
}


async function setHistory() {

	try {
		const data = await fetchHistory();

		const historyEl = document.getElementById("game-history")!;

		if (data.statusCode === 404 || !data.games || data.games.length === 0) {
			historyEl.innerHTML = '<p class="text-gray-400">Aucune partie trouvée.</p>';
			return;
		}

		// Génère le HTML pour chaque partie
		data.games.forEach(game => {

		const winner =
			game.player_id_won === game.player_id_left
			? game.username_left
			: game.username_right;
		const loser =
			game.player_id_won === game.player_id_left
			? game.username_right
			: game.username_left;

		const gameHTML = `
			<div class="bg-gray-700 p-3 rounded flex justify-between items-center">
			<div>
				<p class="text-sm">
				<span class="font-semibold text-green-400">${winner}</span>
				vs
				<span class="font-semibold text-red-400">${loser}</span>
				</p>
				<p class="text-xs text-gray-400">${game.game_date}</p>
			</div>
			<div class="text-right">
				<p class="text-sm font-bold text-white">${game.score}</p>
			</div>
			</div>
		`;
		historyEl.insertAdjacentHTML("beforeend", gameHTML);
		});






	} catch (err) {
		console.log("Error fetching history : ", err)
	}
}

export async function historyHandler() {

	setHistory();


}
