import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import rug from 'random-username-generator';
import rpg from 'secure-random-password';
import fs from 'fs';
import gplay from 'google-play-scraper';

import Discord from './discord';
import Phone from './phone';
import Captcha from './captcha';
import Email from './email';
import http from './utils/request';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const parseError = (e) => {
    let message;
    if (e?.response?.json?.message) {
        if (e.response.json.message.includes('Unauthorized')) message = 'account is banned';
        else {
            let info;
            const { errors } = e.response.json;
            if (errors) info = Object.values(errors).flatMap((x) => (x._errors ? x._errors.flatMap((y) => y.message || []) : [])).join(', ');
            message = `${e.response.json.message}${info ? ` - ${info}` : ''}`;
        }
        message = `${e.message.split('-')[0]}- ${message}`;
    } else {
        message = e?.message;
    }
    return message;
};

const { version: rawDiscordVersion } = await gplay.app({ appId: 'com.discord' });
const discordVersion = parseInt(rawDiscordVersion.split(' - ')[0].split('.').map((x) => x.padStart(3, '0')).join(''), 10);

    log(`email verification link: ${verificationLink}`);
    const emailToken = await discord.getEmailToken(verificationLink);
    log(`email verification token: ${emailToken}`);
    let { success: emailSuccess, sitekey: emailSitekey, token } = await discord.verifyEmail(emailToken);
    if (!emailSuccess) {
        log(`waiting for captcha ${await captcha.startSolving('https://discord.com/verify', emailSitekey)}`);
        const captchaKey = await captcha.waitForResponse();
        token = await discord.verifyEmailWithCaptcha(emailToken, captchaKey);
    }
    log(`generated token: ${token}`);

    const oldBackup = fs.readFileSync('results/backup.txt', 'utf-8');
    fs.writeFileSync('results/backup.txt', oldBackup.replace(`${number}:${username}:${password}:${oldToken}\n`, ''));

    log(`account check: ${await discord.checkAccount()}`);
    return {
        email: emailAddress, number, username, password, token,
    };
};

export default ({
    email, phone, captcha, threads: threadsNum, proxies, debug, proxyFormat,
}) => async (number, func) => {
    if (typeof proxies === 'string') {
        try {
            const file = fs.readFileSync(proxies, 'utf8');
            const unformatted = file.split('\n').map((line) => line.trim()).filter((line) => line);
            if (proxyFormat === 'user:pass@host:port') proxies = unformatted;
            else if (proxyFormat === 'host:port') proxies = unformatted;
            else if (proxyFormat === 'host:port:user:pass') {
                proxies = unformatted.map((proxy) => {
                    const [host, port, user, pass] = proxy.split(':');
                    return `${user}:${pass}@${host}:${port}`;
                });
            }
        } catch (e) {
            throw new Error('failed to open proxy file, does the file exist?');
        }
    }
    console.log(gradient.pastel.multiline(figlet.textSync(' WHEATLEY', { font: '3D-ASCII' })));
    const tokenIndexes = Array(number).fill().map((_, i) => i + 1);
    const results = {
        success: 0,
        fail: 0,
        errors: [],
    };
    const thread = async () => {
        while (tokenIndexes.length > 0) {
            const tokenIndex = tokenIndexes.shift();
            const time = () => chalk.gray('[') + chalk.hex('92ACE5')((new Date()).toLocaleTimeString()) + chalk.gray(']');
            const prefix = chalk.gray('[') + chalk.hex('92ACE5')(`${tokenIndex}`.padStart(`${number}`.length, '0')) + chalk.gray(']');
            try {
                const proxy = proxies[Math.floor(Math.random() * proxies.length)];
                if (proxy) {
                    const { body } = await http(`http://${proxy}`).get('https://ipv4.icanhazip.com/');
                    const ip = body.trim();
                    console.log(`${time()} ${prefix} checked proxy: ${ip}`);
                }
                const log = (...args) => {
                    if (debug) console.log(time(), prefix, ...args);
                };
                const randomEl = (arr) => arr[Math.floor(Math.random() * arr.length)];
                const services = {
                    email: [email[0], randomEl(email[1])],
                    phone: [phone[0], randomEl(phone[1])],
                    captcha: [captcha[0], randomEl(captcha[1])],
                };
                const {
                    email: emailAddress, number: phoneNumber, password, token,
                } = await func(log, services, proxy);
                results.success += 1;

                const save = (filename, result) => {
                    fs.appendFileSync(`results/${filename}`, `${result}\n`);
                    console.log(time(), prefix, chalk.hex('77DD66')('success!', result));
                };

                if (emailAddress) {
                    if (phoneNumber) save('fully-verified.txt', `${emailAddress}:${password}:${token}`);
                    else save('email-verified.txt', `${emailAddress}:${password}:${token}`);
                } else if (phoneNumber) save('phone-verified.txt', `${phoneNumber}:${password}:${token}`);
                else throw Error('invalid return value');
            } catch (e) {
                console.log(time(), prefix, chalk.hex('FF6961')('fail!', parseError(e)?.toLowerCase()));
                results.fail += 1;
                results.errors.push(parseError(e)?.toLowerCase());
            }
        }
    };
    const threads = Array(threadsNum).fill().map(() => thread());
    await Promise.all(threads);
    return results;
};
