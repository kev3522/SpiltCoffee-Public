# Generated by Django 3.0.6 on 2020-06-13 05:03

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MonitoredSearch',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('query', models.TextField()),
                ('loc', models.TextField(default='San Francisco, CA')),
                ('status', models.SmallIntegerField()),
                ('startdate', models.DateField()),
                ('enddate', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='MonitoredCollector',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.SmallIntegerField()),
                ('monitoring', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.MonitoredSearch')),
            ],
        ),
    ]
