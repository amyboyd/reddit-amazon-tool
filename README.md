Reddit comment / Amazon affiliate link tool
===========================================

What this does:

* Connects to a stream of every reddit comment, and saves every comment into a database.
* Searches reddit comments for Amazon.com links.
* Queries Amazon for information about the product each comment links to.
* Sends a private message to the commenter suggeseting they edit their comment and replace the link with a generated Amazon affiliate link, so we can both make money.

Requirements:

* An Amazon affiliate program account
* A reddit account with enough link karma (2) to send private messages without hitting the captcha.
* NodeJS >= 4.0
* A MongoDB database server
* Enough disk space to save about 800 MB of data per day
* A stable internet connection

**NOTE:** This was an experiment to play around with the Amazon and reddit APIs. **DO NOT USE THIS IN PRODUCTION - IT IS AGAINST BOTH SITE'S TERMS OF SERVICE!**

Configuration
-------------

Copy `config.json.dist` to `config.json` and configure the app in that file.

Usage
-------------

Run this constantly to save all reddit comments into the `comments` database collection:

```
node get-reddit-comments.js
```

Run this script every 5 minutes or so to generate leads from the reddit comments:

```
node identify-amazon.com-leads.js
```

Run this script every 5 minutes or so to actually send messages on reddit to the commenters.

```
node ./get-message-to-send-to-lead.js | python send-message.py
```
