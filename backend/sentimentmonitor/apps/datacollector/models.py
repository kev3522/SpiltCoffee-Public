from django.db import models

# Create your models here.
class Data(models.Model):
    id = models.TextField(primary_key=True)
    timestamp = models.IntegerField()
    # prediction from model
    location_id = models.IntegerField()
    original_query = models.TextField()
    text = models.TextField()
    verified_user = models.BooleanField()
    og_link = models.TextField()
    source = models.CharField(max_length = 2)

    class Meta:
        ordering = ['id']
