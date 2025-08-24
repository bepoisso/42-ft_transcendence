import { Router } from "../../router";
import { renderFriendsSidebar, searchBar } from "./fetchFriends";
import { getSocket } from "../../sockets/socket";
import type { Friend } from "./fetchFriends";

// export function renderDashboard() {
//   document.getElementById("app")!.innerHTML = `
//     <div class="min-h-screen w-full overflow-x-hidden text-white flex flex-col">

//       <!-- HEADER (full-width) -->
//       <div class="w-full flex justify-between items-center px-4 py-3 border-b border-gray-700">
//         <!-- Recherche -->
//         <div class="relative w-full max-w-xl">
// 		  <input
// 			type="text"
// 			id="search"
// 			placeholder="Search friends..."
// 			class="px-3 py-2 w-full rounded bg-gray-800 border border-gray-600 text-white focus:outline-none"
// 		  />
// 			<p id="error-message" class="text-red-500 text-sm"></p>
// 		</div>


//         <!-- Avatar + Nom -->
//         <div class="flex items-center gap-3 ml-4">
//           <img id="user-avatar" src="../assets/basic_avatar.png" alt="Avatar"
//                class="w-10 h-10 rounded-full object-cover border-2 border-white">
//           <button id="user-name" class="font-bold text-lg  bg-blue-600 rounded hover:bg-blue-700">Loading...</button>
//         </div>
//       </div>

//       <!-- CONTENU PRINCIPAL (2 colonnes) -->
//       <div class="flex flex-1 w-full">

//         <!-- Colonne gauche : 80% largeur -->
//          <div class="w-4/5 p-6 space-y-6 border-r border-gray-700 flex flex-col">

//           <!-- Carte Entraînement -->
//           <div class="bg-indigo-950 p-4 rounded-lg space-y-4">
//             <h3 class="text-lg font-bold mb-2 text-left">Training</h3>
//             <div class="flex justify-between space-x-4">
//               <button id="btnLocal" class="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Local</button>
//               <button id="btnAI" class="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">AI</button>
//             </div>
//           </div>

//           <!-- Carte Ranked -->
//           <div class="bg-gray-800 p-4 rounded-lg space-y-4">
//             <h3 class="text-lg font-bold mb-2 text-left">Ranked</h3>
//             <div class="flex justify-between space-x-4">
//               <button id="btnOnline" class="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Online</button>
//               <button id="btnTournament" class="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">ç</button>
//             </div>
//           </div>

// 		  <!-- Partie Rooms / Parties en cours -->
//           <button id="history" type="button"
// 				class= "px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm w-full">
// 				My History
// 			</button>
//         </div>

//         <!-- Colonne droite : 20% largeur -->
//         <div class="w-1/5 p-6 overflow-y-auto min-w-0">
//           <h2 class="text-xl font-bold mb-4"> Friends </h2>
//           <div id="friends-list" class="space-y-3">
//             <p class="text-gray-400">No friends yet...</p>
//           </div>
//         </div>

//       </div>
//     </div>
//   `;
// }


export function renderDashboard() {
document.getElementById("app")!.innerHTML = `
	<style>
		#app .game-btn {
			border:5px dotted #ffffff;
			background:transparent;
			color:#ffffff;
			font-weight:700;
			box-shadow:none;
			outline:none;
			appearance:none;
			padding:0.75rem 1.75rem;
			cursor:pointer;
			transition: .2s,color .2s;
			border-radius:1.25rem; /* arrondi plus doux */
		}

		#app .game-btn:focus {
			outline:2px solid #ffffff;
			outline-offset:2px;
		}

		#btnLocal:hover {
			background: #3F84E5;
			border:5px dotted #3F84E5;
		}

		#btnOnline:hover {
			background: #B20D30;
			border:5px dotted #B20D30;
		}

		#btnAI:hover {
			background: radial-gradient(circle, #ff0000, #ff7700, #ffff00, #00ff00, #0077ff, #8000ff);
			background-size: 400% 400%;
			animation: rainbow 3s ease infinite;
			border:5px dotted transparent;
		}

		#btnAI:hover::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: radial-gradient(circle, #ff0000, #ff7700, #ffff00, #00ff00, #0077ff, #8000ff);
			background-size: 400% 400%;
			animation: rainbow 3s ease infinite;
			filter: blur(2px);
			border-radius: inherit;
			z-index: -1;
		}

		#btnAI {
			position: relative;
		}

		#btnTournament:hover {
			background: #C17817;
			border:5px dotted #C17817;
		}
	</style>
	<div class="min-h-screen w-full flex flex-col items-center justify-center text-white rainbow-bg">
		<h1 class="text-6xl font-bold mb-8 text-center">Pong</h1>

		<div class="flex flex-wrap justify-center gap-4 text-xl">
			<button id="btnLocal" class="game-btn">Local</button>
			<button id="btnOnline" class="game-btn">Online</button>
			<button id="btnAI" class="game-btn">AI</button>
			<button id="btnTournament" class="game-btn">Tournament</button>
		</div>
	</div>
`;
}

// ==================================================================================================
// 					Appelle du back pour dynamiquement modifier les éléments						||
// ===================================================================================================

async function fetchUserData() : Promise<{
  statusCode: number;
  message: string;
  id?: number;
  username?: string;
  avatar_url?: string;
  games_played?: number;
  games_won?: number;
  room_id?: number;
  friends?: Friend[]; // tableau d'amis
}> {
	const response = await fetch("/back/api/get/user/private", {
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


async function setDashboard(router: Router): Promise<{username: string, id: number, roomId: number} | undefined>
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
			if (data.avatar_url) {
				const userAvatar = document.getElementById("user-avatar") as HTMLImageElement;
				if (userAvatar) userAvatar.src = data.avatar_url;
			}

			renderFriendsSidebar(router, data.friends!);

			return {username: data.username!, id: data.id!, roomId: data.room_id || 0};
	} catch (err) {
		console.error("Error fetching user data:", err);
		router.navigate("/login");
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



export function matchmaking(socket: WebSocket, id: any)
{
	const btnMyProfile = document.getElementById("btnOnline");
	btnMyProfile?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		socket.send(JSON.stringify({
			type: "matchmaking",
			from: id,
			mode: "online",
		}))

	});
}

// ==================================================================================================
// 									HISTORY + TOURNAMENT											||
// ===================================================================================================

export function goToHistoric(router: Router)
{
	const btn = document.getElementById("history");
	btn?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		router.navigate(`/myHistory`);
	});
}


export function goToTournament(router: Router)
{
	const btn = document.getElementById("btnTournament");
	btn?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		router.navigate("/tournament");
	});
}






// ==================================================================================================
// 									FONCTION PRINCIPALE												||
// ===================================================================================================

export async function dashboardHandler(router: Router)
{
	const socket = await getSocket(router);


	const userData = await setDashboard(router);
	if (!userData) return;

	const { username, id, roomId } = userData;

	// if player is still active in a room, send message to this room to kill the room
	if (roomId !== 0 || undefined) {
		socket.send(JSON.stringify({
			type: "player_left",
			from: id
		}))
	}
	setInterval(async () => {
		const data = await setDashboard(router);
		if (!data) return;
	}, 5000); // 5sec maybe mettre moins ?

	// go to my profile
	myProfileClick(router);

	// allow people to play directly in AI / Local mode
	modeClick(socket, "btnLocal", "local", id);
	modeClick(socket, "btnAI", "AI", id);
	matchmaking(socket, id);

	searchBar(router);

	goToTournament(router);
	goToHistoric(router);
}

