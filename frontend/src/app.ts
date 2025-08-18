/* ici on crée l'application principale.
Celle ci va créer une classe router qu'elle conservera comme attribut.
Elle va aussi contenir les methodes qui appelleront chaque page
L'app, par ses methodes, distribue les pages
Router appelle les methodes de app en fonction du path*/

import { Router } from "./router";
import { renderHome } from "./view/home";
import { loginHandler, renderLogin } from "./view/login";
import { registerHandler, renderRegister } from "./view/register";
import { dashboardHandler, renderDashboard, setDashboard} from "./view/dashboard/dashboard";
import { renderGame, gameLoop } from "./view/game/game";
import { logic2fa, render2fa } from "./view/2fa";
import { renderMyProfile, setMyProfile } from "./view/myProfile";
import { renderVisitProfile, visitProfileHandler } from "./view/visitProfile";


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
				loginHandler(self.router)
			},
			"/register": () => {
				renderRegister();
				registerHandler(self.router)
			},
			"/2fa": () => {
			render2fa();
			logic2fa(self.router);
			},
			"/dashboard": () => {
				renderDashboard();
				setDashboard();
				dashboardHandler(self.router);
			},
			"/myProfile": () => {
				renderMyProfile();
				setMyProfile();
			},
			"/visitProfile/:id": (params: any) => {
				renderVisitProfile();
				visitProfileHandler(params.id);
			},
			"/game/:id": (params: any) => {
				renderGame();
				gameLoop(self.router, params.id)
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
				this.router.navigate(href);
			}
		});
		this.router.checkRoute(); // ?
	}

}
