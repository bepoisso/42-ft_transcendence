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
			<p id="error-save" class="text-red-500 mt-2"></p>
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
			<p id="error-password" class="text-red-500 mt-2"></p>
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
// async function fetchUserData(token: string) {
// 	return {statusCode: 200, message: "all good", name: "Hadri", tournamentName: "Spike", email:"Mon email", avatarURL: null, gamesPlayed: "10", gamesWon: "8"};
// }

async function fetchUserData(token: string) : Promise <{
	statusCode: number,
	message?: string,
	name: string,
	tournamentName: string,
	email: string,
	avatarURL?: string,
	gamesPlayed: string,
	gamesWon: string
// Il faudra ajouter les parties + peut etre les amis
}>
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


export async function setMyProfile()
{
	const token = localStorage.getItem("token");
	if (!token) return;

	try {
			const data = await fetchUserData(token);

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


// ==================================================================================================
// 					Handler des modifications sur le profil											||
// ===================================================================================================

async function saveUserData(token: string, userName: string, userTournament: string, userEmail: string):
Promise <{statusCode: number, message?: string}>
{
	const response = await fetch("/api/myProfile", {
		method: "PUT",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: userName,
			tournamentName: userTournament,
			email: userEmail
		}),
	});
	const data = await response.json();
	return data;
}


function saveHandler(router: Router)
{
	const btn = document.getElementById("save-profile");
	btn?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		const token = localStorage.getItem("token");
		if (!token) return;

		const userNameInput = document.getElementById("user-name") as HTMLInputElement | null;
		const userTournamentInput = document.getElementById("tournament-username") as HTMLInputElement | null;
		const userEmailInput = document.getElementById("myEmail") as HTMLInputElement | null;

		if (!userNameInput || !userTournamentInput || !userEmailInput) {
			const errorMessage = document.getElementById("error-save");
			if (errorMessage)
				errorMessage.textContent = "Need to fill all informations";
			return;
		}

		const userName = userNameInput.value;
		const userTournament = userTournamentInput.value;
		const userEmail = userEmailInput.value;



		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(userEmail)) {
			const errorMessage = document.getElementById("error-save");
			if (errorMessage)
				errorMessage.textContent = "Please enter a valid email address.";
				return;
		}

		const usernameRegex = /^[a-zA-Z0-9]{3,}$/;

		if (!usernameRegex.test(userName) || !usernameRegex.test(userTournament)) {
			const errorMessage = document.getElementById("error-save");
			if (errorMessage)
				errorMessage.textContent = "Username must be at least 3 characters long.";
			return;
		}

		try {
				const data = await saveUserData(token, userName, userTournament, userEmail);

			// Soit on ne parvient pas à récup les infos
			if (data.statusCode !== 200) {
				console.error("Error with myProfile : " + data.message);
				throw new Error("Failed to fetch user profile information");
			}

		} catch (err) {
			console.error("Error saving user information: ", err);
		}


	});
}





async function updatePassword(token: string, oldPass: string, newPass: string, confirmPass: string):
Promise <{statusCode: number, message?: string}>
{
	const response = await fetch("/api/myProfile/password", {
		method: "PUT",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			password: oldPass,
			newPassword: newPass,
			confirmPassword: confirmPass
		}),
	});
	const data = await response.json();
	return data;
}

function passwordHandler(router: Router)
{
	const btn = document.getElementById("change-password");
	btn?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		const token = localStorage.getItem("token");
		if (!token) return;

		const oldPassInput = document.getElementById("current-password") as HTMLInputElement | null;
		const newPassInput = document.getElementById("new-password") as HTMLInputElement | null;
		const confirmPassInput = document.getElementById("confirm-password") as HTMLInputElement | null;

		if (!oldPassInput || !newPassInput || !confirmPassInput) {
			console.error("One or more input elements not found");
			// ecrire un message d'erreur
			return;
		}

		const oldPass = oldPassInput.value;
		const newPass = newPassInput.value;
		const confirmPass = confirmPassInput.value;

		if (newPass === oldPass) {
			const errorMessage = document.getElementById("error-password");
			if (errorMessage)
				errorMessage.textContent = "Password didn't change !";
			return;
		}

		if (newPass !== confirmPass) {
			const errorMessage = document.getElementById("error-password");
			if (errorMessage)
				errorMessage.textContent = "new passwords must be identical !";
			return;
		}

		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

		if (!passwordRegex.test(newPass)) {
			const errorMessage = document.getElementById("error-password");
			if (errorMessage)
				errorMessage.textContent = "Password must be at least 8 characters long and contain at least one number and one special character.";
				return;
		}


		try {
				const data = await updatePassword(token, oldPass, newPass, confirmPass);

			// Soit on ne parvient pas à récup les infos
			if (data.statusCode !== 200) {
				console.error("Error with myProfile : " + data.message);
				throw new Error("Failed to fetch user profile information");
			}

		} catch (err) {
			console.error("Error saving user information: ", err);
		}

	});
}

export function myProfileHandler(router: Router)
{
	saveHandler(router);
	passwordHandler(router);
}
