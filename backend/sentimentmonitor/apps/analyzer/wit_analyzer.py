from wit import Wit
import preprocessor as p
from nltk.tokenize import sent_tokenize
import os

ACCESS_TOKEN = os.environ.get('WIT_ACCESS_TOKEN', '')
client = Wit(access_token=ACCESS_TOKEN)

# threshold for if we trust wit sentiment analysis or not
WIT_THRESHOLD = 0.1


def clean_text(raw_text):
    # strips links (keeps hashtags and emojis because VADER supports that)
    p.set_options(p.OPT.URL)
    return p.clean(raw_text)


def run_wit(raw_text):
    # clean data
    message_text = clean_text(raw_text)
    # tokenize by sentence
    token_text = sent_tokenize(message_text)

    num_pos = 0
    num_neg = 0
    num_neu = 0
    total_conf = 0

    scores = {}
    scores['neg'] = 0
    scores['neu'] = 0
    scores['pos'] = 0
    scores['compound'] = 0
    # scores['compound'] = 0.9
    for s in token_text:
        sentiment, confidence = wit_analysis(s)
        if sentiment == "neutral":
            scores['neu'] += 1*confidence
            num_neu += 1
        elif sentiment == "positive":
            scores['pos'] += 1*confidence
            num_pos += 1
        elif sentiment == "negative":
            scores['neg'] += 1*confidence
            num_neg += 1
        total_conf += confidence

    num_sent = len(token_text)
    confidence = total_conf/max(num_sent, 1)
    scores['neu'] = round(scores['neu']/max(num_neu, 1), 3)
    scores['pos'] = round(scores['pos']/max(num_pos, 1), 3)
    scores['neg'] = round(scores['neg']/max(num_neg, 1), 3)

    scores['compound'] = round(
        (scores['pos'] - scores['neg'])*((num_pos+num_neg)/max(num_sent,1)), 3)

    return scores, confidence

# wit analysis does sentiment analysis on a sentence of phrase


def wit_analysis(sentence):
    resp = client.message(sentence)
    # intent = None
    # entity = None
    # value = None
    # trait = None
    # scores = {}

    # try:
    #     entity = list(resp['entities'])[0]
    #     entity_value = resp['entities'][entity][0]['value']
    #     sentiment = resp['traits']['wit$sentiment'][0]['value']
    #     sentiment_conf = resp['traits']['wit$sentiment'][0]['confidence']
    # except:
    #     pass

    sentiment = "neutral"
    confidence = 0

    try:
        sentiment = resp['traits']['wit$sentiment'][0]['value']
        confidence = resp['traits']['wit$sentiment'][0]['confidence']
    except:
        pass

    return sentiment, confidence
