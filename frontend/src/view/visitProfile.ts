import { getSocket } from "../sockets/socket";
import { Router } from "../router";

export function renderVisitProfile() {
  document.getElementById("app")!.innerHTML = `
    <div class="min-h-screen w-full overflow-x-hidden text-white flex flex-col">

      <!-- HEADER -->
      <div class="w-full flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <h1 class="text-xl font-bold">User Profile</h1>
      </div>

      <!-- CONTENU -->
      <div class="flex flex-1 w-full p-6 justify-center items-center bg-gray-900">
        <div class="flex flex-col items-center space-y-8">

          <!-- Avatar + Nom -->
          <div class="flex flex-col items-center space-y-3">
            <img id="user-avatar"
                 src="../assets/basic_avatar.png"
                 class="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg">
            <h2 id="user-name" class="text-2xl font-semibold">Loading...</h2>
          </div>

          <!-- Stats cercles -->
          <div class="flex space-x-10">
            <div class="w-28 h-28 rounded-full bg-gray-800 flex flex-col justify-center items-center shadow-md">
              <p id="wins" class="text-2xl font-bold">0</p>
              <p class="text-gray-400 text-sm">Wins</p>
            </div>
            <div class="w-28 h-28 rounded-full bg-gray-800 flex flex-col justify-center items-center shadow-md">
              <p id="played" class="text-2xl font-bold">0</p>
              <p class="text-gray-400 text-sm">Played</p>
            </div>
          </div>

          <!-- Boutons -->
          <div class="flex space-x-6">
            <button id="add-friend"
              class="px-6 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 font-semibold shadow hidden">
              Add Friend
            </button>
            <button id="invite-play"
              class="px-6 py-2 bg-green-600 rounded-xl hover:bg-green-700 font-semibold shadow">
              Invite to Play
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}

// Il faut changer ça, on va visiter non pas avec l'id mais avec le username
async function fetchUserData(id: number): Promise<{
	statusCode: number,
	message?: string,
	id: string,
	username: string,
	is_connected: number,
	avatarURL?: string,
	games_played: string,
	games_won: string,
	}> {
	const response = await fetch("/back/api/get/user/public", {
		method: "POST",
		credentials: 'include',
		headers: {
		"Content-Type": "application/json",
		},
		body: JSON.stringify({id: id}),
	});
	return await response.json();
}


async function setVisitProfile(id: number)
{
	try {
		const data = await fetchUserData(id);

		if (data.statusCode !== 200) {
			console.error("Error with visitProfile : " + data.message);
			throw new Error("Failed to fetch user profile information");
		}

		//donne egalement le userID que je vais stocker pour la requete
		console.log("L'ID du friend est : ", data.id);
		localStorage.setItem("userId", data.id);

		// username
		const userName = document.getElementById("user-name");
		if (userName) {
			userName.textContent = data.username;
		}

		// avatar
		if (data.avatarURL) {
			const userAvatar = document.getElementById("user-avatar") as HTMLImageElement;
			if (userAvatar) userAvatar.src = data.avatarURL;
		}

		// stats
		const userGames = document.getElementById("played");
		if (userGames) {
			userGames.textContent = data.games_played;
		}

		const userWins = document.getElementById("wins");
		if (userWins) {
			userWins.textContent = data.games_won;
		}

	} catch (err) {
		console.error("Error fetching user information: ", err);
	}
}



function invite(socket: WebSocket, friend_id: number) {
	const btn = document.getElementById("invite-play");
	btn?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		console.log("Game invitation sent to : ", friend_id);
		socket.send(JSON.stringify({
			type: "game_send_invite",
			to: friend_id,
		}));
	});


	const btnFriend = document.getElementById("add-friend");
	btnFriend?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		console.log("Friend invitation sent to : ", friend_id);
		socket.send(JSON.stringify({
			type: "friend_send_invite",
			to: friend_id,
		}));
	});
}


export async function visitProfileHandler(router: Router, id: number)
{
	const socket = await getSocket(router);
	setVisitProfile(id);

	const friend_id = localStorage.getItem("userId");
	console.log("L'id reçu correspond a : ", friend_id);
	if (friend_id)
		invite(socket, Number(friend_id));
}
