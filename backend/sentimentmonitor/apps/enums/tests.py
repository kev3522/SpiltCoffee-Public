from django.test import TestCase
from .util import names_to_enums
from .definitions import platform_map


class UtilityTests(TestCase):
    def test_names_to_enums(self):
        names = []
        for name in platform_map['reverse']:
            names.append(name)
        enums = names_to_enums(names)
        expected = list(map(lambda x: str(x), range(len(platform_map['reverse']))))
        self.assertEquals(enums, expected)
