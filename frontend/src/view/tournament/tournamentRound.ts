import type { Router } from "../../router";

export function renderTournamentTree() {
  document.getElementById("app")!.innerHTML = `
    <div class="bg-gradient-to-br from-gray-900 to-gray-900 text-white min-h-screen py-4">
      <!-- Header -->
      <div class="text-center py-4">
        <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
          🏆 Tournament Bracket
        </h1>
        <p class="text-gray-300 text-base">8-Player Single Elimination</p>
      </div>

      <!-- Arbre du tournois -->
      <div class="flex items-start justify-between px-6 py-2 max-w-full mx-auto">

        <!-- Tournament Bracket -->
        <div class="flex flex-col items-center space-y-6 flex-1">

          <!-- Winner -->
          <div class="flex flex-col items-center space-y-2">
            <div class="text-center">
              <h3 class="text-base font-semibold text-yellow-400 uppercase tracking-wider">Final</h3>
            </div>
            <div class="px-5 py-3 rounded-2xl cursor-pointer min-w-[160px] min-h-[100px] text-center flex flex-col items-center justify-center bg-gradient-to-r from-yellow-500/20 via-yellow-600/20 to-orange-500/20 border-3 border-yellow-300 shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-200">
              <div class="relative mb-2">
                <img id="avatar_win" src="/assets/basic_avatar.png" alt="Champion" class="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover">
              </div>
              <div class="flex flex-col items-center">
                <span class="text-xl mb-1">👑</span>
                <span id="champion_name" class="font-bold text-sm text-yellow-400">CHAMPION</span>
                <div class="text-xs text-yellow-200 mt-1">Winner</div>
              </div>
            </div>
          </div>

          <!-- 2 joueurs -->
          <div class="flex flex-col items-center space-y-2">
            <div class="text-center">
              <h3 class="text-sm font-semibold text-orange-400 uppercase tracking-wider">Semi-Finals</h3>
            </div>
            <div class="flex space-x-10">
              <div class="px-4 py-3 rounded-xl shadow-xl cursor-pointer min-w-[130px] min-h-[85px] text-center flex flex-col items-center justify-center bg-gradient-to-r from-orange-500/20 via-orange-600/20 to-red-500/20 border-2 border-orange-400 hover:border-orange-300 transition-all duration-200">
                <div class="relative mb-1">
                  <img id="finalist_avatar_1" src="/assets/basic_avatar.png" alt="Finalist 1" class="w-10 h-10 rounded-full border-2 border-orange-400 object-cover">
                </div>
                <span id="finalist_name_1" class="font-bold text-sm text-white">Finalist 1</span>
                <div class="text-xs text-orange-400 opacity-80 mt-1">Semi Winner</div>
              </div>

              <div class="px-4 py-3 rounded-xl shadow-xl cursor-pointer min-w-[130px] min-h-[85px] text-center flex flex-col items-center justify-center bg-gradient-to-r from-orange-500/20 via-orange-600/20 to-red-500/20 border-2 border-orange-400 hover:border-orange-300 transition-all duration-200">
                <div class="relative mb-1">
                  <img id="finalist_avatar_2" src="/assets/basic_avatar.png" alt="Finalist 2" class="w-10 h-10 rounded-full border-2 border-orange-400 object-cover">
                </div>
                <span id="finalist_name_2" class="font-bold text-sm text-white">Finalist 2</span>
                <div class="text-xs text-orange-400 opacity-80 mt-1">Semi Winner</div>
              </div>
            </div>
          </div>

          <!-- 4 joueurs -->
          <div class="flex flex-col items-center space-y-2">
            <div class="text-center">
              <h3 class="text-sm font-semibold text-purple-400 uppercase tracking-wider">Quarter-Finals</h3>
            </div>
            <div class="flex space-x-6">
              <div class="px-3 py-2 rounded-xl shadow-lg cursor-pointer min-w-[110px] min-h-[75px] text-center flex flex-col items-center justify-center bg-gray-800/50 border-2 border-purple-400 hover:bg-gray-700/50 hover:border-purple-300 transition-all duration-200">
                <div class="relative mb-1">
                  <img id="semi_avatar_1" src="/assets/basic_avatar.png" alt="Semi Player 1" class="w-8 h-8 rounded-full border-2 border-purple-500 object-cover">
                </div>
                <span id="semi_name_1" class="font-bold text-xs text-white">Semi 1</span>
                <div class="text-xs text-purple-400 opacity-80">Winner Q1</div>
              </div>

              <div class="px-3 py-2 rounded-xl shadow-lg cursor-pointer min-w-[110px] min-h-[75px] text-center flex flex-col items-center justify-center bg-gray-800/50 border-2 border-purple-400 hover:bg-gray-700/50 hover:border-purple-300 transition-all duration-200">
                <div class="relative mb-1">
                  <img id="semi_avatar_2" src="/assets/basic_avatar.png" alt="Semi Player 2" class="w-8 h-8 rounded-full border-2 border-purple-500 object-cover">
                </div>
                <span id="semi_name_2" class="font-bold text-xs text-white">Semi 2</span>
                <div class="text-xs text-purple-400 opacity-80">Winner Q2</div>
              </div>

              <div class="px-3 py-2 rounded-xl shadow-lg cursor-pointer min-w-[110px] min-h-[75px] text-center flex flex-col items-center justify-center bg-gray-800/50 border-2 border-purple-400 hover:bg-gray-700/50 hover:border-purple-300 transition-all duration-200">
                <div class="relative mb-1">
                  <img id="semi_avatar_3" src="/assets/basic_avatar.png" alt="Semi Player 3" class="w-8 h-8 rounded-full border-2 border-purple-500 object-cover">
                </div>
                <span id="semi_name_3" class="font-bold text-xs text-white">Semi 3</span>
                <div class="text-xs text-purple-400 opacity-80">Winner Q3</div>
              </div>

              <div class="px-3 py-2 rounded-xl shadow-lg cursor-pointer min-w-[110px] min-h-[75px] text-center flex flex-col items-center justify-center bg-gray-800/50 border-2 border-purple-400 hover:bg-gray-700/50 hover:border-purple-300 transition-all duration-200">
                <div class="relative mb-1">
                  <img id="semi_avatar_4" src="/assets/basic_avatar.png" alt="Semi Player 4" class="w-8 h-8 rounded-full border-2 border-purple-500 object-cover">
                </div>
                <span id="semi_name_4" class="font-bold text-xs text-white">Semi 4</span>
                <div class="text-xs text-purple-400 opacity-80">Winner Q4</div>
              </div>
            </div>
          </div>

          <!-- 8 joueurs -->
          <div class="flex flex-col items-center space-y-3">
            <div class="text-center">
              <h3 class="text-sm font-semibold text-blue-400 uppercase tracking-wider">Round 1</h3>
            </div>
            <div class="flex flex-wrap justify-center gap-3 max-w-4xl">
              <div class="px-2 py-2 rounded-lg shadow-lg cursor-pointer min-w-[95px] min-h-[70px] text-center flex flex-col items-center justify-center border-2 border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-blue-400 transition-all duration-200">
                <div class="relative mb-1">
                  <img src="/assets/basic_avatar.png" id="img_player_1" class="w-7 h-7 rounded-full border-2 border-blue-500 object-cover">
                </div>
                <span id="player_1" class="font-semibold text-xs text-white">Player 1</span>
                <span class="text-xs text-blue-400 opacity-80">#1</span>
              </div>

              <div class="px-2 py-2 rounded-lg shadow-lg cursor-pointer min-w-[95px] min-h-[70px] text-center flex flex-col items-center justify-center border-2 border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-blue-400 transition-all duration-200">
                <div class="relative mb-1">
                  <img src="/assets/basic_avatar.png" id="img_player_2" class="w-7 h-7 rounded-full border-2 border-blue-500 object-cover">
                </div>
                <span id="player_2" class="font-semibold text-xs text-white">Player 2</span>
                <span class="text-xs text-blue-400 opacity-80">#2</span>
              </div>

              <div class="px-2 py-2 rounded-lg shadow-lg cursor-pointer min-w-[95px] min-h-[70px] text-center flex flex-col items-center justify-center border-2 border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-blue-400 transition-all duration-200">
                <div class="relative mb-1">
                  <img src="/assets/basic_avatar.png" id="img_player_3" class="w-7 h-7 rounded-full border-2 border-blue-500 object-cover">
                </div>
                <span id="player_3" class="font-semibold text-xs text-white">Player 3</span>
                <span class="text-xs text-blue-400 opacity-80">#3</span>
              </div>

              <div class="px-2 py-2 rounded-lg shadow-lg cursor-pointer min-w-[95px] min-h-[70px] text-center flex flex-col items-center justify-center border-2 border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-blue-400 transition-all duration-200">
                <div class="relative mb-1">
                  <img src="/assets/basic_avatar.png" id="img_player_4" class="w-7 h-7 rounded-full border-2 border-blue-500 object-cover">
                </div>
                <span id="player_4" class="font-semibold text-xs text-white">Player 4</span>
                <span class="text-xs text-blue-400 opacity-80">#4</span>
              </div>

              <div class="px-2 py-2 rounded-lg shadow-lg cursor-pointer min-w-[95px] min-h-[70px] text-center flex flex-col items-center justify-center border-2 border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-blue-400 transition-all duration-200">
                <div class="relative mb-1">
                  <img src="/assets/basic_avatar.png" id="img_player_5" class="w-7 h-7 rounded-full border-2 border-blue-500 object-cover">
                </div>
                <span id="player_5" class="font-semibold text-xs text-white">Player 5</span>
                <span class="text-xs text-blue-400 opacity-80">#5</span>
              </div>

              <div class="px-2 py-2 rounded-lg shadow-lg cursor-pointer min-w-[95px] min-h-[70px] text-center flex flex-col items-center justify-center border-2 border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-blue-400 transition-all duration-200">
                <div class="relative mb-1">
                  <img src="/assets/basic_avatar.png" id="img_player_6" class="w-7 h-7 rounded-full border-2 border-blue-500 object-cover">
                </div>
                <span id="player_6" class="font-semibold text-xs text-white">Player 6</span>
                <span class="text-xs text-blue-400 opacity-80">#6</span>
              </div>

              <div class="px-2 py-2 rounded-lg shadow-lg cursor-pointer min-w-[95px] min-h-[70px] text-center flex flex-col items-center justify-center border-2 border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-blue-400 transition-all duration-200">
                <div class="relative mb-1">
                  <img src="/assets/basic_avatar.png" id="img_player_7" class="w-7 h-7 rounded-full border-2 border-blue-500 object-cover">
                </div>
                <span id="player_7" class="font-semibold text-xs text-white">Player 7</span>
                <span class="text-xs text-blue-400 opacity-80">#7</span>
              </div>

              <div class="px-2 py-2 rounded-lg shadow-lg cursor-pointer min-w-[95px] min-h-[70px] text-center flex flex-col items-center justify-center border-2 border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-blue-400 transition-all duration-200">
                <div class="relative mb-1">
                  <img src="/assets/basic_avatar.png" id="img_player_8" class="w-7 h-7 rounded-full border-2 border-blue-500 object-cover">
                </div>
                <span id="player_8" class="font-semibold text-xs text-white">Player 8</span>
                <span class="text-xs text-blue-400 opacity-80">#8</span>
              </div>
            </div>
          </div>
        </div>
  `;
}


interface tournament {
	statusCode: number;
	message: string;
	tournament?: {
		id: number;
		tournament_name: string;
		players: {
		id: number;
		username: string;
		avatar_url: string;
		}[];
		games: {
		id: number;
		round: number;
		poule: number;
		player1_id: number;
		player2_id: number;
		winner_id: number | null;
		status: string;
		}[];
		current_round: number;
		tournament_status: string;
	};
}

async function fetchTournament(tournament_id: number): Promise<tournament> {
	const response = await fetch("/back/api/tournament/info", {
		method: "POST",
		credentials: 'include',
		headers: {
		"Content-Type": "application/json",
		},
		body: JSON.stringify({tournamentId: tournament_id}),
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


async function displayTournament(T: {
	id: number;
	tournament_name: string;
	players: {
		id: number;
		username: string;
		avatar_url: string;
	}[];
	games: {
		id: number;
		round: number;
		poule: number;
		player1_id: number;
		player2_id: number;
		winner_id: number | null;
		status: string;
	}[];
	current_round: number;
	tournament_status: string;
}) {
	if (!T) {
		console.error("No tournament data provided");
		return;
	}

	let quarter_done = false;
	let semi_done = false;

	try {
		console.log("result 1/8");
		for (let i = 0; i < 8; i++) {
			const player = T.players[i];
			const avatarEl = document.getElementById(`img_player_${i + 1}`);
			const nameEl = document.getElementById(`player_${i + 1}`);

			if (avatarEl && nameEl && player) {
				// Mettre à jour l'avatar
				if (player.avatar_url) {
				(avatarEl as HTMLImageElement).src = player.avatar_url;
				}

				// Mettre à jour le nom
				if (player.username) {
				nameEl.textContent = player.username;
				}
			}
		}

		console.log("result 1/4");
		// on va filtrer l'ensemble des games du tournois avec celle du deuxieme round
		const semiGames = T.games.filter(g => g.round === 2);
		for (let i = 0; i < semiGames.length; i++) {
			if (semiGames[i].status === "finished") {
				// si je trouve un match, je dois print les
				const winner = T.players.find(p => p.id === semiGames[i].winner_id);

				const avatarEl = document.getElementById(`semi_avatar_${i + 1}`);
				const nameEl = document.getElementById(`semi_name_${i + 1}`);

				if (avatarEl && nameEl && winner) {
					// Mettre à jour l'avatar
					if (winner.avatar_url) {
						(avatarEl as HTMLImageElement).src = winner.avatar_url;
					}
					// Mettre à jour le nom
					if (winner.username) {
						nameEl.textContent = winner.username;
					}
				}
			}
			quarter_done = semiGames.every(g => g.status === "finished");
		}


		console.log("result 1/2 ");

		const finalGame = T.games.filter(g => g.round === 3);
			for (let i = 0; i < finalGame.length; i++) {
				if (finalGame[i].status === "finished") {

					// si je trouve un match, je dois print les
					const winner = T.players.find(p => p.id === finalGame[i].winner_id);

					const avatarEl = document.getElementById(`finalist_avatar_${i + 1}`);
					const nameEl = document.getElementById(`finalist_name_${i + 1}`);

					if (avatarEl && nameEl && winner) {
						// Mettre à jour l'avatar
						if (winner.avatar_url) {
							(avatarEl as HTMLImageElement).src = winner.avatar_url;
						}
						// Mettre à jour le nom
						if (winner.username) {
							nameEl.textContent = winner.username;
						}
					}
				}
				semi_done = semiGames.every(g => g.status === "finished");
			}

		const winner = T.games.find(g => g.round === 4);
		if (winner && winner.status === "finished") {
			// si je trouve un match, je dois print les
			const champ = T.players.find(p => p.id === winner.winner_id);

			const avatarEl = document.getElementById("avatar_win");
			const nameEl = document.getElementById("champion_name");

			if (avatarEl && nameEl && champ) {
				if (champ.avatar_url) {
				(avatarEl as HTMLImageElement).src = champ.avatar_url;
				}
				if (champ.username) {
				nameEl.textContent = champ.username;
				}
			}
		}
	} catch (error) {
		console.error("Error displaying tournament data:", error);
	}

	return {quarter_done, semi_done};
}




async function nextRound(tournament_id: number, round: string) {
	const response = await fetch(`/back/api/tournament/${round}`, {
		method: "POST",
		credentials: 'include',
		headers: {
		"Content-Type": "application/json",
		},
		body: JSON.stringify({tournamentId: tournament_id}),
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





export async function tournamentRound(router: Router, id: string) {

	const tournamentId = Number(id);

	try {

		const checkTournament = async () => {
			const data = await fetchTournament(tournamentId);


			// Afficher les données du tournoi
			if (!data.tournament) return;

			const ready = await displayTournament(data.tournament);

			if (!ready?.quarter_done) {
				return ;
			}
			else if (ready?.quarter_done && !ready.semi_done) {
				nextRound(tournamentId, "semi");
			}
			else if (ready.quarter_done && ready.semi_done) {
				nextRound(tournamentId, "final");
			}
		}
		setInterval(checkTournament, 5000);


	} catch (err) {
		console.error("Error fetching tournament data:", err);
		router.navigate("/home");
		return undefined;
	}
}
