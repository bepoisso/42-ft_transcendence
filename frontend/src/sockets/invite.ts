// Les deux fonctions sont pratiquement les memes, elles créent un event en bas de la page soit pour add friend soit pour join game


export function gameInvit(socket: WebSocket, data: any)
{
	const notification = document.createElement("div");
	notification.className = `
		fixed bottom-4 left-4 bg-gray-800 text-white px-4 py-3 rounded shadow-lg flex flex-col space-y-2
	`;

	const message = document.createElement("span");
	message.textContent = `${data.from_name} invited you for a game !`;
	notification.appendChild(message);

	// Boutons
	const buttons = document.createElement("div");
	buttons.className = "flex space-x-2";

	const acceptBtn = document.createElement("button");
	acceptBtn.textContent = "✅";
	acceptBtn.className = "px-3 py-1 bg-green-600 rounded hover:bg-green-700";
	acceptBtn.onclick = () => {
		socket.send(JSON.stringify({ type: "game_accepted", from: data.from, mode: "online"}));
		notification.remove();
	};

	const declineBtn = document.createElement("button");
	declineBtn.textContent = "❌";
	declineBtn.className = "px-3 py-1 bg-red-600 rounded hover:bg-red-700";
	declineBtn.onclick = () => {
		notification.remove();
	};

	buttons.appendChild(acceptBtn);
	buttons.appendChild(declineBtn);
	notification.appendChild(buttons);

	document.body.appendChild(notification);

	// Supprimer automatiquement après 15 secondes si pas de réponse
	setTimeout(() => notification.remove(), 15000);
}

export function friendInvit(socket: WebSocket, data: any)
{
	const notification = document.createElement("div");
	notification.className = `
		fixed bottom-4 left-4 bg-gray-800 text-white px-4 py-3 rounded shadow-lg flex flex-col space-y-2
	`;

	const message = document.createElement("span");
	message.textContent = `${data.from_name} wants you to be friends !`;
	notification.appendChild(message);

	// Boutons
	const buttons = document.createElement("div");
	buttons.className = "flex space-x-2";

	const acceptBtn = document.createElement("button");
	acceptBtn.textContent = "✅";
	acceptBtn.className = "px-3 py-1 bg-green-600 rounded hover:bg-green-700";
	acceptBtn.onclick = () => {
		socket.send(JSON.stringify({ type: "accept_friend_invite", from: data.from }));
		notification.remove();
	};

	const declineBtn = document.createElement("button");
	declineBtn.textContent = "❌";
	declineBtn.className = "px-3 py-1 bg-red-600 rounded hover:bg-red-700";
	declineBtn.onclick = () => {
		notification.remove();
	};

	buttons.appendChild(acceptBtn);
	buttons.appendChild(declineBtn);
	notification.appendChild(buttons);

	document.body.appendChild(notification);

	// Supprimer automatiquement après 15 secondes si pas de réponse
	setTimeout(() => notification.remove(), 15000);
}
