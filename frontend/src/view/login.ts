import { Router } from "../router";

export function renderLogin() {
  document.getElementById("app")!.innerHTML = `
  <div class="z-10 flex flex-col items-center space-y-10">
    <div class="border-2 border-dashed border-gray-400 rounded-lg p-4 w-full max-w-md mx-auto mt-4">
      <h2 class="mb-8 text-xl font-bold text-white">Login</h2>

      <form id="login-form">
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
          Login
        </button>
      </form>
    </div>
  </div>
  `;
}



// Fonction pour savoir si on a une 2FA
async function Login(email: string, password: string): Promise < {statusCode: number, message?: string, token: string}>
{
	const response = await fetch("/api/users/tryLogin", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({email, password}),
	});
	const data = response.json();
	return data;
}

export function LoginSubmit(router: Router)
{
	const form = document.getElementById("login-form") as HTMLFormElement;
	form.addEventListener("submit", async (e) => {
		e.preventDefault(); // Empêche le rechargement

		const email = (document.getElementById("email") as HTMLInputElement).value;
		const password = (document.getElementById("password") as HTMLInputElement).value;

		if ( !email.trim() || !password.trim()) {
			const errorMessage = document.getElementById("error-message");
		if (errorMessage) {
			errorMessage.textContent = "All fields are required !";
		}
		return;
		}


		try {
			const data = await Login(email, password);
			if (data.statusCode === 200) {
				console.log("successfully logged in")
				localStorage.setItem("token", data.token);
				// rediriger vers 2FA
				router.navigate("/2fa");
			}

		} catch (err) {
			console.error("Error on login page : ", err);
		}
	});
}
