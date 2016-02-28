Configuration
=============

Copy `config.json.dist` to `config.json` and configure the app in that file.

Usage
=====

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
