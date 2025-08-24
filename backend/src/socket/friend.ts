import db from "../db/db";
import { getId, getSocket } from "./socket";
import type { WebSocket } from "ws";


// ==================================================================================================
// 								On reçoit une invitation amis										||
// ===================================================================================================

export function friend_send_invite(ws: WebSocket, data: any) {
	const fromId = getId.get(ws);
	const toSocket = getSocket.get(data.to);
	const fromUserDB = db.prepare("SELECT username FROM users WHERE id = ?").get(fromId) as { username?: string } | undefined;
	const fromUser = fromUserDB?.username;

	const relation = db.prepare(`
		SELECT * FROM friends
		WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
		AND status IN ('pending', 'accepted', 'refused')
	`).get(fromId, data.to, data.to, fromId) as { status?: string } | undefined;

	console.log("Est ce qu'ils sont deja amis ? : ", relation?.status);
	// 4 cas possibles relation statu est undefined et dans ce cas on va pouvoir process ou alors
	// la demande d'ami est deja envoyée, refusée ou acceptée
	if (relation?.status === "accepted") {
		ws.send(JSON.stringify({type: "error", message: "You are already friends"}));
		return;
	}

	if (relation?.status === "pending") {
		ws.send(JSON.stringify({type: "error", message: "You already asked to be friends with this user"}));
		return;
	}

	if (relation?.status === "refused") {
		ws.send(JSON.stringify({ type: "error", message: "This user already refused your invitation"}));
		return;
	}

	try {
		db.prepare(`INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')`).run(fromId, data.to);
		console.log(`Check demande d'amis : ${fromId} → ${data.to}`);
		if (toSocket && fromId !== undefined) {
		// Envoie un message JSON au destinataire
				toSocket.send(JSON.stringify({
					type: "friend_receive_invite",
					from: fromId,
					from_name: fromUser
				}));
		}
	} catch (err){
		console.error("Error friend request : ", err );
	}
}



// ==================================================================================================
// 								On accepte l'invitation amis										||
// ===================================================================================================

export function friend_accepted(ws: WebSocket, data: any) {
	const idFrom = data.from; // L'utilisateur qui a envoyé la demande d'amitié
	const idTo = getId.get(ws); // L'utilisateur qui accepte la demande

	if (!idTo || !idFrom) {
		console.log("Error id for friend request");
		return;
	}

	try {

		// Mettre à jour le statut de la relation à 'accepted' dans les deux sens
		// Mettre à jour la demande existante à 'accepted'
		db.prepare(`
			UPDATE friends
			SET status = 'accepted'
			WHERE user_id = ? AND friend_id = ? AND status = 'pending'
		`).run(idFrom, idTo);

		// Créer la relation inverse pour avoir le friendship dans les deux sens
		db.prepare(`INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')`).run(idTo, idFrom);

		// Username pour envoyer un message
		const userFrom = db.prepare("SELECT id, username, avatar_url FROM users WHERE id = ?").get(idFrom) as any;
		const userTo = db.prepare("SELECT id, username, avatar_url FROM users WHERE id = ?").get(idTo) as any;

		// Notifier l'utilisateur qui a envoyé la demande que sa demande a été acceptée
		const fromSocket = getSocket.get(idFrom);
		if (fromSocket) {
			fromSocket.send(JSON.stringify({
				type: "display_message",
				message: `${userTo.username} a accepté votre demande d'amitié`
			}));
		}

		// Confirmer à l'utilisateur qui accepte que l'amitié est établie
		ws.send(JSON.stringify({
			type: "display_message",
			message: `You are now frien with ${userFrom.username} !`
		}));

		console.log(`Friendship accepted entre ${userFrom.username} (${idFrom}) et ${userTo.username} (${idTo})`);

	} catch (error) {
		console.error("Error friend request :", error);
		ws.send(JSON.stringify({
			type: "error",
			message: "Error friend request"
		}));
	}
}




// ==================================================================================================
// 								On refuse l'invitation amis											||
// ===================================================================================================
export function refuse_friend_invite(ws: WebSocket, data: any) {
	const idFrom = data.from; // L'utilisateur qui a envoyé la demande d'amitié
	const idTo = getId.get(ws); // L'utilisateur qui accepte la demande

	if (!idTo || !idFrom) {
		console.log("Error id for friend request");
		return;
	}

	try {

		// Mettre à jour le statut de la relation à 'accepted' dans les deux sens
		// Mettre à jour la demande existante à 'accepted'
		db.prepare(`
			UPDATE friends
			SET status = 'accepted'
			WHERE user_id = ? AND friend_id = ? AND status = 'pending'
		`).run(idFrom, idTo);

		// Créer la relation inverse pour avoir le friendship dans les deux sens
		db.prepare(`INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'refused')`).run(idTo, idFrom);

		// Username pour envoyer un message
		const userFrom = db.prepare("SELECT id, username, avatar_url FROM users WHERE id = ?").get(idFrom) as any;
		const userTo = db.prepare("SELECT id, username, avatar_url FROM users WHERE id = ?").get(idTo) as any;

		// Notifier l'utilisateur qui a envoyé la demande que sa demande a été acceptée
		const fromSocket = getSocket.get(idFrom);
		if (fromSocket) {
			fromSocket.send(JSON.stringify({
				type: "display_message",
				message: `${userTo.username} a refusé votre demande d'amitié`
			}));
		}

		// Confirmer à l'utilisateur qui accepte que l'amitié est établie
		ws.send(JSON.stringify({
			type: "display_message",
			message: `You are now frien with ${userFrom.username} !`
		}));

		console.log(`Friendship refused entre ${userFrom.username} (${idFrom}) et ${userTo.username} (${idTo})`);

	} catch (error) {
		console.error("Error friend request :", error);
		ws.send(JSON.stringify({
			type: "error",
			message: "Error friend request"
		}));
	}
}
