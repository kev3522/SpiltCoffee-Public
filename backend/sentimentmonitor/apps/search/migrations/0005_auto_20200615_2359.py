# Generated by Django 3.0.6 on 2020-06-15 23:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0004_auto_20200611_0445'),
    ]

    operations = [
        migrations.AddField(
            model_name='search',
            name='collectors',
            field=models.TextField(default=''),
        ),
        migrations.DeleteModel(
            name='Collector',
        ),
    ]
