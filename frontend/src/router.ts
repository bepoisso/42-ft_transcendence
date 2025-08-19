import { App } from "./app"

export class Router {

	private _routes : Map<string, (params?: any) => void>;

	constructor (routes: { [path: string]: (params?: any) => void})
	{
		this._routes = new Map(Object.entries(routes));

		// Pour gerer les retours en arriere
		window.addEventListener("popstate", () => {
			this.checkRoute();
		});
	}

	// pour naviguer vers une page
	navigate(path: string | null) {
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
				values(match.params);
				return;
			}
		}
		// Route non trouvée
		console.error("404 - page non trouvée");
	}


	matchRoute(userPath: string, serverRoute: string)
	{
		const arrayUserPath = userPath.split("/").filter(Boolean); // pour ne pas avoir de probleme avec les ""
		const arrayServerRoute = serverRoute.split("/").filter(Boolean);

		// Si arrayUserPath[0] != arrayServerRoute[0] on sait directement qu'on n'est pas bon
		// Si il n'y a pas le bon nombre d'argument c'est aussi une erreur
		if (arrayUserPath[0] !== arrayServerRoute[0]) return null;
		if (arrayUserPath.length !== arrayServerRoute.length) return null;

		//on crée les params qu'on va ajouter pour le nouvel URL
		const params: { [key: string]: string } = {};
		for (let i = 0; i < arrayServerRoute.length; i++)
		{
			if (arrayServerRoute[i].startsWith(":"))
			{
				const key = arrayServerRoute[i].substring(1);
				params[key] = arrayUserPath[i];
			}
		}
		return {params}
	}

}
