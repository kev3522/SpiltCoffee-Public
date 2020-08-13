from datetime import date

from django.core.management.base import BaseCommand

from sentimentmonitor.apps.datacollector.collectors import collector_map
from sentimentmonitor.apps.enums.definitions import monitor_statuses, search_statuses
from sentimentmonitor.apps.monitor.models import MonitorCronJob, CronLookup
from sentimentmonitor.apps.search.dispatcher import Dispatcher
from sentimentmonitor.apps.search.models import Search


class Command(BaseCommand):
    help = 'Runs the monitoring cron job'

    def __init__(self):
        super(Command, self).__init__()
        self.dispatcher = Dispatcher(collector_map)

    def handle(self, *args, **options):
        currdate = date.today()
        for item in MonitorCronJob.objects.all():
            if item.status == monitor_statuses['COMPLETED']:
                continue

            item.status = monitor_statuses['MONITORING']
            item.save()

            s = Search(query=item.query, status=search_statuses['NEW'], loc=item.loc,
                       collectors=item.collectors, user_id=item.user_id)
            s.save()

            lookup = CronLookup(search_id=s.id, cron_id=item.id)
            lookup.save()

            self.dispatcher.dispatch(s, item.collectors.split(","))
            if currdate >= item.enddate:
                item.status = monitor_statuses['COMPLETED']

