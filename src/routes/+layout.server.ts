import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

if (building) {
    console.log('PWD: ', env.PWD);
    console.log('LD_LIBRARY_PATH: ', env.LD_LIBRARY_PATH);
    // For building on vercel: https://github.com/Automattic/node-canvas/issues/1779
    if (
    env.LD_LIBRARY_PATH == null ||
    !env.LD_LIBRARY_PATH.includes(
        `${env.PWD}/node_modules/canvas/build/Release:`,
    )
    ) {
    env.LD_LIBRARY_PATH = `${
        env.PWD
    }/node_modules/canvas/build/Release:${env.LD_LIBRARY_PATH || ''}`;
    }
}