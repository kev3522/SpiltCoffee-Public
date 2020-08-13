from django.db import models


class AccessTokenTable(models.Model):
    user_id = models.TextField(default="")
    access_token = models.TextField(default="")
