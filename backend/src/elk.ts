
export async function logToELK(level: string, message: string, data: any = {}): Promise<void> {
	const logData = {
		'@timestamp': new Date().toISOString(),
		level,
		message,
		service: 'backend',
		...data
	};

	try {
		await fetch('http://localhost:5001', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(logData)
		});
	} catch (error) {
		console.error('Failed to send log to ELK:', error);
		console.log(`[${level.toUpperCase()}]`, message, data);
	}
}
