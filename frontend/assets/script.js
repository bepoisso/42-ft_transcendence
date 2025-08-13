const global_speed = 2.5;
const global_stars = 25;


const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

const center = () => ({ x: canvas.width / 2, y: canvas.height / 2 });

function randomBetween(a, b) {
	return Math.random() * (b - a) + a;
}

function createStar() {
	const angle = randomBetween(0, 2 * Math.PI);
	const radius = randomBetween(canvas.width / 2, canvas.width);
	const type = Math.random() < 0.5 ? 'circle' : 'bar';
	const size = randomBetween(5, 6);
	const speed = randomBetween(global_speed, global_speed + 2.5);
	const dx = Math.cos(angle);
	const dy = Math.sin(angle);
	return {
		x: center().x + dx * radius,
		y: center().y + dy * radius,
		angle,
		speed,
		dx,
		dy,
		type,
		size,
		length: size * 12,
		rotation: randomBetween(0, 2 * Math.PI),
		delay: randomBetween(0, 10000),
		startTime: Date.now()
	};
}

const stars = Array.from({ length: global_stars }, createStar);

function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (const star of stars) {
		const currentTime = Date.now();
		const elapsed = currentTime - star.startTime;

		if (elapsed > star.delay) {
			star.x -= star.dx * star.speed;
			star.y -= star.dy * star.speed;

			const distanceFromCenter = Math.sqrt(
				Math.pow(star.x - center().x, 2) + Math.pow(star.y - center().y, 2)
			);

			if (distanceFromCenter < 10) {
				const angle = randomBetween(0, 2 * Math.PI);
				const minRadius = canvas.width * 0.6;
				const maxRadius = canvas.width;
				const radius = randomBetween(minRadius, maxRadius);
				const dx = Math.cos(angle);
				const dy = Math.sin(angle);
				star.x = center().x + dx * radius;
				star.y = center().y + dy * radius;
				star.angle = angle;
				star.dx = dx;
				star.dy = dy;
				star.rotation = randomBetween(0, 2 * Math.PI);
				star.delay = randomBetween(0, 4000);
				star.startTime = currentTime;
			}
		}

		ctx.save();
		ctx.translate(star.x, star.y);

		if (star.type === 'circle') {
			ctx.beginPath();
			ctx.arc(0, 0, star.size, 0, 2 * Math.PI);
			ctx.fillStyle = '#fff';
			ctx.globalAlpha = 0.8;
			ctx.fill();
		} else {
			ctx.rotate(star.rotation);
			ctx.fillStyle = '#fff';
			ctx.globalAlpha = 0.7;
			ctx.fillRect(-star.length / 2, -star.size / 2, star.length, star.size);
		}
		ctx.restore();
	}
	requestAnimationFrame(animate);
}

animate();
