export class Algo {
	y_algo: number;
	x_ball: number;
	y_ball: number;
	old_x_ball: number;
	old_y_ball: number;
	y_target: number;
	paddle_height: number;
	canevas_height: number;
	canevas_width: number;
	turn: string; // "IA" or "PLAYER"
	score: number; // sum of 2 scores
	lose_round: boolean;
	lose_clock: Clock;
	waiting_clock: Clock;
	difficulty: string; // "HARD", "NORMAL", "EASY"

	constructor(half_canvas_height: number, half_canvas_width: number, paddle_height: number, canevas_height: number) {
		this.y_algo = half_canvas_height;
		this.x_ball = half_canvas_width;
		this.y_ball = half_canvas_height;
		this.paddle_height = paddle_height;
		this.y_target = half_canvas_height;
		this.old_x_ball = half_canvas_width;
		this.old_y_ball = half_canvas_height;
		this.canevas_height = canevas_height;
		this.canevas_width = half_canvas_width * 2;
		this.turn = "";
		this.score = 0;
		this.lose_round = false;
		this.lose_clock = new Clock();
		this.waiting_clock = new Clock();
		this.difficulty = "HARD";
	}

	public makeDecision(): string {
		console.log(this.turn);
		const tolerance = this.paddle_height / 4;
		const paddleCenter = this.y_algo + this.paddle_height / 2;

		const upper_waiting_zone = ((this.canevas_height / 2) / 3) * 2;
		const lower_waiting_zone = this.canevas_height / 2 + ((this.canevas_height / 2) / 3) * 1;
		// check right canvas limit
		if (this.x_ball > this.canevas_width * 4/5)
			this.waiting_clock.resetClock();

		// if PLAYER TURN go to upper or lower waiting zone depending on IA pos (after 1s delay), if IA in middle dont move
		if (this.turn == "PLAYER" && this.waiting_clock.isTimeElapsed(1000) && Math.abs((this.canevas_height / 2) - paddleCenter) >= tolerance) {
			// upper zone
			if (paddleCenter < this.canevas_height / 2) {
				// if IA good pos ~ tolerance do nothing
				if (Math.abs(upper_waiting_zone - paddleCenter) <= tolerance)
					return "";
				// make decision and update IA pos to prevent decay
				if (paddleCenter < upper_waiting_zone) {
					// 8 = speed set in paddle constructor
					this.y_algo = Math.min(this.canevas_height - this.paddle_height, this.y_algo + 8);
					return "DOWN";
				} else {
					// 8 = speed set in paddle constructor
					this.y_algo = Math.max(0, this.y_algo - 8);
					return "UP";
				}
			}
			// lower zone
			else {
				// if IA good pos ~ tolerance do nothing
				if (Math.abs(lower_waiting_zone - paddleCenter) <= tolerance)
					return "";
				// make decision and update IA pos to prevent decay
				if (paddleCenter < lower_waiting_zone) {
					// 8 = speed set in paddle constructor
					this.y_algo = Math.min(this.canevas_height - this.paddle_height, this.y_algo + 8);
					return "DOWN";
				} else {
					// 8 = speed set in paddle constructor
					this.y_algo = Math.max(0, this.y_algo - 8);
					return "UP";
				}
			}
		} else if (this.turn == "PLAYER" || this.turn == "")
			return "";

		// if IA pos is already good ~ tolerance do nothing
		if (Math.abs(this.y_target - paddleCenter) <= tolerance)
			return "";

		// go to target
		if (this.y_target < paddleCenter) {
			this.y_algo = Math.max(0, this.y_algo - 8);
			return "UP";
		} else {
			Math.min(this.canevas_height - this.paddle_height, this.y_algo + 8);
			this.y_algo = Math.min(this.canevas_height - this.paddle_height, this.y_algo + 8);
			return "DOWN";
		}
	}

	public newTarget(x_ball: number, y_ball: number, y_algo: number, score: number): void {
		this.old_x_ball = this.x_ball
		this.old_y_ball = this.y_ball
		this.x_ball = x_ball;
		this.y_ball = y_ball;
		this.y_algo = y_algo;

		// if new round, determines if the actual round will be lost by the IA and start a new clock for waiting X seconds to loose (5s normally)
		if (this.score != score) {
			this.score = score;
			this.lose_round = this.randomizeRound(this.difficulty);
			this.lose_clock = new Clock();
		}

		// if IA turn (ball go towards IA) calculate new impact height with vector tilt formulae (for x=0 equation resolution : high scool level)
		if (this.x_ball > this.old_x_ball) {
			this.turn = "IA";
			const vector_tilt: number = (this.y_ball - this.old_y_ball) / (this.x_ball - this.old_x_ball);
			this.y_target = ((vector_tilt * this.canevas_width) - (vector_tilt * this.old_x_ball)) + this.old_y_ball;

			// if IA must loose this round and 5s elapsed then add paddle height to predict impact height to confuse IA
			if (this.lose_round == true && this.lose_clock.isTimeElapsed(5000)) {
				this.y_target = this.y_ball > this.canevas_height / 2 ? this.y_target - this.paddle_height : this.y_target + this.paddle_height;
			}

			// limit impact predict point in canvas limits
			this.y_target = Math.max(0, Math.min(this.y_target, this.canevas_height));
		} else {
			this.turn = "PLAYER";
		}
	}

	public getTurn(): string {
		return this.turn;
	}

	public getPredict(): string {
		return this.y_target.toString();
	}

	private randomizeRound(difficulty: string): boolean {
		const n: number = Math.floor(Math.random() * (11 - 2)) + 1;
		if (difficulty == "EASY" && n <= 5)
			return true;
		else if (difficulty == "NORMAL" && n <= 3)
			return true;
		else if (difficulty == "HARD" && n <= 1)
			return true;
		return false;
	}
}

export class Clock {
	startTime: Date;

	constructor() {
		this.startTime = new Date();
	}

	public isTimeElapsed(time: number): boolean {
		const currentTime: Date = new Date();
		const elapsedTime: number = currentTime.getTime() - this.startTime.getTime();
		return (elapsedTime >= time) ? true : false;
	}

	public resetClock(): void {
		this.startTime = new Date();
	}
}
