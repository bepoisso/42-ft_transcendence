import { App } from "./app"

export class Router {

	private _routes : Map<string, (params?: any) => void>;
	private _isAuthentified : () => boolean; // pointeur de fonction dans app pour savoir si une personne est authentifiée ou non

	constructor ( routes: { [path: string]: (params?: any) => void}, isAuthentified: () => boolean )
	{
		this._routes = new Map(Object.entries(routes));
		this._isAuthentified = isAuthentified;

		// Pour gerer les retours en arriere
		window.addEventListener("popstate", () => {
			this.checkRoute();
		});
	}

	// pour naviguer vers une page
	navigate(path: string) {
		history.pushState(null, "", path);
		this.checkRoute();
	}

	checkRoute()
	{
		const path = window.location.pathname;

		// Essayer de matcher les routes dynamiques
		for (const [key, values] of this._routes.entries())
		{
			const match = this.matchRoute(key, path);
			if (match) {
				// Vérifier auth si nécessaire
				if (!this._isAuthentified())
				{
					console.error("Utilisateur non authentifié");
					window.location.href = "/login";
					return;
				}

				values(match.params);
				return;
			}
		}
		// Route non trouvée
		console.error("404 - page non trouvée");
	}


}
