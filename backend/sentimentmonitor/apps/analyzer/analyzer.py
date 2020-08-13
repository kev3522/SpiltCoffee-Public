from .apps import AnalyzerConfig
from .models import Search, Analysis
from .wit_analyzer import run_wit

# threshold for if we trust wit sentiment analysis or not
WIT_THRESHOLD = 0.3684210526315789

class Analyzer:

    def __init__(self, search_model):
        self._search_model = search_model

    def run(self, text, date, collector_type, user_id):
        wit_scores, wit_confidence = run_wit(text)
        vader_scores = AnalyzerConfig.predictor.polarity_scores(text)
        scores = {}
        for key in ['neg', 'neu', 'pos', 'compound']:
            scores[key] = round(wit_scores[key]*WIT_THRESHOLD +
                                vader_scores[key]*(1-WIT_THRESHOLD), 3)

        a = Analysis(
            search=self._search_model,
            collector_type=collector_type,
            content=text,
            neg=scores['neg'],
            neu=scores['neu'],
            pos=scores['pos'],
            compound=scores['compound'],
            user_id=user_id,
            date=date
        )
        a.save()

    def run_all(self, results, collector_type, user_id):
        for text, date in results:
            self.run(text, date, collector_type, user_id)
