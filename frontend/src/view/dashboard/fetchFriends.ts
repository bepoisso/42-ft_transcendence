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
			statusDot.className = `w-3 h-3 rounded-full "bg-green-500"`;
		else
			statusDot.className = `w-3 h-3 rounded-full "bg-red-500"}`;
		friendEl.appendChild(statusDot);

		// username
		const username = document.createElement("span");
		username.textContent = friend.username;
		friendEl.appendChild(username);

		// friend_id
		friendEl.addEventListener("click", () => {
			router.navigate(`/visitProfile/${friend.friend_id}`);
		});

		sidebar.appendChild(friendEl);
	});
}
