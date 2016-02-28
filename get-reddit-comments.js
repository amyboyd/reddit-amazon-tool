const RedditStream = require('reddit-stream');
const config = require('./config');
const Comment = require('./models/Comment');

const commentStream = new RedditStream('comments', 'all', config.redditAppId);
commentStream.start();
commentStream.on('new', function(comments) {
    const now = new Date();
    console.log(now, 'found', comments.length, 'comment(s)');
    saveCommentsToMongo(comments);
});

function saveCommentsToMongo(comments) {
    comments.forEach(comment => saveCommentToMongo(comment));
}

function saveCommentToMongo(comment) {
    const date = new Date(comment.data.created_utc * 1000);

    (new Comment({
        _id: comment.data.id,
        body: comment.data.body,
        bodyAsHtml: comment.data.body_html,
        subreddit: comment.data.subreddit,
        author: comment.data.author,
        isNsfw: comment.data.over_18,
        link: comment.data.link_url,
        createdAt: date,
    })).save();
}

