import type { GameState } from "./interface";
import {WIDTH, HEIGHT} from "./interface"
import { getWebSocket } from "../sockets/socket";

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
	// => gérer les infos de l'injection HTML (score / player)
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

export function gameLoop(roomId: string)
{
	const ws = getWebSocket();
	let gameState: any;
	if (!ws) {
		console.error("No websocket open"); // ne devrait jamais arriver
		return;
	}
	ws.addEventListener("message", (event) => {
		const data = JSON.parse(event.data);
		if (data.type === "infoRoom") {
			gameState = data.state;
			drawGame(gameState);
		}
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "ArrowUp") ws.send(JSON.stringify({type: "move", direction: "up", roomId: roomId}));
		if (event.key === "ArrowDown") ws.send(JSON.stringify({type: "move", direction: "down", roomId: roomId}));

		if (event.key === "w") ws.send(JSON.stringify({type: "move", direction: "up", roomId: roomId}));
		if (event.key === "s") ws.send(JSON.stringify({type: "move", direction: "down", roomId: roomId}));
	});
}
