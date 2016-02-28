'use strict';

const Comment = require('./models/Comment');
const Lead = require('./models/Lead');

Lead.findOne({hasMessageBeenSent: {$ne: true}}).then(function(lead) {
     return Comment.findOne({_id: lead.redditCommentId}).then(function(comment) {
        const to = comment.author;
        const subject = `Hey. Your post in /r/${comment.subreddit}...`;

        let message = `Hi ${comment.author}\n\nI noticied you made a comment in /r/${comment.subreddit} recently linking to `;

        if (lead.amazonProducts.length > 1) {
            message += `${lead.amazonProducts.length} products`;
        } else {
            message += `${lead.amazonProducts[0].title}`;
        }

        message += ` on Amazon.com.\n\nI'm a robot here to help redditors make some extra money through the Amazon Affiliate Program. How it works is, (1) I send you a link, (2) you edit your comment to replace the original link with the new link, (3) every time an Amazon customer buys what you linked to, you will get 2% of that in Amazon gift cards. That is 2% for every purchase a customer makes after clicking the link, even if they click it a year from now! (You need to make a total of $15 first before we can pay out in gift cards.)`;

        message += `\n\nIf you want to take part, just edit your comment and replace your link with the link I've put below:`;

        for (let i = 0; i < lead.amazonProducts.length; i++) {
            const product = lead.amazonProducts[i];
            message += `\n\n${product.title}: ${product.link}`;
            if (product.price > 50000) {
                message += `\n(2% of the current price (${product.formattedPrice}) is $${product.price / 50 / 100}.)`;
            }
        }

        message += `\n\nI hope you take part, because if you do, we both make some money. :)`;

        console.log(JSON.stringify({subject, message, to}));

        lead.hasMessageBeenSent = true;
        lead.save().then(() => process.exit(0));
    });
});
