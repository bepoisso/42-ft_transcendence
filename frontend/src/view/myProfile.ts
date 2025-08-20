import type { Router } from "../router";

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
    	<form id="avatar-form" class="w-1/4 flex flex-col items-center space-y-4 border-r border-gray-700 pr-6">
			<img id="user-avatar" src="../assets/basic_avatar.png" alt="Avatar" class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg">
		  <div class="flex space-x-4">
			<input type="file" id="avatar-file" accept="image/*" class="hidden" />
			<label for="avatar-file" class="cursor-pointer px-4 py-2  bg-blue-600 rounded hover:bg-blue-700 "> Change avatar </label>
			<button type="button" id="change-avatar" class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm"> save </button>
		  </div>
		</form>


        <!-- Colonne droite : Infos utilisateur -->
        <div class="w-3/4 pl-6 space-y-8">

          <!-- Username + Tournament Username -->
          <div class="flex gap-6">
            <div class="flex-1">
              <label class="block text-gray-400 mb-1 text-left">Username</label>
              <input id="user-name" type="text" value="Loading..."
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

async function fetchUserData() : Promise <{
	statusCode: number,
	message?: string,
	id: number,
	username: string,
	avatar_url: string,
	email: string,
	games_played: number,
	games_won: number,
	room_id: number,
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



export async function setMyProfile(router: Router)
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

			// Fetch all infos

			// fetch username
			const user = document.getElementById("user-name");
			if (user) {
				(user as HTMLInputElement).value = data.username;
			}

			// fetch email
			const userEmail = document.getElementById("myEmail");
			if (userEmail) {
				(userEmail as HTMLInputElement).value = data.email;
			}

			// fetch games played
			const userGames = document.getElementById("games-played");
			if (userGames) {
				userGames.textContent = data.games_played.toString();
			}

			// fetch games played
			const userWon = document.getElementById("games-won");
			if (userWon) {
				userWon.textContent = data.games_won.toString();
			}

			//fetch avatar
			if (data.avatarURL) {
				const userAvatar = document.getElementById("user-avatar") as HTMLImageElement;
				if (userAvatar) userAvatar.src = data.avatarURL;
			}
			//return data.id; // get l'id est il la seule solution ?
	} catch (err) {
		console.error("Error fetching user information: ", err);
	}
}


// ==================================================================================================
// 					Handler des modifications sur le profil											||
// ===================================================================================================

async function saveUserData(userName: string):
Promise <{statusCode: number, message?: string}>
{
	const response = await fetch("/api/myProfile", {
		method: "PUT",
		credentials: 'include',
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: userName,
		}),
	});
	const data = await response.json();
	return data;
}


function updateProfile()
{
	const btn = document.getElementById("save-profile");
	btn?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		const userNameInput = document.getElementById("user-name") as HTMLInputElement | null;


		if (!userNameInput) {
			const errorMessage = document.getElementById("error-save");
			if (errorMessage)
				errorMessage.textContent = "Need to fill all informations";
			return;
		}

		const userName = userNameInput.value;


		const usernameRegex = /^[a-zA-Z0-9]{3,}$/;

		if (!usernameRegex.test(userName)) {
			const errorMessage = document.getElementById("error-save");
			if (errorMessage)
				errorMessage.textContent = "Username must be at least 3 characters long and not contain special chars";
			return;
		}

		try {
				const data = await saveUserData(userName);

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





async function updatePassword(oldPass: string, newPass: string, confirmPass: string):
Promise <{statusCode: number, message?: string}>
{
	const response = await fetch("/api/myProfile/password", {
		method: "PUT",
		credentials: 'include',
		headers: {
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

function passwordHandler()
{
	const btn = document.getElementById("change-password");
	btn?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement

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
				const data = await updatePassword(oldPass, newPass, confirmPass);

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


async function uploadAvatar() {
	const btn = document.getElementById("change-avatar");
	const fileInput = document.getElementById("avatar-file") as HTMLInputElement;

	btn?.addEventListener("click", async (e) => {
		e.preventDefault();

		if (!fileInput.files || fileInput.files.length === 0) {
			alert("Please select a file first!");
			return;
		}

		const formData = new FormData();
		formData.append("avatar", fileInput.files[0]);

		try {
			const response = await fetch("/api/upload/avatar", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const data = await response.json();
			console.log("Uploaded avatar URL:", data.url);

			const avatarImg = document.getElementById("user-avatar") as HTMLImageElement;
			if (avatarImg) avatarImg.src = data.url;

		} catch (err) {
		console.error("Error uploading avatar:", err);
		}
	});
}


export function myProfileHandler(router: Router)
{
	setMyProfile(router);
	uploadAvatar();
	updateProfile();
	passwordHandler();
}
