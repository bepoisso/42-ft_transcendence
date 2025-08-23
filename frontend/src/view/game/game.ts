import { getSocket } from "../../sockets/socket";
import { Router } from "../../router";
import type { GameState, Player, Ball, Paddle } from "./interface";
import {WIDTH, HEIGHT} from "./interface"

export function renderGame() {
  document.getElementById("app")!.innerHTML = `
    <div id="gameContainer" class="flex flex-col items-center justify-center h-screen bg-black">

      <!-- Ligne du haut : noms et score -->
      <div class="w-[800px] flex justify-between text-white mb-4">
        <div id="player1" class="text-lg font-bold">Player 1</div>
        <div id="score" class="text-lg font-bold">0 : 0</div>
        <div id="player2" class="text-lg font-bold">Player 2</div>
      </div>

      <!-- Zone de jeu -->
      <canvas id="pong" width="${WIDTH}" height="${HEIGHT}" class="bg-black relative z-50 border border-white"></canvas>
    </div>
  `;
}


export function drawGame(gameState: GameState)
{
	const canvas = document.getElementById("pong") as HTMLCanvasElement;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	// Efface l'écran
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Dessine les paddles
	ctx.fillStyle = "white";
	ctx.fillRect(
		gameState.player1.paddle.x,
		gameState.player1.paddle.y,
		gameState.player1.paddle.width,
		gameState.player1.paddle.height
	);
	ctx.fillRect(
		gameState.player2.paddle.x,
		gameState.player2.paddle.y,
		gameState.player2.paddle.width,
		gameState.player2.paddle.height
	);

	// Dessine la balle
	ctx.beginPath();
	ctx.arc(
		gameState.ball.x,
		gameState.ball.y,
		gameState.ball.radius,
		0,
		Math.PI * 2
	);
	ctx.fill();
}

export async function gameLoop(router: Router, id_Room: string)
{
	// console.log("🎯 gameLoop appelé avec id_Room:", id_Room, "type:", typeof id_Room);
	const socket = await getSocket(router);
	const idRoom = Number(id_Room);
	// console.log("🔢 Conversion Number(id_Room):", idRoom, "type:", typeof idRoom);

	let isLocal = false;
	let askOnce = 0;
	let localName = "Player 2"; // Default value
	let playerPerspective = "player1";

	// appelle game_info
	// console.log("on entre dans la game");
	// console.log("📤 Envoi game_info avec roomId:", idRoom);
	socket.send(JSON.stringify({ type: "game_info", roomId: idRoom }));

	// Handler spécifique pour les messages de jeu
	const originalOnMessage = socket.onmessage;
	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);

		// Traite d'abord les messages de jeu
		if (data.type === "game_update") {
			// console.log("🎮 Game update reçu:", data.type, data.mode);
			isLocal = data.mode === "local";
			if (isLocal === true && askOnce === 0) {
				askOnce = 1;
				localName = prompt("Enter name for Player 2:") || "Player 2";
			}

			if (data.perspective) {
				playerPerspective = data.perspective;
				if (playerPerspective == "player2")
					invertGameState(data.gameState);
			}

			// Met à jour les noms des joueurs
			const player1 = document.getElementById("player1");
			const player2 = document.getElementById("player2");
			if (player1) player1.textContent = data.gameState.player1.username;
			if (player2) {
				if (isLocal === false) player2.textContent = data.gameState.player2.username;
				else player2.textContent = localName!;
			}

			// Met à jour le score
			const scoreElem = document.getElementById("score");
			if (scoreElem) scoreElem.textContent = `${data.gameState.player1.score} : ${data.gameState.player2.score}`;

			// Dessine le jeu
			drawGame(data.gameState);
		} else if (originalOnMessage) {
			// Relaie les autres messages vers le handler original
			originalOnMessage.call(socket, event);
		}
	};

	// On gere deux evenements, la touche enfoncée et la touche relevée.
	// On donne l'info "local" pour que le serv puisse ignorer le mouvement si le mode n'est pas local
	window.addEventListener("keydown", (e) =>
	{
		if (e.key === "ArrowUp" || e.key === "w") {
			e.preventDefault();
			socket.send(JSON.stringify({
				type: "move_paddle",
				roomId: idRoom,
				direction: "up",
				local: isLocal,
				movement: "start",
				perspective: playerPerspective
			}));
		}

		if (e.key === "ArrowDown" || e.key === "s") {
			e.preventDefault();
			socket.send(JSON.stringify({
				type: "move_paddle",
				roomId: idRoom,
				direction: "down",
				local: isLocal,
				movement: "start",
				perspective: playerPerspective
			}));
		}
	});

	window.addEventListener("keyup", (e) =>
	{
		if (e.key === "ArrowUp" || e.key === "w") {
			e.preventDefault();
			socket.send(JSON.stringify({
				type: "move_paddle",
				roomId: idRoom,
				direction: "up",
				local: isLocal,
				movement: "stop",
				perspective: playerPerspective
			}));
		}

		if (e.key === "ArrowDown" || e.key === "s") {
			e.preventDefault();
			socket.send(JSON.stringify({
				type: "move_paddle",
				roomId: idRoom,
				direction: "down",
				local: isLocal,
				movement: "stop",
				perspective: playerPerspective
			}));
		}
	});
}

function invertGameState(gameState: GameState) : void {
	// invert player pos
	let playerTemp: Player = gameState.player1;
	gameState.player1 = gameState.player2;
	gameState.player2 = playerTemp;

	// mirror paddle position
	gameState.player1.paddle.x = WIDTH - gameState.player1.paddle.x - gameState.player1.paddle.width;
	gameState.player2.paddle.x = WIDTH - gameState.player2.paddle.x - gameState.player2.paddle.width;

	// ball symmetry
	gameState.ball.x = 2 * (WIDTH / 2) - gameState.ball.x;
}







