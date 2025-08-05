import { App } from "./app"

export class Router {

	private routes : Map<string, () => void>;
	private isAuthentified : () => boolean;

	constructor(
		routes: { [path: string]: () => void},
		isAuthentified: () => boolean
	) {
		this.routes = new Map(Object.entries(routes));
		this.isAuthentified = isAuthentified;

		// Pour gerer les retours en arriere
		window.addEventListener("popstate", () => {
			this.checkRoute();
		});
	}


	checkRoute() {
		const path = window.location.pathname;
		const FuncFromPath = this.routes.get(path); // recupere la méthode associée à ce path

		if (FuncFromPath /* && isAuthentified true */)
			FuncFromPath();
		else {
		// error page 404
		}
	}

}
