from rest_framework import serializers
from .models import Search


class SearchSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['status'].read_only = False

    class Meta:
        model = Search
        fields = ['id', 'query', 'date', 'status', 'loc', 'collectors']
