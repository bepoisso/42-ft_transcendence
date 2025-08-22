import { getUserByToken } from "../auth/auth_token";
import db from "../db/db";
import { getSocket } from "../game/socket";

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

		if (playerSlot === 8) {
			Round1(tournamentId);
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



	// ici je peux get les id des joueurs et envoyer leur id dans un WS (2id par room)
	// Le WS va recup les socket correspondant aux id et creer les rooms.
	// Des lors tout est gere en echange WS.
	// A la fin de la partie mon WS envoie enregistre le score dans la db via le nom du tournois
	// ws renvoie au front qui appelle le back pour preparer la nouvelle room

	// Le back va chercher si la game suivante est egalement finie pour pouvoir lancer la prochaine game
	// probleme : comment fait il cela ?
	// On peut dire que le back attende que toute les games soient terminés (il regarde le pending)
	// Une fois qu'elle le sont il lance round 2 sur le meme schema


export async function Round1(tournamentId: number) {

	try {
		// Récupérer tous les joueurs du tournoi
		const tournament = db.prepare(`SELECT * FROM tournaments WHERE id = ?`).get(tournamentId) as any;
		if (!tournament) {
			console.error("Tournament not found for Round1");
			return;
		}

		tournament.round = 1;
		create_game_tournament(tournament, tournament.player_1, tournament.player_2);

	} catch (err) {
		console.error("Error in Round1:", err);
	}
}


async function create_game_tournament(tournament: any, player1: number, player2: number) {

	const stmt = db.prepare(`
		INSERT INTO tournament_game (tournament_id, round, player1_id,player2_id, status) VALUES (?, ?, ?, ?, 'pending')
		`).run(tournament.id, tournament.round, player1, player2);

	const socket_player1 = getSocket.get(player1);
	const socket_player2 = getSocket.get(player2);

	if(socket_player1) {
		socket_player1.send(JSON.stringify({
			type: "tournament_start",
			id: tournament.id,
		}));
	}

}
