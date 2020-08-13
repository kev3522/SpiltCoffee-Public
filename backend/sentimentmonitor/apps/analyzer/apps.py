from django.apps import AppConfig
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


class AnalyzerConfig(AppConfig):
    name = 'sentimentmonitor.apps.analyzer'
    label = 'analyzer'
    predictor = SentimentIntensityAnalyzer()     # Using VADER
