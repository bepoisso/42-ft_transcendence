import { Router } from "../../router";

// ==================================================================================================
// 								Logique d'amis	sur le téco											||
// ===================================================================================================

export type Friend = {
  id: number;
  friend_id: number;
  username: string;
  avatar_url: string;
  is_connected : number
};

export function renderFriendsSidebar(router: Router, friends: Friend[])
{
	const sidebar = document.getElementById("friends-list");
	if (!sidebar) return;

	sidebar.innerHTML = "";
	if (friends.length === 0) {
		sidebar.innerHTML = `<p class="text-gray-400">No friends yet...</p>`;
		return;
	}

	// Logique friends
	friends.forEach(friend => {
		const friendEl = document.createElement("div");
		friendEl.className = "flex items-center space-x-2 p-2 hover:bg-blue-700 rounded cursor-pointer";


		// avatar
		const avatar = document.createElement("img");
		if (friend.avatar_url)
			avatar.src = friend.avatar_url;
		else
			avatar.src = "../assets/basic_avatar.png";
		avatar.className = "w-8 h-8 rounded-full";
		friendEl.appendChild(avatar);

		// status
		const statusDot = document.createElement("span");
		console.log("friend status : ", friend.is_connected )
		if (friend.is_connected === 1)
			statusDot.className = "w-3 h-3 rounded-full bg-green-500";
		else
			statusDot.className = "w-3 h-3 rounded-full bg-red-500";
		friendEl.appendChild(statusDot);

		// username
		const username = document.createElement("span");
		username.textContent = friend.username;
		friendEl.appendChild(username);

		// friend_id
		friendEl.addEventListener("click", () => {
			console.log(`le username = ${friend.username}`);
			router.navigate(`/visitProfile/${friend.username}`);
		});

		sidebar.appendChild(friendEl);
	});
}



async function checkProfile(username: string) : Promise<{
  statusCode: number;
  message: string;
  id?: number;
  username?: string;
  avatar_url?: string;
  games_played?: number;
  games_won?: number;
}> {
	const response = await fetch("/back/api/get/user/public", {
		method: "POST",
		credentials: 'include',
		headers: {
		"Content-Type": "application/json",
		},
		body: JSON.stringify({username: username}),
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

export function searchBar(router: Router)
{
	const searchInput = document.getElementById("search");

	searchInput?.addEventListener('keydown', async (e) => {
	if (e.key === "Enter") {
		const query = (searchInput as HTMLInputElement).value;
		try {
			const data = await checkProfile(query);
			console.log("LA QUERY EST ", data);
			if (data.statusCode === 404) {
				console.log("ON ENTRE ICI ?");
				const errorMessage = document.getElementById("error-message");
				if (errorMessage)
					errorMessage.textContent = "There is no users with this name";
				return ;
			}
			router.navigate(`/visitProfile/${data.username}`);
		} catch (err){
			console.log("Error trying to check for user ", err);
			return;
		}
	};
	});
}
