const db = require('./DB');

const Comment = db.model('Comment', {
    _id: String,
    body: String,
    bodyAsHtml: String,
    subreddit: String,
    author: String,
    isNsfw: Boolean,
    link: String,
    createdAt: Date,
    leadIdentifyingProcessors: Object,
    flaggedForHumanReview: { type: Boolean, default: false },
});

module.exports = Comment;
