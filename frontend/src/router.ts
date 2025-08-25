// import { App } from "./app" // Importation non utilisée

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

	async checkRoute()
	{
		const path = window.location.pathname;

		// Essayer de matcher les routes dynamiques
		for (const [routePattern, handler] of this._routes.entries())
		{
			console.log("🔍 Test route pattern:", routePattern, "vs path:", path);
			const match = this.matchRoute(routePattern, path);
			if (match) {
				console.log("✅ Match trouvé!", match);
				await handler(match.params);
				return;
			}
		}
		// Route non trouvée
		console.error("404 - page non trouvée pour:", path);
	}


	matchRoute(routePattern: string, currentPath: string)
	{
		console.log("🔧 matchRoute appelé avec pattern:", routePattern, "path:", currentPath);
		const patternParts = routePattern.split("/").filter(Boolean); // Route avec :id
		const pathParts = currentPath.split("/").filter(Boolean);     // URL réelle

		console.log("📝 Pattern parts:", patternParts);
		console.log("📝 Path parts:", pathParts);

		// Si les premières parties ne correspondent pas ou si la longueur est différente
		if (patternParts.length !== pathParts.length) {
			console.log("❌ Longueurs différentes");
			return null;
		}

		//on crée les params qu'on va ajouter pour le nouvel URL
		const params: { [key: string]: string } = {};
		for (let i = 0; i < patternParts.length; i++)
		{
			if (patternParts[i].startsWith(":"))
			{
				const key = patternParts[i].substring(1);
				params[key] = pathParts[i];
				console.log(`✅ Param extrait: ${key} = ${pathParts[i]}`);
			}
			else if (patternParts[i] !== pathParts[i]) {
				console.log(`❌ Partie fixe ne correspond pas: ${patternParts[i]} !== ${pathParts[i]}`);
				return null;
			}
		}
		console.log("✅ Params finaux:", params);
		return {params}
	}

}
