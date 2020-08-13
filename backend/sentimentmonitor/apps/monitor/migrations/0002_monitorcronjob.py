# Generated by Django 3.0.6 on 2020-06-15 02:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='MonitorCronJob',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('query', models.TextField()),
                ('loc', models.TextField(default='San Francisco, CA')),
                ('status', models.SmallIntegerField()),
                ('enddate', models.DateField()),
                ('collectors', models.TextField()),
            ],
        ),
    ]