import { Router } from "../../router";
// ==================================================================================================
// 								Gestion de la barre de recherche									||
// ===================================================================================================

interface user {
	id: number;
	name: string;
	avatarURL?: string;
};

// async function fetchUserSuggestions(query: string) {
// 	return {
// 		statusCode: 200,
// 		message: "all good",
// 		users: [
// 			{
// 				id: 3,
// 				name: "Thierry",
// 				avatarURL: undefined,
// 			},
// 			{
// 				id: 3,
// 				name: "Stephanie",
// 				avatarURL: undefined,
// 			},
// 			{
// 				id: 3,
// 				name: "Fab",
// 				avatarURL: undefined,
// 			},
// 		]
// 	}
// }

async function fetchUserSuggestions(query: string) : Promise <{
	statusCode: number,
	message?: string,
	users: user[],
}> {
	const response = await fetch(`/api/users?search=${encodeURIComponent(query)}`, {
		method: "GET",
		headers: {
		"Content-Type": "application/json",
		},
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


async function visitProfile(id: number) : Promise <{
	statusCode: number,
	message?: string,
}> {
	const response = await fetch(`/api/visitProfile?search=${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
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


function renderSearch(router: Router, users: user[]) {

	const results = document.getElementById("search-results")!;
	results.innerHTML = ""; //clear

	// si la taille est a 0
	 if (users.length === 0) {
		results.classList.add("hidden");
		return;
	}

	users.forEach(user => {
		const insertHTML = document.createElement("div");


		insertHTML.className = "flex items-center gap-3 px-4 py-2 hover:bg-gray-700 cursor-pointer";

		insertHTML.innerHTML = `
			<img src="${user.avatarURL ?? "../assets/basic_avatar.png"}"
				class="w-8 h-8 rounded-full object-cover">
			<span>${user.name}</span>
		`;

		insertHTML.addEventListener("click", () => {
			router.navigate(`/visitProfile/${user.id}`);
		});


		// On ajoute le bloc à la liste des résultats
		results.appendChild(insertHTML);
	});
	results.classList.remove("hidden");
}

export function searchBar(router: Router)
{
	const searchInput = document.getElementById("search");

	searchInput?.addEventListener('input', async (e) => {
	const query = (e.target as HTMLInputElement).value.trim();

		try {
			const users = await fetchUserSuggestions(query);
			if (users.statusCode !== 200) return ; // Cela veut dire qu'on a rien trouvé
			renderSearch(router, users.users);
		} catch (err) {
			console.error("Error searching people : ", err);
			return;
		}
	});
}
