from rest_framework import generics, mixins

from ..enums.util import names_to_enums
from .models import Search
from .serializers import SearchSerializer
from .dispatcher import Dispatcher
from rest_framework.response import Response
from ..enums.definitions import search_statuses
from ..authorization.auth0API import get_user_id
from ..datacollector.collectors import collector_map


class SearchView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Search.objects.all()
    serializer_class = SearchSerializer


class SearchListView(mixins.ListModelMixin, generics.GenericAPIView):
    dispatcher = Dispatcher(collector_map)
    queryset = Search.objects.all()
    serializer_class = SearchSerializer

    def get(self, request):
        uid = get_user_id(request.META['HTTP_AUTHORIZATION'])

        serializer = SearchSerializer(self.queryset.all().filter(user_id=uid), many=True)
        return Response(serializer.data)

    def post(self, request):
        uid = get_user_id(request.META['HTTP_AUTHORIZATION'])

        query = request.data['query']
        collectors = request.data['sources']
        location = request.data['location']

        enums = names_to_enums(collectors)

        s = Search(query=query, status=search_statuses['NEW'], loc=location,
                   collectors=','.join(enums), user_id=uid)
        s.save()

        self.dispatcher.dispatch(s, enums)

        s = Search.objects.get(id=s.id)
        return Response({'search_id': s.id, 'status': s.status})


class UniqueSearchListView(mixins.ListModelMixin, generics.GenericAPIView):
    dispatcher = Dispatcher(collector_map)
    queryset = Search.objects.all()
    serializer_class = SearchSerializer

    def get(self, request):
        uid = get_user_id(request.META['HTTP_AUTHORIZATION'])

        searches = self.queryset.all().filter(user_id=uid)

        searchdict = {}
        for search in searches:
            query = search.query
            if query not in searchdict or search.date > searchdict[query].date:
                searchdict[query] = search

        serializer = SearchSerializer([searchdict[key] for key in searchdict.keys()], many=True)

        return Response(serializer.data)


class QueryListView(generics.GenericAPIView):
    def get(self, request):
        uid = get_user_id(request.META['HTTP_AUTHORIZATION'])

        queries = Search.objects.filter(user_id=uid).values('query')
        return Response([query for query in queries])
