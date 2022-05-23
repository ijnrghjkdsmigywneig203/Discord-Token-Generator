import Captcha from './index';

const proxies = [
    'Wheatley:Fmn3jDgd8Pmug_region-europe_session-zgyvl1g9_lifetime-5m@proxy.iproyal.com:12323',
];
const captcha = new Captcha('bypass', proxies[0]);
await captcha.startSolving('https://discord.com/verify', 'f5561ba9-8f1e-40ca-9b5b-a0b3f719ef34');
console.log(await captcha.waitForResponse());
process.exit();
