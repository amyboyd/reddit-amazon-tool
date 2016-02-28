import time
import praw
import sys
import json

config = json.load(open('config.json'))

r = praw.Reddit('uk.co.amyboyd.findcheaperstuff by /u/estrocide')
r.login(config['messagerRedditUsername'], config['messagerRedditPassword'])

input = json.load(sys.stdin)
print input

r.send_message(input['to'], input['subject'], input['message'])
