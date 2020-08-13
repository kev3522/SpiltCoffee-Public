from django.test import TestCase
from django.utils.timezone import now
from .models import MonitorCronJob


class CronModelTestCase(TestCase):
    def setUp(self):
        MonitorCronJob.objects.create(
            query="test",
            loc="California",
            status=0,
            enddate=now(),
            collectors="0,1,2",
            user_id="user"
        )

    def test_basic(self):
        m = MonitorCronJob.objects.get(query="test")
        self.assertEquals(m.query, "test")
        self.assertEquals(m.loc, "California")
        self.assertEquals(m.status, 0)
        self.assertIsNotNone(m.startdate)
        self.assertIsNotNone(m.enddate)
        self.assertEquals(m.collectors, "0,1,2")
        self.assertEquals(m.user_id, "user")
