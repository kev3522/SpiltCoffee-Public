from django.db import models
from ..enums.definitions import search_statuses


class Search(models.Model):
    query = models.TextField()
    loc = models.TextField(default="San Francisco, CA")
    date = models.DateTimeField(auto_now_add=True)
    status = models.SmallIntegerField()
    collectors = models.TextField(default="")
    user_id = models.TextField(default="")

    class Meta:
        ordering = ['date']


def update_search_status(search_model, status):
    if status >= len(search_statuses['reverse']):
        print("ERROR: Status not in enums.")
        return

    search_model.status = status
    search_model.save()
