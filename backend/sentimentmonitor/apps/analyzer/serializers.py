from rest_framework import serializers
from .models import Analysis


# https://www.django-rest-framework.org/tutorial/1-serialization/#using-modelserializers
class AnalysisSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['search_id'].required = True
        self.fields['search_id'].read_only = False
        self.fields['content'].required = True
        self.fields['neg'].read_only = True
        self.fields['neu'].read_only = True
        self.fields['pos'].read_only = True
        self.fields['compound'].read_only = True

    class Meta:
        model = Analysis
        fields = ['id', 'search_id', 'date', 'content', 'neg', 'neu', 'pos', 'compound', 'collector_type']
