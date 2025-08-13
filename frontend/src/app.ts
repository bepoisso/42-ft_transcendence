/* ici on crée l'application principale.
Celle ci va créer une classe router qu'elle conservera comme attribut.
Elle va aussi contenir les methodes qui appelleront chaque page
L'app, par ses methodes, distribue les pages
Router appelle les methodes de app en fonction du path*/

import { Router } from "./router";
import { renderHome } from "./view/home";
import { LoginSubmit, renderLogin } from "./view/login";
import { registerSubmit, renderRegister } from "./view/register";
import { renderDashboard} from "./view/dashboard";
import { renderGame, gameLoop } from "./game/game";


export class App
{
	private router : Router;
	// Un attribut d'authentification ?

	constructor() {
		const self = this;
		const routes = {
			"/" : renderHome,
			"/login": () => {
				renderLogin();
				LoginSubmit(self.router)
			},
			"/register": () => {
				renderRegister();
				registerSubmit(self.router)
			},
			"/dashboard": renderDashboard,
			"/game/:id": (params: any) => {
				renderGame(params.id);
				gameLoop(params.id)
			}
		};
		this.router = new Router(routes, this.isAuthentified.bind(this));
	}

	// Methode pour demander au backend si la personne est authentifiée
	isAuthentified() {return true}

	// Methode pour start l'app et trouver la premiere route
	start() {
		document.addEventListener("click", (ev) => {
			const target = ev.target as HTMLElement;

			if (target.matches("a[data-link]")) {
				ev.preventDefault(); // permet de pas recharger la page
				const href = target.getAttribute("href");
				history.pushState(null, "", href);
				this.router.checkRoute();
			}
		});
		this.router.checkRoute();
	}

}
