db.comments.update({}, {$unset: {flaggedForHumanReview: 1, leadIdentifyingProcessors: 1}}, {multi: 1})
db.leads.remove({}, {multi: 1});
