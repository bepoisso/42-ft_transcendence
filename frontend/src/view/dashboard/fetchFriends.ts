import { Router } from "../../router";

// ==================================================================================================
// 								Logique d'amis	sur le téco											||
// ===================================================================================================


interface Friend {
  id: number;
  username: string;
  avatarURL?: string;
  online: boolean;
}


function test(query: string) {
	return {
		friends: [
			{
				id: 3,
				username: "Thierry",
				avatarURL: undefined,
				online: true,
			},
			{
				id: 2,
				username: "Stephanie",
				avatarURL: undefined,
				online: true,
			},
			{
				id: 1,
				username: "Fab",
				avatarURL: undefined,
				online: false,
			},
		]
	}
}


function renderFriendsSidebar(router: Router, friends: Friend[])
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
		if (friend.avatarURL)
			avatar.src = friend.avatarURL;
		else
			avatar.src = "../assets/basic_avatar.png";
		avatar.className = "w-8 h-8 rounded-full";
		friendEl.appendChild(avatar);

		// status
		const statusDot = document.createElement("span");
		statusDot.className = `w-3 h-3 rounded-full ${friend.online ? "bg-green-500" : "bg-red-500"}`;
		friendEl.appendChild(statusDot);

		// username
		const username = document.createElement("span");
		username.textContent = friend.username;
		friendEl.appendChild(username);

		friendEl.addEventListener("click", () => {
			router.navigate(`/visitProfile/${friend.id}`);
		});


		sidebar.appendChild(friendEl);
	});
}




export async function fetchFriendsStatus(router: Router)
{
	// try {
	// 	const res = await fetch("api/friends/status");
	// 	if (!res.ok) throw new Error("Erreur serveur");

	// 	const friends = await res.json();
	// 	renderFriendsSidebar(friends);
	// } catch (err) {
	// 	console.error("Impossible de récupérer les amis :", err);
	// }

	renderFriendsSidebar(router, test("str").friends); // a delete juste pour test
}
