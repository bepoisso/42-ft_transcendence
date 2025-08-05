import { Router } from "../router";
import { App } from "../app"


export function renderLogin() {
  document.getElementById("app")!.innerHTML = `

<body class="m-0 p-0 h-screen overflow-hidden relative flex items-center justify-center">
  <!-- Vidéo en arrière-plan -->
  <video autoplay muted loop playsinline class="absolute top-0 left-0 w-full h-full object-cover z-[-1]">
    <source src="../assets/background.mp4" type="video/mp4" />
  </video>

  <!-- Section centrée -->
<div class="z-10 flex flex-col items-center space-y-10">
  <div class="border-2 border-dashed border-gray-400 rounded-lg p-4 w-full max-w-md mx-auto mt-4">
    <h2 class="mb-8 text-xl font-bold text-white">Login</h2>



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

  </div>
</div>

  `;
}

// Fonction pour savoir si on a une 2FA
async function tryLogin(email: string, password: string): Promise < {is2FA: boolean; userID?: string; error?: string}> {
	try {
		const response = await fetch("/api/users/tryLogin", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		body: JSON.stringify({email, password}),
		});
		if (!response.ok) {
			throw new Error("Login failed");
		}
		const result = await response.json();
		return result;

	} catch (err) {
		console.error("Error on tryLogin function: ", err);
		return {
			is2FA: false,
			error: "Erreur réseau ou serveur",
		};
	}
}

export function LoginSubmit(router: Router)
{
	const form = document.getElementById("login-form") as HTMLFormElement;
	form.addEventListener("submit", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		const email = (document.getElementById("email") as HTMLInputElement).value;
		const password = (document.getElementById("password") as HTMLInputElement).value;

		try {
			const result = await tryLogin(email, password);

			if (result.error) {
				alert(result.error);
				return ;
			}

			if (result.is2FA) {
				if (result.userID)
					sessionStorage.setItem("userIdFor2FA", result.userID);
				history.pushState(null, "", "/2fa");
				router.checkRoute();
			} else {
				history.pushState(null, "", "/dashboard");
				router.checkRoute();
			}

		} catch (err) {
			console.error("Error on login page : ", err);
		}
	});
}
