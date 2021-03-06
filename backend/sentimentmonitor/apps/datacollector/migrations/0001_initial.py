# Generated by Django 3.0.6 on 2020-06-02 07:06

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Data',
            fields=[
                ('id', models.TextField(primary_key=True, serialize=False)),
                ('timestamp', models.IntegerField()),
                ('location_id', models.IntegerField()),
                ('original_query', models.TextField()),
                ('text', models.TextField()),
                ('verified_user', models.BooleanField()),
                ('og_link', models.TextField()),
                ('source', models.CharField(choices=[('IG', 'INSTAGRAM'), ('YP', 'YELP'), ('YT', 'YOUTUBE'), ('TW', 'TWITTER')], max_length=2)),
            ],
            options={
                'ordering': ['id'],
            },
        ),
    ]
