import { Router } from "../../router";
import { searchBar } from "./toolbar";
import { fetchFriendsStatus } from "./fetchFriends";
import { getSocket } from "../../sockets/socket";

export function renderDashboard() {
  document.getElementById("app")!.innerHTML = `
    <div class="min-h-screen w-full overflow-x-hidden text-white flex flex-col">

      <!-- HEADER (full-width) -->
      <div class="w-full flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <!-- Recherche -->
        <div class="relative w-full max-w-xl">
		  <input
			type="text"
			id="search"
			placeholder="Search friends..."
			class="px-3 py-2 w-full rounded bg-gray-800 border border-gray-600 text-white focus:outline-none"
		  />
			<div id="search-results"
				class="absolute top-full left-0 mt-1 w-full bg-gray-800 rounded shadow-lg z-50 hidden">
			</div>
		</div>


        <!-- Avatar + Nom -->
        <div class="flex items-center gap-3 ml-4">
          <img id="user-avatar" src="../assets/basic_avatar.png" alt="Avatar"
               class="w-10 h-10 rounded-full object-cover border-2 border-white">
          <button id="user-name" class="font-bold text-lg  bg-blue-600 rounded hover:bg-blue-700">Loading...</button>
        </div>
      </div>

      <!-- CONTENU PRINCIPAL (2 colonnes) -->
      <div class="flex flex-1 w-full">

        <!-- Colonne gauche : 80% largeur -->
         <div class="w-4/5 p-6 space-y-6 border-r border-gray-700 flex flex-col">

          <!-- Carte Entraînement -->
          <div class="bg-indigo-950 p-4 rounded-lg space-y-4">
            <h3 class="text-lg font-bold mb-2 text-left">Training</h3>
            <div class="flex justify-between space-x-4">
              <button id="btnLocal" class="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Local</button>
              <button id="btnAI" class="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">AI</button>
            </div>
          </div>

          <!-- Carte Ranked -->
          <div class="bg-gray-800 p-4 rounded-lg space-y-4">
            <h3 class="text-lg font-bold mb-2 text-left">Ranked</h3>
            <div class="flex justify-between space-x-4">
              <button id="btnOnline" class="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Online</button>
              <button id="btnTournament" class="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Tournament</button>
            </div>
          </div>

		  <!-- Partie Rooms / Parties en cours -->
          <div class="bg-teal-950 p-4 rounded-lg flex-1 flex flex-col">
            <h3 class="text-lg font-bold mb-2 text-left">Rooms</h3>
            <div id="room-list" class="flex-1 overflow-y-auto space-y-3">
              <p class="text-gray-400">Aucune room disponible...</p>
            </div>
          </div>
        </div>

        <!-- Colonne droite : 20% largeur -->
        <div class="w-1/5 p-6 overflow-y-auto min-w-0">
          <h2 class="text-xl font-bold mb-4"> Friends </h2>
          <div id="friends-list" class="space-y-3">
            <p class="text-gray-400">No friends yet...</p>
          </div>
        </div>

      </div>
    </div>
  `;
}

// ==================================================================================================
// 					Appelle du back pour dynamiquement modifier les éléments						||
// ===================================================================================================

// // test sans back
// async function fecthUserData(token: string) {
// 	return {statusCode: 200, message: "all good", name: "Test"};
// }


async function fetchUserData() : Promise <{
	statusCode: number,
	message: string,
	id?: number,
	username?: string,
	tournament_name?: string,
	avatar_url?: string,
	email?: string,
	games_played?: number,
	games_won?: number,
	room_id?: number,
	avatarURL?: string,
	friend_list: string[]
}>{
	const response = await fetch("/api/userInfo", {
		method: "POST",
		credentials: 'include',
	});
	const data = await response.json();
	return data;
}


async function setDashboard(router: Router): Promise<number | undefined>
{
	try {
			const data = await fetchUserData();

			if (data.statusCode === 401) {
				router.navigate("/login");
			}
			else if (data.statusCode !== 200) {
				console.error("Error with dash : " + data.message);
				throw new Error("Failed to fetch user data");
			}

			// Sinon
			const userDiv = document.getElementById("user-name");
			if (userDiv) {
				userDiv.textContent = data.username!;
				localStorage.setItem("username", data.username!);
			}
			if (data.avatarURL) {
				const userAvatar = document.getElementById("user-avatar") as HTMLImageElement;
				if (userAvatar) userAvatar.src = data.avatarURL;
			}

			// Faudrait mettre la liste d'amis ici

			return data.id;
	} catch (err) {
		console.error("Error fetching user data:", err);
		return undefined;
	}
}



// ==================================================================================================
// 								Gestion de l'ensemble des boutons									||
// ===================================================================================================


export function modeClick(socket: WebSocket, btnId: string, modes: string, id: any)
{
	const btn = document.getElementById(btnId);
	btn?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		console.log("TEST BOUTON "+ modes);

		socket.send(JSON.stringify({
			type: "game_accepted",
			from: id,
			mode: modes,
		}))

	});
}


// ==================================================================================================
// 								Pouvoir cliquer sur son profil										||
// ===================================================================================================

export function myProfileClick(router: Router)
{
	const btnMyProfile = document.getElementById("user-name");
	btnMyProfile?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		router.navigate("/myProfile");
	});
}



async function isInGame(): Promise<number>
{
	try {
		const data = await fetchUserData();
			return data.room_id!;
	} catch (err) {
		console.error("Error fetching user data:", err);
		return -1;
	}
}

export function matchmaking(socket: WebSocket, id: any)
{
	const btnMyProfile = document.getElementById("btnOnline");
	btnMyProfile?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		socket.send(JSON.stringify({
			type: "matchmaking",
			from: id,
		//	mode: modes,
		}))

	});
}


export async function dashboardHandler(router: Router)
{
	const socket = getSocket(router);
	const id = setDashboard(router);
	if (!id) return;

	const roomId = await isInGame();

	if (roomId > 0) {
		socket.send(JSON.stringify({
			type: "reconnect",
			from: id,
			roomId: roomId,
		}))
	}
	myProfileClick(router);

	modeClick(socket, "btnLocal", "local", id);
	modeClick(socket, "btnAI", "AI", id);
	//modeClick(socket, router, "btnOnline", "online", id); => build logique marchmaking
	fetchFriendsStatus(router); // a placer dans setDash

	searchBar(router);
	//Penser a la logique de tournois

	matchmaking(socket, id);

	//testFakeInvite();
}

