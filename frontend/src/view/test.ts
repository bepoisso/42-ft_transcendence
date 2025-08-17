import { Router } from "../router";
import { initWebSocket, getWebSocket } from "../sockets/socket";

export function renderTest() {
  document.getElementById("app")!.innerHTML = `
    <div class="flex flex-col items-center space-y-4">
      <h1 class="text-4xl text-white">Dashboard</h1>
      <div id="user-info" class="text-center">
        <img id="user-avatar" src="../assets/basic_avatar.png" class="w-24 h-24 rounded-full mb-2" />
        <div id="user-name" class="text-lg font-bold text-white">Loading...</div>
      </div>

      <input type="file" id="avatar-upload" accept="../assets/${name}/*" />
    </div>
  `
}


export function handleClicks(router: Router)
{
	const btnLocal = document.getElementById("btnLocal");
	btnLocal?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement


	const token = localStorage.getItem("authToken");
	const pseudo = localStorage.getItem("pseudo");
	console.log("TEST BOUTON LOCAL");

	const ws = initWebSocket(token);

	ws.addEventListener("open", () => {
		ws.send(JSON.stringify({
			type: "createRoom",
			mode: "local",
			playerName: pseudo
		}));
	});

	ws.addEventListener("message", (event) => {
		const data = JSON.parse(event.data);
		if (data.type === "roomCreated") {

			// Log test
			console.log("Room créée :", data.roomId);

			// Rediriger la route
			router.navigate(`/game/${data.roomId}`);
		}
	});


	});
}
