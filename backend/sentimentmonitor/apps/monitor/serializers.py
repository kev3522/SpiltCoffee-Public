from rest_framework import serializers
from .models import MonitorCronJob


class MonitorCronJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonitorCronJob
        fields = ['id', 'query', 'loc', 'status', 'startdate', 'enddate', 'collectors']