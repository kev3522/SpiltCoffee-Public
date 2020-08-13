from django.test import TestCase
from .models import Search, update_search_status
from ..enums.definitions import platform_map
from .dispatcher import Dispatcher

class SearchModelTestCase(TestCase):
    def setUp(self):
        Search.objects.create(
            query="test1",
            loc="California",
            status=0,
            collectors="0,1",
            user_id="user"
        )
        Search.objects.create(
            query="test2",
            loc="Texas",
            status=1,
            collectors="1",
            user_id=""
        )
        Search.objects.create(
            query="test3",
            loc="New York",
            status=2,
            collectors="0",
            user_id="user"
        )

    def test_basic(self):
        s = Search.objects.get(query="test1")
        self.assertEqual(s.loc, "California")
        self.assertEqual(s.status, 0)
        self.assertIsNotNone(s.date)
        self.assertEqual(s.collectors, "0,1")
        self.assertEqual(s.user_id, "user")

    def test_user_items_only(self):
        s = Search.objects.filter(user_id="user")
        self.assertEquals(len(s), 2)
        for search in s:
            self.assertEquals(search.user_id, "user")
            self.assertIn(search.query, ['test1', 'test3'])
            self.assertIn(search.loc, ['California', 'New York'])
            self.assertIn(search.collectors, ["0,1", "0"])
            self.assertIn(search.status, [0, 2])


class DispatcherTestCase(TestCase):
    class TestYelpSearch:
        dispatched = False
        def search(self, query, location):
            self.dispatched = True
            return []

    class TestTwitterSearch:
        dispatched = False
        def search(self, query, location):
            self.dispatched = True
            return []

    class TestNewsSearch:
        dispatched = False
        def search(self, query, location):
            self.dispatched = True
            return []

    collector_map = {
        platform_map['Yelp']: TestYelpSearch(),
        platform_map['Twitter']: TestTwitterSearch(),
        platform_map['News']: TestNewsSearch()
    }
    dispatcher = Dispatcher(collector_map)

    def setUp(self):
        Search.objects.create(
            query="test1",
            loc="California",
            status=0,
            collectors="0,1,2",
            user_id="user"
        )

    def test_dispatch(self):
        s = Search.objects.get(query="test1")
        self.dispatcher.dispatch(s, s.collectors.split(","))
        self.assertTrue(self.collector_map[platform_map['Yelp']].dispatched)
        self.assertTrue(self.collector_map[platform_map['Twitter']].dispatched)
        self.assertTrue(self.collector_map[platform_map['News']].dispatched)

    def test_update_search_status(self):
        update_search_status(Search.objects.get(query="test1"), 2)
        self.assertEquals(Search.objects.get(query="test1").status, 2)
