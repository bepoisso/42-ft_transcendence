export function renderDashboard() {
  document.getElementById("app")!.innerHTML = `
	<div class="z-10 flex flex-col items-center space-y-10 relative h-screen justify-center">
	  <h1 class="md:text-[6rem] text-[4rem] font-[400] pointer-events-none drop-shadow-md text-white">
		DASHBOARD
	  </h1>

	  <button type="button" id="btnLocal" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Local
      </button>

	  <button type="button" id="btnOnline" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Online
      </button>

	  <button type="button" id="btnTournament" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Tournament
      </button>
	</div>
  `;
}


export function handleClicks(router: Router)
{
	const btnLocal = document.getElementById("btnLocal");
	btnLocal?.addEventListener("click", async (e) => {
		e.preventDefault(); // Empêche le rechargement


	const token = localStorage.getItem("authToken");
	const pseudo = localStorage.getItem("pseudo");

	const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`); // a changer avec le proxy jpense

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
			history.pushState(null, "", `/game${data.roomId}`);
			router.checkRoute();

			// Lance le jeu
			initGame(data.roomId, ws);
			gameLoop(ws, data.roomId);
		}
	});


	});
}
