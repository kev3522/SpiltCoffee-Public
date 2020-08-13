import requests
import json
from .models import AccessTokenTable


def get_user_id(access_token):
    # Anonymous user token
    if access_token[:4] == 'ANON':
        return access_token
    entry = AccessTokenTable.objects.filter(access_token=access_token).first()
    if entry is None:
        # Access token doesn't exist in table, so make API call
        res = requests.get('https://spiltcoffee.us.auth0.com/userinfo', headers={'Authorization': 'Bearer ' + access_token})
        if res.status_code == 200:
            res_dict = json.loads(res.text)
            user_id = res_dict['sub']
            entry = AccessTokenTable.objects.filter(user_id=user_id).first()
            if entry is None:
                # Make new entry in table
                AccessTokenTable(access_token=access_token, user_id=user_id).save()
            else:
                # Replace with new access token
                entry.access_token = access_token
                entry.save()
            return user_id
        else:
            print("ERROR: " + str(res.status_code))
            return None
    else:
        # return stored user id
        return entry.user_id
