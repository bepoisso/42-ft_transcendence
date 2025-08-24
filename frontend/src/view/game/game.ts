import { getSocket } from "../../sockets/socket";
import { Router } from "../../router";
import type { GameState, Player } from "./interface";
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

	// earase canevas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// draw paddles
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

	// draw ball
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
	const socket = await getSocket(router);
	const idRoom = Number(id_Room);

	let isLocal = false;
	let askOnce = 0;
	let localName = "Player 2"; // default pseudo value
	let playerPerspective = "player1";

	// call game_info
	socket.send(JSON.stringify({ type: "game_info", roomId: idRoom }));

	// USER INPUTS
	let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
	let keyupHandler: ((e: KeyboardEvent) => void) | null = null;

	// config key listeners
	function setupEventListeners(local: boolean) {
		// clean old listeners
		if (keydownHandler) {
			window.removeEventListener("keydown", keydownHandler);
			keydownHandler = null;
		}
		if (keyupHandler) {
			window.removeEventListener("keyup", keyupHandler);
			keyupHandler = null;
		}

		if (local === false) {
			// ONLINE mode
			keydownHandler = (e) => {
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
			};

			keyupHandler = (e) => {
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
			};
		} else {
			// LOCAL Mode
			keydownHandler = (e) => {
				// P1 (W/S)
				if (e.key === "w" || e.key === "W") {
					e.preventDefault();
					socket.send(JSON.stringify({
						type: "move_paddle",
						roomId: idRoom,
						direction: "up",
						local: isLocal,
						movement: "start",
						perspective: "player1"
					}));
				}

				if (e.key === "s" || e.key === "S") {
					e.preventDefault();
					socket.send(JSON.stringify({
						type: "move_paddle",
						roomId: idRoom,
						direction: "down",
						local: isLocal,
						movement: "start",
						perspective: "player1"
					}));
				}

				// P2 (Arrow keys)
				if (e.key === "ArrowUp") {
					e.preventDefault();
					socket.send(JSON.stringify({
						type: "move_paddle",
						roomId: idRoom,
						direction: "up",
						local: isLocal,
						movement: "start",
						perspective: "player2"
					}));
				}

				if (e.key === "ArrowDown") {
					e.preventDefault();
					socket.send(JSON.stringify({
						type: "move_paddle",
						roomId: idRoom,
						direction: "down",
						local: isLocal,
						movement: "start",
						perspective: "player2"
					}));
				}
			};

			keyupHandler = (e) => {
				// P1 (W/S)
				if (e.key === "w" || e.key === "W") {
					e.preventDefault();
					socket.send(JSON.stringify({
						type: "move_paddle",
						roomId: idRoom,
						direction: "up",
						local: isLocal,
						movement: "stop",
						perspective: "player1"
					}));
				}

				if (e.key === "s" || e.key === "S") {
					e.preventDefault();
					socket.send(JSON.stringify({
						type: "move_paddle",
						roomId: idRoom,
						direction: "down",
						local: isLocal,
						movement: "stop",
						perspective: "player1"
					}));
				}

				// P2 (Arrow keys)
				if (e.key === "ArrowUp") {
					e.preventDefault();
					socket.send(JSON.stringify({
						type: "move_paddle",
						roomId: idRoom,
						direction: "up",
						local: isLocal,
						movement: "stop",
						perspective: "player2"
					}));
				}

				if (e.key === "ArrowDown") {
					e.preventDefault();
					socket.send(JSON.stringify({
						type: "move_paddle",
						roomId: idRoom,
						direction: "down",
						local: isLocal,
						movement: "stop",
						perspective: "player2"
					}));
				}
			};
		}

		// Start key listeners
		if (keydownHandler) window.addEventListener("keydown", keydownHandler);
		if (keyupHandler) window.addEventListener("keyup", keyupHandler);
	}

	// GAME MESSAGE HANDLER
	const originalOnMessage = socket.onmessage;
	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);

		// ========== game_update ==========
		if (data.type === "game_update") {
			// setup for local mode
			isLocal = data.mode == "local";
			if (isLocal === true && askOnce === 0) {
				askOnce = 1;
				localName = prompt("Enter name for Player 2:") || localName;
				setupEventListeners(isLocal);
			}

			// invert game if player perspective (right player to left side)
			if (data.perspective) {
				playerPerspective = data.perspective;
				if (playerPerspective == "player2")
					invertGameState(data.gameState);
			}

			// update html username
			const player1 = document.getElementById("player1");
			const player2 = document.getElementById("player2");
			if (player1) player1.textContent = data.gameState.player1.username;
			if (player2) {
				if (isLocal === false) player2.textContent = data.gameState.player2.username;
				else player2.textContent = localName!;
			}

			// update html score
			const scoreElem = document.getElementById("score");
			if (scoreElem) scoreElem.textContent = `${data.gameState.player1.score} : ${data.gameState.player2.score}`;

			// draw game
			drawGame(data.gameState);
		}
		// ========== game_over ==========
		else if (data.type === "game_over") {
			// gray the canevas
			const canvas = document.getElementById("pong") as HTMLCanvasElement;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}

			// invert score if perspective
			let player_left_score = data.player1Score;
			let player_right_score = data.player2Score;
			if (playerPerspective == "player2") {
				player_left_score = data.player2Score;
				player_right_score = data.player1Score;
			}

			// determine winner if local mode
			let winnerName = data.winner;
			if (isLocal) {
				const player1Name = document.getElementById("player1")?.textContent || "Player 1";
				const player2Name = document.getElementById("player2")?.textContent || "Player 2";
				if (data.player1Score > data.player2Score)
					winnerName = player1Name;
				else if (data.player2Score > data.player1Score)
					winnerName = player2Name;
			}

			// print end game stats infos
			const gameContainer = document.getElementById("gameContainer");
			if (gameContainer) {
				const gameOverDiv = document.createElement("div");
				gameOverDiv.className = "absolute inset-0 flex flex-col items-center justify-center text-white z-60";
				gameOverDiv.innerHTML = `
					<div class="bg-black bg-opacity-80 p-8 rounded-lg text-center">
						<h2 class="text-3xl font-bold mb-4">Game Over</h2>
						<p class="text-xl mb-2">Winner: ${winnerName}</p>
						<p class="text-lg">Final Score: ${player_left_score} : ${player_right_score}</p>
						<button onclick="window.location.href='/dashboard'" class="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
							Go Back
						</button>
					</div>
				`;
				gameContainer.appendChild(gameOverDiv);
			}
		} else if (originalOnMessage) {
			// relay msg to original handler
			originalOnMessage.call(socket, event);
		}
	};

	// config listeners
	setupEventListeners(isLocal);
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







