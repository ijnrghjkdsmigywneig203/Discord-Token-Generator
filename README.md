# Discord-Token-Generator
Requests based token generator for discord with a hcaptcha bypass.


It kinda works ig just use hq proxies..


## FEATURES:
- Run up to 100 Threads at once
- Proxy support [ Https | All proxy combinations ]
- AI Solver / Bypass
- 4 SMS PROVIDERS
- Kopeechka for mails ;-;

### Important! 
The hcaptcha bypass may be fucked, but you can still use capmonster.cloud as its a option in the gen. It works as the gen is a fully verified gen and not a email based gen.


Guide:
```
Installation:
    Install Node.js from https://nodejs.org/en/
    Open a command prompt in this folder
    Run 'npm install' to install all required dependencies

Running The Program:
    Run 'npm run start' to start the program
    Follow the instructions in the console to create a config.json file

Recommended:
    Use sticky proxies (~5min long sessions, must be http)
    Use multiple sms provider accounts
    Don't run more than 100 threads at a time (the program shouldn't have an issue with that, but the sms/email providers might)
    Run on a windows pc or vps (others have not been tested and may not work)

Common Errors:
    "proxy error" - your proxies are either in the wrong format or are taking too long to respond
    "... - you need to verify your account in order to perform this action" - discord banned the account (they didn't like the proxy/phone number)
    "not enough rating" - the sms provider got too many phone number cancellations, use a different provider, a different account, or wait a few hours
    "could not solve captcha" - pretty self-explanatory (although if this happens too much it might mean the method is patched)
    "... - please use a valid phone number, not a voip or landline number" - choose a different sms verification country
    "sms verification time limit ran out" - this is sometimes unavoidable, but if it happens too much it probably means discord is detecting the captcha being solved by a bot

Service Provider Options:
    email:
        https://kopeechka.store/ - the standard option, should be used almost always
        https://mail.tm/en/ - free, most of the time detected by discord, but they sometimes have undetected domains
    phone:
        https://5sim.net/ - recommended
        https://sms-activate.org/en/
        -------------------------------------------------
        (officially unsupported, if you're having issues with these, try using the other providers)
        http://smspva.com/
        https://activation.pw/
```
