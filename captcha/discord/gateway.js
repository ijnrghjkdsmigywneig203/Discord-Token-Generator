import { WebSocket } from 'ws';
import zlib from 'zlib-sync';
import HttpsProxyAgent from 'https-proxy-agent';

const initializeGateway = (token, proxy) => new Promise((resolve) => {
    let heartbeat;
    let receivedAck = true;
    let sValue = null;
    let alreadyRestarted = false;
    const ws = new WebSocket('wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream', { agent: new HttpsProxyAgent(proxy), rejectUnauthorized: false });
    const inflate = new zlib.Inflate({
        chunkSize: 65535,
        flush: zlib.Z_SYNC_FLUSH,
    });
    const restart = (reason) => {
        if (!alreadyRestarted) {
            alreadyRestarted = true;
            if (heartbeat) clearInterval(heartbeat);
            if (ws.readyState === ws.OPEN) ws.close(1000);
            if (ws.readyState >= 2) setTimeout(() => initializeGateway(token, proxy), 5000);
        }
    };
    ws.on('close', (code, reason) => restart(reason.toString()));
    ws.on('message', (compressed) => {
        const l = compressed.length;
        const flush = l >= 4
            && compressed[l - 4] === 0x00
            && compressed[l - 3] === 0x00
            && compressed[l - 2] === 0xFF
            && compressed[l - 1] === 0xFF;
        inflate.push(compressed, flush && zlib.Z_SYNC_FLUSH);

        const message = JSON.parse(inflate.result.toString());
        const { op: code, d: data, t: eventName } = message;
        switch (code) {
        case 0: {
            sValue = message.s;
            if (eventName === 'READY') {
                resolve(data);
            }
            break;
        }
        case 1: {
            ws.send(JSON.stringify({ op: 1, d: sValue }));
            break;
        }
        case 7: {
            restart('server requested a reconnect');
            break;
        }
        case 9: {
            restart('session invalidated');
            break;
        }
        case 10: {
            heartbeat = setInterval(() => {
                if (!receivedAck) {
                    restart('server is not responding');
                } else {
                    ws.send(JSON.stringify({ op: 1, d: sValue }));
                    receivedAck = false;
                }
            }, data.heartbeat_interval);

            ws.send(JSON.stringify({
                op: 2,
                d: 
                "token": token,
                    "capabilities": 253,
                    "properties": {
                        "os": "Windows",
                        "browser": "Chrome",
                        "device": "",
                        "system_locale": "en-US",
                        "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.87 Safari/537.36",
                        "browser_version": "98.0.4758.87",
                        "os_version": "10",
                        "referrer": "",
                        "referring_domain": "",
                        "referrer_current": "",
                        "referring_domain_current": "",
                        "release_channel": "stable",
                        "client_build_number": 114764,
                        "client_event_source": ""
                    },
                    "presence": {
                        "status": "online",
                        "since": 0,
                        "activities": [],
                        "afk": False
                    },
                    "compress": False,
                    "client_state": {
                        "guild_hashes": {},
                        "highest_last_message_id": "0",
                        "read_state_version": 0,
                        "user_guild_settings_version": -1,
                        "user_settings_version": -1
                    }
                }
            break;
        }
        case 11: {
            receivedAck = true;
            break;
        }
        }
    });
});

export default initializeGateway;
