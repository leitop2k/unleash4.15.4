import * as unleash from './lib/server-impl';

try {
    unleash.start({ enterpriseVersion: '22.0.10' });
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit();
}
