from django.db import models
from ..search.models import Search


# https://www.django-rest-framework.org/tutorial/1-serialization/#creating-a-model-to-work-with
class Analysis(models.Model):
    # metadata
    search = models.ForeignKey(Search, on_delete=models.CASCADE, related_name='search')
    date = models.DateTimeField()
    content = models.TextField()
    collector_type = models.SmallIntegerField(default=-1)
    # prediction from model
    neg = models.FloatField()
    neu = models.FloatField()
    pos = models.FloatField()
    compound = models.FloatField()
    user_id = models.TextField(default="")

    class Meta:
        ordering = ['date']
