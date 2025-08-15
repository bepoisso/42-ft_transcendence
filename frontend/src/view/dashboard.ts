import { Router } from "../router";
import { initWebSocket, getWebSocket } from "../game/singleton";



export function renderDashboard() {
  document.getElementById("app")!.innerHTML = `
    <div class="min-h-screen w-full overflow-x-hidden text-white flex flex-col">

      <!-- HEADER (full-width) -->
      <div class="w-full flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <!-- Recherche -->
        <input
          type="text"
          placeholder="Rechercher..."
          class="px-3 py-2 w-full max-w-xl rounded bg-gray-800 border border-gray-600 text-white focus:outline-none"
        />

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
              <button id="btnAI" class="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Local</button>
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
          <div id="game-list" class="space-y-3">
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
async function fetchUserData(token: string) : Promise <{
	statusCode: number,
	message?: string,
	name: string,
	avatarURL?: string
	// Il faudra aussi ajouter les amis et meme tous les gens disponibles non ?
}>
{
	const response = await fetch("/api/dashboard", {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});
	const data = await response.json();
	return data;
}


export async function setDashboard()
{
	const token = localStorage.getItem("token");
	if (!token) return;

	try {
			const data = await fetchUserData(token);

			// Soit on ne parvient pas à récup les infos
			if (data.statusCode !== 200) {
				// Handle l'erreur

				console.error("Error with dash : " + data.message);
				throw new Error("Failed to fetch user data");

			}

			// Sinon
			const userDiv = document.getElementById("user-name");
			if (userDiv) {
				userDiv.textContent = data.name;
				localStorage.setItem("username", data.name);
			}
			if (data.avatarURL) {
				const userAvatar = document.getElementById("user-avatar") as HTMLImageElement;
				if (userAvatar) userAvatar.src = data.avatarURL;
			}


	} catch (err) {
		console.error("Error fetching user data:", err);
	}
}



// ==================================================================================================
// 								Gestion de l'ensemble des boutons									||
// ===================================================================================================


export function modeClick(router: Router, btnId: string, modes: string)
{
	const btn = document.getElementById(btnId);
	btn?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement


		const token = localStorage.getItem("token");
		const username = localStorage.getItem("username");
		console.log("TEST BOUTON LOCAL");

		const ws = initWebSocket(token);

		ws.addEventListener("open", () => {
			ws.send(JSON.stringify({
				type: "createRoom",
				mode: modes,
				playerName: username
			}));
		});

		ws.addEventListener("message", (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "roomCreated") {

				// Log test
				console.log("Room créée :", data.roomId);

				// Rediriger la route
				router.navigate(`/game/${data.roomId}`);
			}
		});
	});
}



async function myProfile(token: string): Promise <{statusCode: number, message?: string}>
{
	const response = await fetch("/api/myProfile", {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});
	const data = await response.json();
	return data;
}

export function myProfileClick(router: Router)
{
	const btnMyProfile = document.getElementById("user-name");
	btnMyProfile?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		const token = localStorage.getItem("token");
		if (!token) return;

		try {
				const data = await myProfile(token);
				if (data.statusCode !== 200) {
					console.error("Error with dashboard : " + data.message);
					throw new Error("Failed to go to myProfile");
				}
				router.navigate("/myProfile");

		} catch (err) {
				console.error("Error going to myProfile :", err);
		}

	});
}

export function dashboardHandler(router: Router)
{
	modeClick(router, "btnLocal", "local");
	modeClick(router, "btnAI", "AI");
	modeClick(router, "btnOnline", "online");
	myProfileClick(router);
	// Penser a la logique de tournois
}



