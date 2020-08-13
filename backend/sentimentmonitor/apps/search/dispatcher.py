from ..analyzer.analyzer import Analyzer
from .models import update_search_status
from ..enums.definitions import search_statuses


class Dispatcher:

    def __init__(self, collector_map):
        self._collectors = collector_map

    def dispatch(self, search_model, collector_enums):
        analyzer = Analyzer(search_model)
        user_id = search_model.user_id
        found = False
        for enum in collector_enums:
            enum = int(enum)
            if enum in self._collectors:
                update_search_status(search_model, search_statuses['IN_PROGRESS'])
                results = self._collectors[enum].search(search_model.query, search_model.loc)
                if len(results) > 0:
                    # Pass on to sentiment analyzer and save text and results to db
                    analyzer.run_all(results, enum, user_id)
                    found = True
            else:
                print("ERROR: Invalid collector type!")
        if not found:
            update_search_status(search_model, search_statuses['NOTFOUND'])
        else:
            update_search_status(search_model, search_statuses['COMPLETED'])
