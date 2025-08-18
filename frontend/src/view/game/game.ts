import { getSocket } from "../../sockets/socket";
import { Router } from "../../router";
import type { GameState } from "./interface";
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

export function gameLoop(router: Router, roomId: string)
{
	const socket = getSocket(router);
	let isLocal = false;

	// appelle game_info
	socket.emit("game_info", { roomId });


	// recupere game_update
	socket.on("game_update", (gameState: GameState) => {
		drawGame(gameState);

		// pour faire bouger le deuxieme boug avec w et s
		if (gameState.mode === "local") {isLocal = true;}
		else {isLocal = false;}

		// Met à jour les noms des joueurs
		const player1 = document.getElementById("player1");
		const player2 = document.getElementById("player2");
		if (player1) player1.textContent = gameState.player1.name;
		if (player2) player2.textContent = gameState.player2.name;

		// Met à jour le score
		const scoreElem = document.getElementById("score");
		if (scoreElem) scoreElem.textContent = `${gameState.player1.score} : ${gameState.player2.score}`;
	});


	// recupere game over
	socket.on("game_over", (winner: string) => {
		alert(`${winner} has won the game !`);
		router.navigate("/dashboard");
	});


	// event listener
	window.addEventListener("keydown", (e) => {
		if (e.key === "ArrowUp") socket.emit("move_paddle", { roomId, direction: "up" });
		if (e.key === "ArrowDown") socket.emit("move_paddle", { roomId, direction: "down" });
		if (isLocal) {
			if (e.key === "w") socket.emit("move_paddle", { roomId, direction: "up" });
			if (e.key === "s") socket.emit("move_paddle", { roomId, direction: "down" });
		}
	});
}




