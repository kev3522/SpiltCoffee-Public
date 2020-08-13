from datetime import datetime, timedelta
from django.db.models import Avg
import copy

from ..enums.definitions import platform_map
from ..analyzer.models import Analysis


def combine_search_scores(search_id):
    result = Analysis.objects.filter(search_id=search_id).aggregate(Avg('compound'))
    return result['compound__avg']


# expects list of analysis models
def combine_analysis_scores(analysis_list, start, end, query=""):
    buckets = {}
    avg_results = []
    delta = timedelta(days=1)
    start = datetime.combine(start, datetime.min.time())
    end = datetime.combine(end, datetime.min.time())

    bucket_dates = []
    bucket_filled = False
    original_start = start

    platforms = set([])
    for analysis in analysis_list:
        key = query + ' (' + platform_map['reverse'][analysis.collector_type] + ')'
        platforms.add(key)

    for platform in platforms:
        buckets[platform] = {}
        while start <= end:
            buckets[platform][start] = []
            if not bucket_filled:
                bucket_dates.append(start)
            start += delta
        start = original_start
        bucket_filled = True

    for analysis in analysis_list:
        floor = floor_by_day(analysis.date)
        key = query + ' (' + platform_map['reverse'][analysis.collector_type] + ')'
        buckets[key][floor].append(analysis.compound)

    for date_bucket in bucket_dates:
        result_obj = {'time': date_bucket}
        for platform in platforms:
            scores = buckets[platform][date_bucket]
            avg_score = 0
            if len(scores) != 0:
                avg_score = round(sum(scores)/len(scores), 2)
            result_obj[platform] = avg_score
        avg_results.append(result_obj)

    return avg_results

# datescores should look like [{'time': DATETIME, platform1: COMPOUNDSCORE, platform2: COMPOUNDSCORE, ...}, ...]
def union_scores(datescores1, datescores2, startdate, enddate):
    # variable number of platforms in each datescore
    platforms_all = set([])
    platforms1 = set([])
    platforms2 = set([])
    for item in datescores1:
        platforms1 = platforms1.union(item.keys())
    for item in datescores2:
        platforms2 = platforms2.union(item.keys())
    if 'time' in platforms1: platforms1.remove('time')
    if 'time' in platforms2: platforms2.remove('time')
    platforms_all = platforms1.union(platforms2)
    empty_platforms_obj = {platform: None for platform in platforms_all}
    time_to_scores = {}
    for item in datescores1:
        datekey = datetime.combine(item['time'], datetime.min.time())
        time_to_scores[datekey] = copy.deepcopy(empty_platforms_obj)
        for platform in platforms1:
            time_to_scores[datekey][platform] = item[platform]

    for item in datescores2:
        datekey = datetime.combine(item['time'], datetime.min.time())
        if datekey not in time_to_scores:
            time_to_scores[datekey] = copy.deepcopy(empty_platforms_obj)
        for platform in platforms2:
            time_to_scores[datekey][platform] = item[platform]

    # bucketing by days only for now
    delta = timedelta(days=1)
    date = datetime.combine(startdate, datetime.min.time())
    limit = datetime.combine(enddate, datetime.min.time())
    union = []
    while date <= limit:
        pt = {'time': date}
        pt.update(empty_platforms_obj)
        if date in time_to_scores:
            for platform in platforms_all:
                pt[platform] = time_to_scores[date][platform]
        union.append(pt)
        date += delta
    return union


#returns item in dates that is closest to date
def nearest(dates, date):
    date = date.replace(tzinfo=None)
    return min(dates, key=lambda x: abs(x - date))

def floor_by_day(dt):
    return datetime.combine(dt.date(), datetime.min.time())
