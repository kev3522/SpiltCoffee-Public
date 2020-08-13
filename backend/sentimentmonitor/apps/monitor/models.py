from django.db import models
from ..search.models import Search


class MonitorCronJob(models.Model):
    query = models.TextField()
    loc = models.TextField(default="San Francisco, CA")
    status = models.SmallIntegerField()
    startdate = models.DateField(auto_now_add=True)
    enddate = models.DateField()
    collectors = models.TextField()
    user_id = models.TextField(default="")


class CronLookup(models.Model):
    search = models.ForeignKey(Search, on_delete=models.CASCADE)
    cron = models.ForeignKey(MonitorCronJob, on_delete=models.CASCADE)
