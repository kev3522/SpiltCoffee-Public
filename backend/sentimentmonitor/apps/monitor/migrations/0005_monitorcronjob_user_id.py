# Generated by Django 3.0.6 on 2020-06-17 03:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0004_auto_20200615_2359'),
    ]

    operations = [
        migrations.AddField(
            model_name='monitorcronjob',
            name='user_id',
            field=models.TextField(default=''),
        ),
    ]
