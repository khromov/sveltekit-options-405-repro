import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

const cors: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
    
	// Allow /api CORS requests from localhost domain used by Capacitor
	if (event.url.pathname.startsWith('/api') && event.request.headers.get('origin')) {
		let originDomain: string | null = null;

		try {
			originDomain = new URL(event.request.headers.get('origin') || '').hostname;
		} catch (e) {
			console.log('Invalid origin', e);
		}

		if (event.request.method === 'OPTIONS' && originDomain === 'localhost') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*'
				}
			});
		}

		if (originDomain === 'localhost') {
			response.headers.set('Access-Control-Allow-Origin', '*');
		}
	}

	return response;
};

const logger: Handle = async ({ event, resolve }) => {
	const requestStartTime = Date.now();
	const response = await resolve(event);

	const date = new Date(requestStartTime);
	const wlz = (num: number) => (num < 10 ? `0${num}` : num);

	console.log(
		`${wlz(date.getHours())}:${wlz(date.getMinutes())}:${wlz(date.getSeconds())}`,
		event.request.method,
		event.url.pathname,
		`- 🐇 ${Date.now() - requestStartTime} ms`,
		`${response.status === 200 ? '✅' : '❌'} ${response.status}`
	);
	return response;
};

export const handle: Handle = sequence(cors, logger);
