from rest_framework import generics

from .models import Analysis
from .serializers import AnalysisSerializer

from rest_framework.response import Response
from ..authorization.auth0API import get_user_id


# https://www.django-rest-framework.org/tutorial/3-class-based-views/#rewriting-our-api-using-class-based-views

class AnalysisView(generics.GenericAPIView):

    # Get all analyzed queries stored in db
    def get(self, request, pk):
        access_token = request.META['HTTP_AUTHORIZATION']
        uid = get_user_id(access_token)

        analysis = Analysis.objects.filter(search_id=pk, user_id=uid)
        serializer = AnalysisSerializer(analysis, many=True)
        return Response(serializer.data)


class ExtremePositiveAnalysisView(generics.GenericAPIView):
    def get(self, request, pk):
        access_token = request.META['HTTP_AUTHORIZATION']
        uid = get_user_id(access_token)

        analysis = Analysis.objects.filter(search_id=pk, user_id=uid, compound__gte=0.5)
        serializer = AnalysisSerializer(analysis, many=True)
        return Response(serializer.data)


class ExtremeNegativeAnalysisView(generics.GenericAPIView):
    def get(self, request, pk):
        access_token = request.META['HTTP_AUTHORIZATION']
        uid = get_user_id(access_token)

        analysis = Analysis.objects.filter(search_id=pk, user_id=uid, compound__lte=-0.5)
        serializer = AnalysisSerializer(analysis, many=True)
        return Response(serializer.data)
