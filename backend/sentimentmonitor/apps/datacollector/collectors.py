import tweepy
import requests
import nltk
import ciso8601
import time
import abc
from threading import Lock
import os

from typing import List
from datetime import datetime
from ..enums.definitions import platform_map

twitter_consumer_key = os.environ.get('TWITTER_CONSUMER_KEY', '')
twitter_consumer_secret = os.environ.get('TWITTER_CONSUMER_SECRET', '')
twitter_access_token = os.environ.get('TWITTER_ACCESS_TOKEN', '')
twitter_access_token_secret = os.environ.get('TWITTER_ACCESS_TOKEN_SECRET', '')
yelp_api_key = os.environ.get('YELP_API_KEY', '')
news_api_key = os.environ.get('NEWS_API_KEY', '')

#TODO: Handle exceptions raised in the middle of search
global_lock = Lock()
class Collector(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def search(self, query, query_loc) -> List[str]:
        pass

class TwitterSearch(Collector):
    def search(self, query, query_loc):
        auth = tweepy.OAuthHandler(twitter_consumer_key, twitter_consumer_secret)
        auth.set_access_token(twitter_access_token, twitter_access_token_secret)

        api = tweepy.API(auth, wait_on_rate_limit=True)
        results = tweepy.Cursor(api.search, q=query, count=1, result_type='recent', lang="en", show_user=True, wait_on_rate_limit = True)
        
        tweets = []

        for item in results.items():
            json_data = item._json
            dt = datetime.strptime(json_data["created_at"], '%a %b %d %H:%M:%S %z %Y')
            if not json_data["text"].startswith('RT '):
                tweets.append((json_data["text"], dt))
            # ts = dt.timestamp()
            user_data = json_data["user"]
            # TODO: resolve location_id
            url = "https://twitter.com/{screen_name}/status/{id}".format(screen_name=user_data["screen_name"],
                                                                         id=json_data["id"])
            # data_instance = Data.objects.create(id=uuid.uuid4(), timestamp=ts, location_id=-1,
            #                                     original_query=query, text=json_data["text"],
            #                                     verified_user=user_data["verified"],
            #                                     og_link=url, source='TW')
            # global_lock.acquire()
            # data_instance.save()
            # global_lock.release()
        return tweets

class YelpSearch(Collector):
    def search(self, query, query_loc):
        headers = {'Authorization': 'Bearer %s' % yelp_api_key}
        url = 'https://api.yelp.com/v3/businesses/search'

        if len(query_loc) == 0: query_loc = 'San Francisco'
        params = {'term': query, 'location': query_loc}
        res = requests.get(url, params=params, headers=headers)

        business_ids = []
        reviews = []
        if (res.status_code == 200):
            json_data = res.json()
            business_lst = json_data["businesses"]
            for business in business_lst:
                name = business["name"]
                diff = nltk.edit_distance(name.lower(), query.lower()) / len(name)
                if (diff <= 0.2):
                    business_ids.append(business["id"])
            for id in business_ids:
                response = requests.get('https://api.yelp.com/v3/businesses/' + id + '/reviews', headers=headers)
                review_json = response.json()
                if 'reviews' not in review_json:
                    continue
                review_lst = review_json["reviews"]
                for review in review_lst:
                    parsedate = ciso8601.parse_datetime(review["time_created"])
                    ts = time.mktime((parsedate.timetuple()))
                    # data_instance = Data.objects.create(id=uuid.uuid4(), timestamp=ts, location_id=-1,
                    #                                     original_query=query + ", " + query_loc, text=review["text"],
                    #                                     verified_user=False, og_link=review["url"], source='YP')
                    # global_lock.acquire()
                    # data_instance.save()  # save to db
                    # global_lock.release()
                    dt = datetime.fromtimestamp(ts)
                    reviews.append((review["text"], dt))
        return reviews

class NewsSearch(Collector):
    def search(self, query, query_loc):
        url = 'http://newsapi.org/v2/everything'

        params = {'q': query, 'apiKey': news_api_key, 'sortBy':'relevancy', 'pageSize': 40}
        res = requests.get(url, params=params)

        news_descs = []
        if (res.status_code == 200):
            json_data = res.json()
            news_lst = json_data["articles"]
            for news in news_lst[0:40]:
                dt = datetime.strptime(news["publishedAt"], '%Y-%m-%dT%H:%M:%SZ')
                news_descs.append((news["title"], dt))
                # ts = dt.timestamp()
                
                # data_instance = Data.objects.create(id=uuid.uuid4(), timestamp=ts, location_id=-1,
                #                                     original_query=query, text=json_data["text"],
                #                                     verified_user=user_data["verified"],
                #                                     og_link=url, source='TW')
                # global_lock.acquire()
                # data_instance.save()
                # global_lock.release()
        return news_descs


collector_map = {
    platform_map['Yelp']: YelpSearch(),
    platform_map['Twitter']: TwitterSearch(),
    platform_map['News']: NewsSearch()
}