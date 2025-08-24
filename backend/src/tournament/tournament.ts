import { getUserByToken } from "../auth/auth_token";
import db from "../db/db";
import { initGameRoom } from "../game/initialisation";
import { getNextRoomId, setRoom } from "../game/interface";
import { getSocket } from "../socket/socket";
import { create_game_tournament } from "./utils";

export async function createTournament(tournamentName: string, playerTName: string, token: string) {

	const email = await getUserByToken(token);
	if (!email) {
		return { statusCode: 404, message: "User not found" };
	}

	if (!tournamentName || !playerTName) {
		return { statusCode: 401, message: "Invalid credential" };
	}

	const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
	if (!usernameRegex.test(playerTName) || (!usernameRegex.test(tournamentName))) {
		return { statusCode: 401, message: "Invalid credential" };
	}

	// on prend l'id du user
	const user = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email) as { id: number } | undefined;
	if (!user) {
		return { statusCode: 404, message: "User not found" };
	}

	// on check si le tounoirs n'existe pas deja
	const existing = db.prepare(`SELECT id FROM tournaments WHERE tournament_name = ?`).get(tournamentName);
	if (existing) {
		return { statusCode: 409, message: "Tournament already exists" };
	}


	try {
		db.prepare(`INSERT INTO tournaments (tournament_name, player_1) VALUES (?, ?)`).run(tournamentName, user.id);
		db.prepare(`UPDATE users SET username_tournament = ? WHERE email = ?`).run(playerTName, email);

		return { statusCode: 200, message: "Tournament created"};
	} catch (err) {
		console.error(err);
		return { statusCode: 500, message: "Failed to create tournament" };
	}
}




export async function joinTournament(tournamentName: string, playerTName: string, token: string) {
	const email = await getUserByToken(token);
	if (!email) {
		return { statusCode: 404, message: "User not found" };
	}

	if (!tournamentName || !playerTName) {
		return { statusCode: 401, message: "Invalid credential" };
	}

	const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
	if (!usernameRegex.test(playerTName)) {
		return { statusCode: 401, message: "Invalid credential" };
	}

	// Récupérer le user
	const user = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email) as { id: number } | undefined;
	if (!user) {
		return { statusCode: 404, message: "User not found in DB" };
	}
	const playerId = user.id;

	// Récupérer le tournoi avec les infos des players
	const tournament = db.prepare(`SELECT * FROM tournaments WHERE tournament_name = ?`).get(tournamentName) as
		| ({
			id: number;
			[key: `player_${number}`]: number | null;
		})
		| undefined;
	if (!tournament) {
		return { statusCode: 404, message: "Tournament not found" };
	}

	const tournamentId = tournament.id;

	// Vérifier si le joueur est déjà inscrit
	for (let i = 1; i <= 8; i++) {
		if (tournament[`player_${i}`] === playerId) {
			console.log("SHOULDNT PLAY");
			return { statusCode: 409, message: "Player already joined this tournament" };
		}
	}

	try {
		let playerSlot = 0;
		for (let i = 1; i <= 8; i++) {
			const players_list = `player_${i}`;
			const value = (tournament as any)[players_list];
			if (value === undefined || value === null) {
				playerSlot = i;
				break;
			}
		}

		if (playerSlot === 0) {
			return { statusCode: 400, message: "Tournament is already full" };
		}

		db.prepare(`UPDATE users SET username_tournament = ? WHERE email = ?`).run(playerTName, email);
		db.prepare(`UPDATE tournaments SET player_${playerSlot} = ? WHERE id = ?`).run(playerId, tournamentId);

		if (playerSlot === 8) {
			round1(tournamentId);
		}
		return {
			statusCode: 200,
			message: `Player ${playerId} successfully added to the tournament at position`,
			nb_player: `${playerSlot}`,
			id_tournament: tournamentId
		};
	} catch (err: any) {
		if (err.message === "Tournament is full") {
			return { statusCode: 400, message: "Tournament is already full" };
		}
		console.error("Error joining tournament:", err);
		return { statusCode: 500, message: "Internal server error", err };
	}
}




// Creation des quarts de finale (1e stade)
export async function round1(tournamentId: number) {

	try {
		// Récupérer tous les joueurs du tournoi
		const tournament = db.prepare(`SELECT * FROM tournaments WHERE id = ?`).get(tournamentId) as any;
		if (!tournament) {
			console.error("Tournament not found for Round1");
			return;
		}

		tournament.round = 4; // ici on est bien dans tournois ? pas dans tournois_games ? il faut changer le nom
		create_game_tournament(tournament, tournament.player_1, tournament.player_2, 1, 2);
		create_game_tournament(tournament, tournament.player_3, tournament.player_4, 2, 2);
		create_game_tournament(tournament, tournament.player_5, tournament.player_6, 3, 2);
		create_game_tournament(tournament, tournament.player_7, tournament.player_8, 4, 2);

	} catch (err) {
		console.error("Error in Round1:", err);
	}
}


// Creation des quarts de finale (1e stade)
export async function round2(tournamentId: number) {
	try {
		// Récupérer le tournoi
		const tournament = db.prepare(`SELECT * FROM tournaments WHERE id = ?`).get(tournamentId) as any;
		if (!tournament) {
			console.error("Tournament not found for Round2");
			return;
		}

		// Récupérer les gagnants du round précédent (round 4)
		const winners = db.prepare(`
			SELECT winner_id, poule
			FROM tournament_games
			WHERE tournament_id = ? AND round = 4 AND status = 'finished' AND winner_id IS NOT NULL
			ORDER BY poule
		`).all(tournamentId) as { winner_id: number; poule: number }[];

		if (winners.length !== 4) {
			console.error(`Round2: Expected 4 winners, got ${winners.length}`);
			return;
		}

		// Créer les demi-finales
		// Match 1: gagnant poule 1 vs gagnant poule 2
		// Match 2: gagnant poule 3 vs gagnant poule 4
		const player1_semifinal1 = winners.find(w => w.poule === 1)?.winner_id;
		const player2_semifinal1 = winners.find(w => w.poule === 2)?.winner_id;
		const player1_semifinal2 = winners.find(w => w.poule === 3)?.winner_id;
		const player2_semifinal2 = winners.find(w => w.poule === 4)?.winner_id;

		if (!player1_semifinal1 || !player2_semifinal1 || !player1_semifinal2 || !player2_semifinal2) {
			console.error("Round2: Missing winners from previous round");
			return;
		}

		tournament.round = 2; // Round des demi-finales
		create_game_tournament(tournament, player1_semifinal1, player2_semifinal1, 1, 2);
		create_game_tournament(tournament, player1_semifinal2, player2_semifinal2, 2, 2);

	} catch (err) {
		console.error("Error in Round2:", err);
	}
}


// Creation de la finale (3e stade)
export async function round3(tournamentId: number) {
	try {
		// Récupérer le tournoi
		const tournament = db.prepare(`SELECT * FROM tournaments WHERE id = ?`).get(tournamentId) as any;
		if (!tournament) {
			console.error("Tournament not found for Round3");
			return;
		}

		// Récupérer les gagnants du round précédent (round 2)
		const winners = db.prepare(`
			SELECT winner_id, poule
			FROM tournament_games
			WHERE tournament_id = ? AND round = 2 AND status = 'finished' AND winner_id IS NOT NULL
			ORDER BY poule
		`).all(tournamentId) as { winner_id: number; poule: number }[];

		if (winners.length !== 2) {
			console.error(`Round3: Expected 2 winners, got ${winners.length}`);
			return;
		}

		// Créer la finale
		const player1_final = winners[0].winner_id;
		const player2_final = winners[1].winner_id;

		tournament.round = 1; // Round de la finale
		create_game_tournament(tournament, player1_final, player2_final, 1, 1);

	} catch (err) {
		console.error("Error in Round3:", err);
	}
}



// Ici la gestion normale d'une game s'est terminée et le jeu en back appelle cette fonction.
// Il faut :
//	- register les games dans la db
//	- regarder le round
//	- redirige vers la page du waiting avec le tournament id
export function round_over(gameRoom: any, loserID: number, winnerID: number) {
	const tournament_id = gameRoom.tournament_id;

	//conserve le gagnant / perdant dans tournament_games dans la db
	db.prepare(`UPDATE tournament_games SET winner_id = ?, player_loser_id = ?, status = 'finished' WHERE id = ?
		`).run(winnerID, loserID, gameRoom.tournament_game_id);

	// appelle les WS pour rediriger sur la bonne page du front
	const socketWinner = getSocket.get(winnerID);
	const socketLoser = getSocket.get(loserID);


	if (socketWinner) {
		socketWinner.send(JSON.stringify({
			type: "tournament_round_over",
			result: "win",
			tournamentId: tournament_id,
			round: gameRoom.round
		}));
	}

	if (socketLoser) {
		socketLoser.send(JSON.stringify({
			type: "tournament_round_over",
			result: "lose",
			tournamentId: tournament_id,
			round: gameRoom.round
		}));
	}
}
