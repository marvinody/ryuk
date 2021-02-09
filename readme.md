# Ryuk - Stock Tracker

Made because Bestbuy blocked my request to use their official API and this is the only other way to do it. Has sensibles limits (hits once every 5 seconds) so it doesn't get blocked by Bestbuy or other services

## How to use

- Clone the repo
- cd into folder & run `npm ci`
- Update the `skus.jsonc` file with the urls you want to track
- run `cp .env.sample .env` and fill out the values for Discord Webhook integration
- Run `npm run search` This will start a process that'll do the checking for you.
- The bot will go through each url:
  - look it up, post if new or updated
  - wait some random time before checking the same url (30s-2m)
  - it also hardwaits a minimum of 5s of calls between similar websites (IE: 2 bestbuy urls will not happen close together but will be delayed on purpose, but 1 walmart & 1 bestbuy can happen concurrently)

- The script will post to the webhook on first run and any time it's updated.

## Details

### Persistence

A dumb json db is used for now because I'm dumb and I don't want to write SQL wrappers

### Scraping

I spent a lot of my time hitting some dumb roadblocks because bestbuy seems to block arbitrarily on the server I was using. Apparently, the server I deployed this one would only work with cURL on http2. Not 1.1. Not axios. not node http2. Only cURL http2.

So I ended up rewriting the fetch portion to use lib-curl and force http2. And voila, it works!
After fetching the HTML with some hardcoded cookies (maybe can be more dynamic in future?), look for some check out selector and grab the text.

### Logging

By default, the script will put logs in a logs folder & output to stdin. If you want more information, you can set the `LOG_LEVEL=debug`

### Crashing

If the scripts hit uncaught exception or unhandled rejection or a SIGTERM command, it'll "flush" any data to the "db" (hopefully with no other errors) and close out. so you should be able to Ctrl+C the process without worrying about mangled data.


### PM2

PM2 is recommended so the bot can restart if it dies for some reason.

Something like `pm2 start npm --name "ryuk" -- run search`
