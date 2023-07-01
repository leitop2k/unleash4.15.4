import * as unleash from './lib/server-impl';

try {
    unleash.start({ enterpriseVersion: '4.15.4' });
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit();
}
