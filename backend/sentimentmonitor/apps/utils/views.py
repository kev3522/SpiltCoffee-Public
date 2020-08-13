from django.shortcuts import render
from rest_framework import generics

from .search_helpers import LocationGetter
from rest_framework.response import Response

# Create your views here.
class ConvertLocView(generics.GenericAPIView):
    locs = LocationGetter()
    def post(self, request):
        coords = self.locs.convert_loc(request.data["loc"],request.data["session"])
        return Response(coords)

class LocsView(generics.GenericAPIView):
    locs = LocationGetter()
    def post(self, request):
        suggestions = self.locs.autocompletePlaces(request.data["query"], request.data["session"])
        return Response(suggestions)

class AutocompleteView(generics.GenericAPIView):
    locs = LocationGetter()
    def post(self, request):
        suggestions = self.locs.autocompleteBusinesses(request.data["query"],request.data["lat"], request.data["lng"],request.data["session"])
        return Response(suggestions)