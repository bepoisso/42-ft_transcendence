//import type { GameState, Player, Paddle, Ball } from "../interface"
import { GameState, GameRoom, getNextRoomId, initGame, setRoom } from "../interface"

export function wsLocal(websocket: WebSocket, player: string, tokken: string | null) {

	const idRoom = getNextRoomId();
	const namePlayer1 = player;
	const namePlayer2 = "player2";


	const room : GameRoom = {
		id: idRoom,
		player1: {
			socket: websocket,
			token: tokken,
			username: namePlayer1
		},
		player2: {
			socket: null,
			token: tokken,
			username: namePlayer2
		},
		gameState: initGame(namePlayer1, namePlayer2)
	}

	setRoom(idRoom, room);
	return room;
}
