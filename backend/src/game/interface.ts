import { Socket } from "socket.io";

// ===============================================
// 			INTERFACE GAME LOGIC				||
// ===============================================

export const WIDTH = 800;
export const HEIGHT = 600;

export interface Paddle {
	width: number;
	height: number;
	x: number;
	y: number;
	speed: number
}

export interface Ball {
	x: number;
	y: number;
	radius: number;
	xDirect: number;
	yDirect: number;
	speed: number
}

export interface Player {
	name: string;
	score: number;
	paddle: Paddle
}

export interface GameState {
	player1: Player;
	player2: Player;
	ball: Ball
}


// ===========================================
// 			INTERFACE WS LOGIC				||
// ===========================================

interface PlayerConnection {
	id_player: number;
	username: string;
}


export interface GameRoom {
	id: number;
	mode: string;
	player1: PlayerConnection;
	player2: PlayerConnection;
	gameState: GameState;
}


const rooms = new Map<number, GameRoom>();
let idRoom = 0;


export function getNextRoomId(): number {
	return idRoom++;
}

export function setRoom(id: number, gameRoom: GameRoom) {
	rooms.set(id, gameRoom)
}

export function getGameRoom(id: number): GameRoom | null {
	return rooms.get(idRoom) ?? null;
}

