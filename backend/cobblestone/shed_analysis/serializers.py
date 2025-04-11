from rest_framework import serializers
from .models import Orders, BinInventory, packs_completed, scanned_tags

class BinInventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Orders
        fields = '__all__'

class PacksCompletedSerializer(serializers.ModelSerializer):
    class Meta:
        model = packs_completed
        fields = '__all__'

class ScannedTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = scanned_tags
        fields = '__all__'