from rest_framework import serializers
from .models import Orders

class BinInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Orders
        fields = '__all__'
