import { getUserByToken } from "../auth/auth_token";
import db from "../db/db";
import { initGameRoom } from "../game/initialisation";
import { getNextRoomId, setRoom } from "../game/interface";
import { getSocket } from "../socket/socket";


export function getPlayerGame(tournamentId: number, playerId: number) {
	const stmt = db.prepare(`
		SELECT id, round, poule, player1_id, player2_id, winner_id, status
		FROM tournament_games
		WHERE tournament_id = ?
		  AND (player1_id = ? OR player2_id = ?)
	`);
	return stmt.get(tournamentId, playerId, playerId);
}


export async function create_game_tournament(tournament: any, player1: number, player2: number, poule: number, round: number) {

	const stmt = db.prepare(`
		INSERT INTO tournament_game (tournament_id, round, player1_id,player2_id, poule, round, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')
		`).run(tournament.id, tournament.round, player1, player2, poule, round);

	const socket_player1 = getSocket.get(player1);
	const socket_player2 = getSocket.get(player2);

	const idRoom = getNextRoomId();

	db.prepare(`UPDATE users SET room_id = ? WHERE id = ?`).run(idRoom, player1);
	db.prepare(`UPDATE users SET room_id = ? WHERE id = ?`).run(idRoom, player2);

	const gameRoom = initGameRoom(idRoom, player1, player2, "tournament", tournament.id);
	// Ajouter les propriétés spécifiques au tournoi
	(gameRoom as any).round = round;
	(gameRoom as any).poule = poule;
	(gameRoom as any).tournament_game_id = stmt.lastInsertRowid;
	setRoom(idRoom, gameRoom);

	// gestion normale d'une game
	if(socket_player1) {
		socket_player1.send(JSON.stringify({
			type: "tournament_start",
			id: idRoom,
		}));
	}
	if(socket_player2) {
		socket_player2.send(JSON.stringify({
			type: "tournament_start",
			id: idRoom,
		}));
	}

}




export async function infoTournament(tournamentId: number, token: string) {

	const email = await getUserByToken(token);
		if (!email) {
			return { statusCode: 404, message: "User not found" };
		}

	try {
		// Récupérer les informations du tournoi
		const tournament = db.prepare(`
			SELECT id, tournament_name, tournament_status, round as current_round FROM tournaments WHERE id = ?
		`).get(tournamentId) as {
			id: number;
			tournament_name: string;
			tournament_status: string;
			current_round: number;
		} | undefined;

		if (!tournament) {
			return {
				statusCode: 404,
				message: "Tournament not found"
			};
		}

		// Récupérer tous les joueurs du tournoi
		const tournamentData = db.prepare(`
			SELECT player_1, player_2, player_3, player_4, player_5, player_6, player_7, player_8 FROM tournaments WHERE id = ?
		`).get(tournamentId) as any;

		// Construire la liste des IDs des joueurs
		const playerIds: number[] = [];
		for (let i = 1; i <= 8; i++) {
			const playerId = tournamentData[`player_${i}`];
			if (playerId) {
				playerIds.push(playerId);
			}
		}

		// Récupérer les informations détaillées des joueurs
		const players = [];
		for (const playerId of playerIds) {
			const player = db.prepare(`
				SELECT id, username_tournament as username, avatar_url FROM users WHERE id = ?
			`).get(playerId) as {
				id: number;
				username: string;
				avatar_url: string;
			} | undefined;

			if (player) {
				players.push(player);
			}
		}

		// Récupérer tous les matchs du tournoi
		const games = db.prepare(`
			SELECT id, round, poule, player1_id, player2_id, winner_id, status FROM tournament_games WHERE tournament_id = ? ORDER BY round DESC, poule ASC
		`).all(tournamentId) as {
			id: number;
			round: number;
			poule: number;
			player1_id: number;
			player2_id: number;
			winner_id: number | null;
			status: string;
		}[];

		return {
			statusCode: 200,
			message: "Tournament info retrieved successfully",
			tournament: {
				id: tournament.id,
				tournament_name: tournament.tournament_name,
				players: players,
				games: games,
				current_round: tournament.current_round || 1,
				tournament_status: tournament.tournament_status
			}
		};

	} catch (error) {
		console.error("Error in infoTournament:", error);
		return {
			statusCode: 500,
			message: "Internal server error"
		};
	}
}
