import { Router } from "../router";

export function renderRegister() {
  document.getElementById("app")!.innerHTML = `
<div class="h-screen w-screen flex items-center justify-center ">
  <div class="border-2 border-dashed rounded-lg p-6 w-full max-w-md ">
    <h2 class="mb-6 text-2xl font-bold text-white text-center">New Player</h2>

    <form id="new-player-form" class="flex flex-col space-y-4">
      <div>
        <label class="mb-1 block font-semibold text-white" for="pseudo">Pseudo:</label>
        <input id="pseudo" class="px-3 py-2 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring focus:ring-blue-500" type="text" placeholder="Spike" />
      </div>

      <div>
        <label class="mb-1 block font-semibold text-white" for="email">Email:</label>
        <input id="email" class="px-3 py-2 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring focus:ring-blue-500" type="email" placeholder="exemple@exemple.com" />
      </div>

      <div>
        <label class="mb-1 block font-semibold text-white" for="password">Password:</label>
        <input id="password" class="px-3 py-2 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring focus:ring-blue-500" type="password" placeholder="pass123" />
      </div>

      <p id="error-message" class="text-red-500 text-sm"></p>

      <button type="submit" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full">
        Register
      </button>
    </form>

    <div class="flex items-center my-6">
      <div class="flex-grow h-px bg-gray-500"></div>
      <span class="px-3 text-gray-400 text-sm">OR</span>
      <div class="flex-grow h-px bg-gray-500"></div>
    </div>

    <button id="google" class="gsi-material-button w-full flex justify-center items-center space-x-2 py-2 rounded border border-gray-500 hover:bg-gray-700 transition">
      <div class="gsi-material-button-icon">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-5 h-5">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
      </div>
      <span class="text-white font-medium">Sign in with Google</span>
    </button>
  </div>
</div>
`;
}






// Fonction pour appeler user-service pour sauvegarder le user en tant que non vérifié
async function preRegister(username: string, email: string, password: string): Promise<{statusCode: number, message: string}> {
	const response = await fetch("/back/register", {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		},
		body: JSON.stringify({username, email, password}),
	});

	if (!response.ok) {
		console.error(`HTTP error! status: ${response.status}`);
		const text = await response.text();
		console.error('Response:', text);
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = response.json();

	return data;
}


function formHandler(router: Router)
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
			console.log(username+" "+email+" "+password)
			const data = await preRegister(username, email, password);
			if (data.statusCode === 200) {
				console.log("here ?");
				localStorage.setItem("username", username);
				router.navigate("/2fa");
			}
			else {
				console.error("Error with your registration : " + data.message);
				const errorMessage = document.getElementById("error-message");
				if (errorMessage)
					errorMessage.textContent = data.message;
				return;
			}
		} catch (error) {
			console.error("Error with your registration : ", error);
			const errorMessage = document.getElementById("error-message");
				if (errorMessage)
					errorMessage.textContent = String(error);
			return;
		}

	});
}



function googleHandler() {
	const btnGoogle = document.getElementById("google");
	btnGoogle?.addEventListener("click", async (e) => {
		e.preventDefault();

		try {
			window.location.href = "/auth/google";
			// demander a recupérer les infos
		} catch (err) {
		console.error("Erreur lors de la connexion Google :", err);
		}
	});
}

export function registerHandler(router: Router) {
  formHandler(router); // ton handler du submit
  googleHandler(); // ton handler du bouton Google
}
