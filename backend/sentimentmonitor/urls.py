"""sentimentmonitor URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .apps.search.views import SearchView, SearchListView, QueryListView, UniqueSearchListView
from .apps.analyzer.views import AnalysisView, ExtremePositiveAnalysisView, ExtremeNegativeAnalysisView
from .apps.monitor.views import MonitorCronList, MonitorCronDetail, MonitorSuperimpose, HistoricalAnalysisView, ManyGraphPoints
from .apps.utils.views import LocsView, AutocompleteView, ConvertLocView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v0/search', SearchListView.as_view()),
    path('api/v0/uniquesearch', UniqueSearchListView.as_view()),

    path('api/v0/search/<int:pk>', SearchView.as_view()),
    path('api/v0/analysis/<int:pk>', AnalysisView.as_view()),
    path('api/v0/posanalysis/<int:pk>', ExtremePositiveAnalysisView.as_view()),
    path('api/v0/neganalysis/<int:pk>', ExtremeNegativeAnalysisView.as_view()),

    path('api/v0/querylist', QueryListView.as_view()),

    path('api/v0/historicalanalysis', HistoricalAnalysisView.as_view()),
    path('api/v0/cron', MonitorCronList.as_view()),
    path('api/v0/cron/<int:pk>', MonitorCronDetail.as_view()),
    path('api/v0/superimposedanalysis', MonitorSuperimpose.as_view()),
    path('api/v0/manygraphs', ManyGraphPoints.as_view()),
    path('api/v0/autocompleteloc', LocsView.as_view()),
    path('api/v0/autocomplete', AutocompleteView.as_view()),
    path('api/v0/convertloc', ConvertLocView.as_view()),
]
