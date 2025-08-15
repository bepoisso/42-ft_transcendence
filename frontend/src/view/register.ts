import { Router } from "../router";

export function renderRegister() {
  document.getElementById("app")!.innerHTML = `

<body class="m-0 p-0 h-screen overflow-hidden relative flex items-center justify-center">

  <!-- Section centrée -->
<div class="z-10 flex flex-col items-center space-y-10">
  <div class="border-2 border-dashed border-gray-400 rounded-lg p-4 w-full max-w-md mx-auto mt-4">
    <h2 class="mb-8 text-xl font-bold text-white">New Player</h2>

    <form id="new-player-form" class="flex flex-col">
      <div class="flex flex-col mb-6">
        <label class="mb-1 font-semibold text-white" for="pseudo">Pseudo:</label>
        <input id="pseudo" class="px-2 py-1 rounded bg-gray-800 text-white" type="text" placeholder="Spike" />
      </div>

      <div class="flex flex-col mb-6">
        <label class="mb-1 font-semibold text-white" for="email">Email:</label>
        <input id="email" class="px-2 py-1 rounded bg-gray-800 text-white" type="email" placeholder="exemple@exemple.com" />
      </div>

      <div class="flex flex-col mb-6">
        <label class="mb-1 font-semibold text-white" for="password">Password:</label>
        <input id="password" class="px-2 py-1 rounded bg-gray-800 text-white" type="password" placeholder="pass123" />
      </div>

      <p id="error-message" class="text-red-500 mt-2"></p>

      <button type="submit" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Register
      </button>
    </form>

    <script type="module" src="../dist/main.js"></script>

  </div>
</div>

`;
}





// Fonction pour appeler user-service pour sauvegarder le user en tant que non vérifié
async function preRegister(username: string, email: string, password: string): Promise<{statusCode: number, message: string, token: string}> {
	const response = await fetch("/api/register", {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		},
		body: JSON.stringify({username, email, password}),
	});

	const data = await response.json();

	return data;
}


export function registerSubmit(router: Router)
{
	const form = document.getElementById("new-player-form") as HTMLFormElement;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const username = (document.getElementById("pseudo") as HTMLInputElement).value;
		const email = (document.getElementById("email") as HTMLInputElement).value;
		const password = (document.getElementById("password") as HTMLInputElement).value;

		// On vérifie que les champs sont bien remplis
		if ( !email.trim() || !password.trim() || !username.trim()) {
		const errorMessage = document.getElementById("error-message");
		if (errorMessage)
			errorMessage.textContent = "All fields are required !";
		return;
		}

		// Vérifier que le mot de passe est valide
		// Vérifie que le mail est valide
		// Vérifie que le username a au moins 3 char
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

		if (!passwordRegex.test(password)) {
			const errorMessage = document.getElementById("error-message");
			if (errorMessage)
				errorMessage.textContent = "Password must be at least 8 characters long and contain at least one number and one special character.";
				return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(email)) {
			const errorMessage = document.getElementById("error-message");
			if (errorMessage)
				errorMessage.textContent = "Please enter a valid email address.";
				return;
		}

		const usernameRegex = /^[a-zA-Z0-9]{3,}$/;

		if (!usernameRegex.test(username)) {
			const errorMessage = document.getElementById("error-message");
			if (errorMessage)
				errorMessage.textContent = "Username must be at least 3 characters long.";
			return;
		}


		// Envoyer le pré-register au back
		try {
			const data = await preRegister(username, email, password);
			if (data.statusCode === 200) {
				console.log("successfully pre-register")
				localStorage.setItem("token", data.token);
				// rediriger vers 2FA
				router.navigate("/2fa");
			}
			else {
				console.error("Erreur lors du préRegister : " + data.message);
				const errorMessage = document.getElementById("error-message");
				if (errorMessage)
					errorMessage.textContent = data.message;
				return;
			}
		} catch (error) {
			console.error("Erreur lors du préRegister : ", error);
			const errorMessage = document.getElementById("error-message");
				if (errorMessage)
					errorMessage.textContent = "Error preRegister";
			return;
		}

	});
}

