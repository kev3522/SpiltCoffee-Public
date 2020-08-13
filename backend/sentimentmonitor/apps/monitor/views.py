from datetime import datetime

from rest_framework import generics, mixins

from ..enums.util import names_to_enums
from ..analyzer.models import Analysis
from ..search.models import Search
from ..monitor.models import MonitorCronJob, CronLookup
from rest_framework.response import Response
import dateutil.parser
from .serializers import MonitorCronJobSerializer
from ..monitor.aggregate import combine_search_scores
from ..enums.definitions import platform_map, monitor_statuses
from .aggregate import combine_analysis_scores, union_scores
from ..authorization.auth0API import get_user_id


class HistoricalAnalysisView(generics.GenericAPIView):
    def post(self, request):
        uid = get_user_id(request.META['HTTP_AUTHORIZATION'])

        query = request.data['query']
        start_date = dateutil.parser.parse(request.data['start'])
        end_date = dateutil.parser.parse(request.data['end'])
        platform_names = request.data['platforms']

        final_result = get_historical_pts_from_query(query, start_date, end_date, platform_names, uid)
        return Response({'query': query, 'results': final_result, 'platforms': platform_names})


class MonitorCronList(generics.GenericAPIView):
    queryset = MonitorCronJob.objects.all()
    serializer_class = MonitorCronJobSerializer

    def get(self, request):
        uid = get_user_id(request.META['HTTP_AUTHORIZATION'])
        serial = self.serializer_class(self.queryset.filter(user_id=uid), many=True)
        return Response(serial.data)

    def post(self, request):
        uid = get_user_id(request.META['HTTP_AUTHORIZATION'])

        query = request.data['query']
        collectors = request.data['sources']
        location = request.data['location']
        enddate = request.data['enddate']

        collectors_str = ','.join(map(lambda name: str(platform_map[name]), collectors))
        m = MonitorCronJob(query=query, collectors=collectors_str, loc=location,
                           enddate=dateutil.parser.parse(enddate), status=monitor_statuses['SCHEDULED'],
                           user_id=uid)
        m.save()
        return Response({'cron_id': m.id})


class MonitorCronDetail(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin, generics.GenericAPIView):
    queryset = MonitorCronJob.objects.all()
    serializer_class = MonitorCronJobSerializer

    def get(self, request, pk):
        uid = get_user_id(request.META['HTTP_AUTHORIZATION'])

        detail = self.queryset.get(pk=pk, user_id=uid)
        search_ids = list(map(lambda x: x['search_id'], CronLookup.objects.filter(cron_id=detail.id).values('search_id')))
        graphdata = [{'x': Search.objects.get(id=search_id).date, 'y': combine_search_scores(search_id)} for search_id in
               search_ids]

        return Response({'id': detail.id, 'query': detail.query, 'collectors': detail.collectors,
                         'enddate': detail.enddate, 'loc': detail.loc, 'status': detail.status, 'related': search_ids,
                         'graphdata': graphdata})

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class MonitorSuperimpose(generics.GenericAPIView):
    def post(self, request):
        uid = get_user_id(request.META['HTTP_AUTHORIZATION'])

        query = request.data['query']
        start_date = dateutil.parser.parse(request.data['start'])
        end_date = dateutil.parser.parse(request.data['end'])
        platform_names = request.data['platforms']
        cron_id = request.data['cron']
        cron_model = MonitorCronJob.objects.get(id=cron_id)
        cron_start_date = cron_model.startdate
        cron_end_date = cron_model.enddate

        historical = get_historical_pts_from_query(query, start_date, cron_start_date, platform_names, uid)
        cron = get_cron_pts_from_id(cron_id)
        final_result = union_scores(historical, cron, start_date, cron_end_date)
        return Response(final_result)


class ManyGraphPoints(generics.GenericAPIView):
    def post(self, request):
        uid = get_user_id(request.META['HTTP_AUTHORIZATION'])

        result = []
        start_date = dateutil.parser.parse(request.data['start'])
        end_date = dateutil.parser.parse(request.data['end'])
        # expects list of search ids to get graph points for
        search_ids = request.data['req_list']
        for search_id in search_ids:

            a_list = Analysis.objects.filter(search_id=search_id, date__date__gte=start_date,
                                             date__date__lte=end_date, user_id=uid)
            query = Search.objects.get(id=search_id).query
            result = union_scores(result,
                                  combine_analysis_scores(
                                      a_list, start_date, end_date, query,
                                  ),
                                  start_date,
                                  end_date
                                  )
        return Response(result)


def get_historical_pts_from_query(query, start_date, end_date, platform_names, uid):
    platform_enums = names_to_enums(platform_names)

    relevant_searches = Search.objects.none()
    for enum in platform_enums:
        relevant_searches = relevant_searches | Search.objects.filter(query=query, collectors__contains=enum)

    results = []

    for search in relevant_searches:
        for collector_string in platform_enums:
            collector_type = int(collector_string)
            results_qs = Analysis.objects.none()

            try:
                results_qs = results_qs | Analysis.objects.filter(date__date__gte=start_date,
                                                                  date__date__lte=end_date,
                                                                  search_id=search.id,
                                                                  collector_type=collector_type,
                                                                  user_id=uid)
            except:
                continue
            results.extend(results_qs)
    final_result = combine_analysis_scores(results, start_date, end_date, query)
    return final_result



def get_cron_pts_from_id(id):
    detail = MonitorCronJob.objects.get(id=id)
    search_ids = list(map(lambda x: x['search_id'], CronLookup.objects.filter(cron_id=detail.id).values('search_id')))
    result = []
    for search_id in search_ids:
        rawtime = Search.objects.get(id=search_id)
        time = datetime.combine(rawtime.date,datetime.min.time())
        score = combine_search_scores(search_id)
        result.append({'time': time, 'Monitor': score})
    return result
