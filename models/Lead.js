const db = require('./DB');

const Lead = db.model('Lead', {
    redditCommentId: String,
    asins: [String],
    amazonProducts: Object,
    leadGeneratedAt: { type: Date, default: Date.now },
});

Lead.prototype.getOriginalPosterReward = function getOriginalPosterReward() {
    return this.amazonProducts.reduce(function(accumulator, product) {
        return accumulator + product.price / 50; // 2% of the total price.
    }, 0);
};

module.exports = Lead;
