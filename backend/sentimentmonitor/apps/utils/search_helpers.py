import requests
import os

autocomplete_api_key = os.environ.get('AUTOCOMPLETE_API_KEY', '')
class LocationGetter:
    def convert_loc(self, loc, session):
        url = 'https://maps.googleapis.com/maps/api/geocode/json'
        params = {'address':loc,'key':autocomplete_api_key, 'sessiontoken':session}
        res = requests.get(url, params=params)
        converted_loc = {}
        if(res.status_code == 200):
            json_data = res.json()
            converted_loc["lat"] = json_data["results"][0]["geometry"]["location"]["lat"]
            converted_loc["lng"] = json_data["results"][0]["geometry"]["location"]["lng"]
        return converted_loc

    def autocompletePlaces(self, query, session):
        url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?'
        params = {'input': query, 'types':"(regions)", 'key': autocomplete_api_key, 'sessiontoken':session}
        res = requests.get(url, params=params)
        suggestions = []
        if(res.status_code == 200):
            json_data = res.json()
            for place in json_data["predictions"]:
                suggestions.append(place["description"])
        return map(lambda x: {"type":{},"label":x}, suggestions)
        
    def autocompleteBusinesses(self, query, lat, lng, session):
        url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?'
        params = {'input': query, 'types':"establishment", 'key': autocomplete_api_key, 'location':str(lat)+","+str(lng), 'radius':15,'sessiontoken':session}
        res = requests.get(url, params=params)
        suggestions = []
        if(res.status_code == 200):
            json_data = res.json()
            for place in json_data["predictions"]:
                suggestions.append(place)
        return {x["description"]:{"main":x["structured_formatting"]["main_text"],"secondary":x["structured_formatting"]["secondary_text"]} for x in suggestions}

class YelpAutocomplete:
    def autocomplete(self, query, lat, lng):
        api_key = os.environ.get('YELP_API_KEY', '')
        url = 'https://api.yelp.com/v3/autocomplete'
        headers = {'Authorization': 'Bearer %s' % api_key}
        params = {'text':"del",'lat':float(37.786882), 'lng':float(-122.399972)}
        res = requests.get(url, params=params,headers=headers)
        suggestions = []
        if(res.status_code == 200):
            json_data = res.json()
            for business in json_data["businesses"]:
                suggestions.append(business["name"])
        return suggestions
