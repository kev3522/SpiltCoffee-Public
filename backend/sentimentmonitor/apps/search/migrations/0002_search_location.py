# Generated by Django 3.0.6 on 2020-06-03 23:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='search',
            name='location',
            field=models.TextField(default='San Francisco, CA'),
            preserve_default=False,
        ),
    ]
