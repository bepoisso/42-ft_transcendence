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
        <label class="mb-1 font-semibold text-white" for="name">Name:</label>
        <input id="name" class="px-2 py-1 rounded bg-gray-800 text-white" type="text" placeholder="Name" />
      </div>

      <div class="flex flex-col mb-6">
        <label class="mb-1 font-semibold text-white" for="firstName">First name:</label>
        <input id="firstName" class="px-2 py-1 rounded bg-gray-800 text-white" type="text" placeholder="First name" />
      </div>

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


//Fonction pour appeler user-service pour check si email ou pseudo n'existent pas déjà
async function checkUserExist(email: string, pseudo: string,): Promise<{ emailExists: boolean; pseudoExists: boolean }> {
	const response = await fetch("/api/users/check", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email: email, pseudo: pseudo }),
	});
	if (!response.ok) {
		throw new Error("Erreur lors de la vérification du pseudo/email");
	}

	const data = await response.json();

	return {
		emailExists: data.emailExists,
		pseudoExists: data.pseudoExists,
	};
}



// Fonction pour appeler user-service pour sauvegarder le user en tant que non vérifié
async function saveUnverifiedUser(name: string, firstName: string, pseudo: string, email: string, password: string): Promise<boolean> {
  const response = await fetch("/api/users/saveUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({name, firstName, pseudo, email, password}),
  });
  const data = await response.json();
  if (data.success) {
    return true;
  }
  else {
    console.error("Erreur database :", data.error);
    return false;
  }
}



export function registerSubmit(router: Router)
{
	const form = document.getElementById("new-player-form") as HTMLFormElement;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const name = (document.getElementById("name") as HTMLInputElement).value;
		const firstName = (document.getElementById("firstName") as HTMLInputElement).value;
		const pseudo = (document.getElementById("pseudo") as HTMLInputElement).value;
		const email = (document.getElementById("email") as HTMLInputElement).value;
		const password = (document.getElementById("password") as HTMLInputElement).value;

		// On vérifie que les champs sont bien remplis
		if ( !name.trim() || !firstName.trim() || !email.trim() || !password.trim() || !pseudo.trim()) {
		const errorMessage = document.getElementById("error-message");
		if (errorMessage)
			errorMessage.textContent = "All fields are required !";
		return;
		}

		// On fait un appel API pour vérifier que les pseudos et email sont nouveaux
		try {
			const { emailExists, pseudoExists } = await checkUserExist(email, pseudo);
			const errorMessage = document.getElementById("error-message");
			if (!errorMessage) return;
			if (emailExists) {
				errorMessage.textContent = "Email already used !";
				return;
			} else if (pseudoExists) {
			errorMessage.textContent = "Pseudo already used !";
			return;
			}
		} catch (error) {
			console.error("Erreur lors de la vérification :", error);
			return ;
		}


		// Si on arrive ici c'est que les pseudo + emails sont nouveaux
		// On va envoyer un mail de confirmation. Si le mail est bon on sauvegarde dans la base de donnée


		// 2 - Sauvegarder comme non verifier le user dans la DB
		try {
			const success = await saveUnverifiedUser(name, firstName, pseudo, email, password);
			if (!success) {
				console.error("Erreur user database");
				return;
			}
		} catch (error) {
			console.error("Erreur lors du save-user : ", error);
			return;
		}

	});
}
