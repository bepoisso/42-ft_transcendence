export function renderMyProfile() {
  document.getElementById("app")!.innerHTML = `
    <div class="min-h-screen w-full overflow-x-hidden text-white flex flex-col">

      <!-- HEADER -->
      <div class="w-full flex justify-between items-center px-4 py-3 border-b border-gray-700">
        <h1 class="text-xl font-bold">My Profile</h1>
      </div>

      <!-- CONTENU -->
      <div class="flex flex-1 w-full p-6 bg-gray-900">

        <!-- Colonne gauche : Avatar -->
        <div class="w-1/4 flex flex-col items-center space-y-4 border-r border-gray-700 pr-6">
          <img id="user-avatar" src="../assets/basic_avatar.png" alt="Avatar"
               class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg">
          <button class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm">
            Change avatar
          </button>
        </div>

        <!-- Colonne droite : Infos utilisateur -->
        <div class="w-3/4 pl-6 space-y-8">

          <!-- Username + Tournament Username -->
          <div class="flex gap-6">
            <div class="flex-1">
              <label class="block text-gray-400 mb-1 text-left">Username</label>
              <input id="user-name" type="text" value="Loading..."
                class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none">
            </div>
            <div class="flex-1">
              <label class="block text-gray-400 mb-1 text-left">Tournament Username</label>
              <input id="tournament-username" type="text" value="Loading..."
                class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none">
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-gray-400 mb-1 text-left">Email</label>
            <input id="myEmail" type="email" value="Loading..."
              class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none">
          </div>

          <!-- Stats -->
          <div class="flex gap-6">
            <div class="flex-1 bg-gray-800 p-4 rounded-lg text-center">
              <p class="text-2xl font-bold" id="games-played">0</p>
              <p class="text-gray-400">Games played</p>
            </div>
            <div class="flex-1 bg-gray-800 p-4 rounded-lg text-center">
              <p class="text-2xl font-bold" id="games-won">0</p>
              <p class="text-gray-400">Wins</p>
            </div>
          </div>

          <!-- Bouton sauvegarde profil -->
          <div class="flex justify-end">
            <button id="save-profile"
              class="px-6 py-2 bg-green-600 rounded hover:bg-green-700 font-semibold">
              Save
            </button>
          </div>

          <!-- Changer mot de passe -->
          <div class="  rounded-lg space-y-4">
            <h2 class="text-lg font-bold border-b border-gray-700 pb-2 text-left">Changer le mot de passe</h2>

            <div>
              <label class="block text-gray-400 mb-1 text-left">Mot de passe actuel</label>
              <input id="current-password" type="password" value="password"
                class="w-full px-3 py-2 rounded bg-gray-900 border border-gray-600 text-white focus:outline-none">
            </div>

            <!-- Nouveau + Confirmation côte à côte -->
            <div class="flex gap-6">
              <div class="flex-1">
                <label class="block text-gray-400 mb-1 text-left">Nouveau mot de passe</label>
                <input id="new-password" type="password"
                  class="w-full px-3 py-2 rounded bg-gray-900 border border-gray-600 text-white focus:outline-none">
              </div>
              <div class="flex-1">
                <label class="block text-gray-400 mb-1 text-left">Confirmer le nouveau mot de passe</label>
                <input id="confirm-password" type="password"
                  class="w-full px-3 py-2 rounded bg-gray-900 border border-gray-600 text-white focus:outline-none">
              </div>
            </div>

            <div class="flex justify-end">
              <button id="change-password"
                class="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 font-semibold">
                Update password
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}



// ==================================================================================================
// 					Appelle du back pour dynamiquement modifier les éléments						||
// ===================================================================================================

// test sans back
async function fetchUserData(token: string) {
	return {statusCode: 200, message: "all good", name: "Hadri", tournamentName: "Spike", email:"Mon email", avatarURL: null, gamesPlayed: "10", gamesWon: "8"};
}
// async function fetchUserData(token: string) : Promise <{
// 	statusCode: number,
// 	message?: string,
// 	name: string,
// 	tournamentName: string,
// 	email: string,
// 	avatarURL?: string,
// 	gamesPlayed: string,
// 	gamesWon: string
// }>
// {
// 	const response = await fetch("/api/myProfile", {
// 		method: "POST",
// 		headers: {
// 			"Authorization": `Bearer ${token}`,
// 			"Content-Type": "application/json",
// 		},
// 	});
// 	const data = await response.json();
// 	return data;
// }


export async function setMyProfile()
{
	// const token = localStorage.getItem("token");
	// if (!token) return;

	try {
			const data = await fetchUserData("token");

			// Soit on ne parvient pas à récup les infos
			if (data.statusCode !== 200) {
				console.error("Error with myProfile : " + data.message);
				throw new Error("Failed to fetch user profile information");
			}

			// Fetch all infos

			// fetch username
			const user = document.getElementById("user-name");
			if (user) {
				(user as HTMLInputElement).value = data.name;

			}
			// fetch TournamentName
			const userTournament = document.getElementById("tournament-username");
			if (userTournament) {
				(userTournament as HTMLInputElement).value = data.tournamentName;

			}
			// fetch email
			const userEmail = document.getElementById("myEmail");
			if (userEmail) {
				(userEmail as HTMLInputElement).value = data.email;
			}
			// fetch games played
			const userGames = document.getElementById("games-played");
			if (userGames) {
				userGames.textContent = data.gamesPlayed;
			}

			// fetch games played
			const userWon = document.getElementById("games-won");
			if (userWon) {
				userWon.textContent = data.gamesWon;
			}

			//fetch avatar
			if (data.avatarURL) {
				const userAvatar = document.getElementById("user-avatar") as HTMLImageElement;
				if (userAvatar) userAvatar.src = data.avatarURL;
			}


	} catch (err) {
		console.error("Error fetching user information: ", err);
	}
}



