import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

const appId = process.env.PUSHER_APP_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
const secret = process.env.PUSHER_APP_SECRET;

// if (!appId || !key || !secret) {
//     throw new Error('Missing Pusher environment variables', {
//         cause: { appId, key, secret },
//     });
// }

export const pusherServer = new PusherServer({
    appId : appId as string,
    key : key as string,
    secret : secret as string,
    cluster: 'us3',
    useTLS: true,
});

export const pusherClient = new PusherClient(key as string, {
    cluster: 'us3',
});