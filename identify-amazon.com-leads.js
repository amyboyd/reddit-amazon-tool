const amazon = require('amazon-product-api');
const config = require('./config');
const Comment = require('./models/Comment');
const Lead = require('./models/Lead');

const amazonClient = amazon.createClient({
    awsId: config.awsId,
    awsSecret: config.awsSecret,
    awsTag: config.awsTag,
});

Comment.find({
        'leadIdentifyingProcessors.amazonDotCom': {$ne: true},
        body: /https?:\/\/(www\.)?amazon\.com/i,
    })
    // The limit of 3 is to avoid hitting Amazon's request throtting.
    .limit(3)
    .then(function(comments) {
        const promises = comments.map(comment => {
            const lead = new Lead({
                redditCommentId: comment._id,
            });

            return getAsins(comment.body).then(asins => {
                lead.asins = asins;
                return getProducts(asins);
            }).then(products => {
                lead.amazonProducts = products;
                return suggestLeadToHuman(lead);
            }).then(() => {
                return markCommentAsProcessedSuccessfully(comment);
            }).catch(function(err) {
                console.error('Error with comment', comment._id, err, JSON.stringify(err));
                flagCommentForHumanReview(comment);
            });
        });

        Promise.all(promises).then(function() {
            console.log('All done');
            process.exit(0);
        })
    });

const ASIN_REGEX = /(\/dp?\/[A-Z0-9]{10}|\/product\/[A-Z0-9]{10})/g;

function getAsins(commentText) {
    // ASINs may be in URLs that look like these:
    // https://www.amazon.com/dp/B0182W5Z4I/ref=cm_sw_r_other_awd_sWK0wbRB8YBJ5
    // http://www.amazon.com/dp/1449387861
    // http://www.amazon.com/Wilton-White-Ready-Decorator-4-5lbs/dp/B000WY96Q8#immersive-view_1456622038064
    // http://www.amazon.com/Rada-Cutlery-S38-Starter-Knife/dp/B000FZ223I
    // http://www.amazon.com/gp/aw/d/B011VS32KE/ref=cm_cr_mpr_bdcrb_top?ie=UTF8
    // http://www.amazon.com/gp/product/B008ANJEWO?keywords=intel%20desktop%20board%20dz68bc&amp;qid=1444567346&amp;ref_=sr_1_2&amp;sr=8-2

    const asinRegexMatches = commentText.match(ASIN_REGEX);
    if (asinRegexMatches === null) {
        return Promise.reject('No ASINs found in comment: ' + commentText)
    }

    const asins = asinRegexMatches.map(function(match) {
        return match.substr(-10);
    });

    return Promise.resolve(asins);
}

function getProducts(asins) {
    const promises = asins.map(asin => {
        return amazonClient.itemLookup({
            idType: 'ASIN',
            itemId: asin,
            responseGroup: 'ItemAttributes,OfferSummary',
        }).then(function(results) {
            const asin = results[0].ASIN[0];
            const title = results[0].ItemAttributes[0].Title[0];
            console.log('Retrieved item from Amazon:', asin, ':', title);

            const price = (results[0].OfferSummary[0].LowestNewPrice ? results[0].OfferSummary[0].LowestNewPrice[0] :
                (results[0].OfferSummary[0].LowestUsedPrice ? results[0].OfferSummary[0].LowestUsedPrice[0] :
                null));

            return {
                asin: asin,
                link: decodeURIComponent(results[0].DetailPageURL[0]),
                title: title,
                price: price ? price.Amount[0] : null,
                currency: price ? price.CurrencyCode[0] : null,
                formattedPrice: price ? price.FormattedPrice[0] : null,
                json: JSON.stringify(results),
            };
        });
    });

    return Promise.all(promises)
}

function suggestLeadToHuman(lead) {
    return lead.save().then(function() {
        console.log('Suggested lead to human', lead._id);
    })
}

function markCommentAsProcessedSuccessfully(comment) {
    if (!comment.leadIdentifyingProcessors) {
        comment.leadIdentifyingProcessors = {};
    }

    comment.leadIdentifyingProcessors.amazonDotCom = true;

    return comment.save().then(function() {
        console.log('Successfully processed comment', comment._id);
    });
}

function flagCommentForHumanReview(comment) {
    comment.flaggedForHumanReview = true;

    if (!comment.leadIdentifyingProcessors) {
        comment.leadIdentifyingProcessors = {};
    }

    comment.leadIdentifyingProcessors.amazonDotCom = true;

    return comment.save().then(function() {
        console.log('Flagged for human review', comment._id);
    });
}
