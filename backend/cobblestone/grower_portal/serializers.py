from rest_framework import serializers
from .models import Grower, Ranch, Pools, Block, Commodity, PlannedHarvest, Receivings, ProductionRuns, Varieties, LaborContractors, TruckingContractors, Folder, File
import calendar
class GrowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grower
        fields = '__all__'


class RanchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ranch
        fields = ['id', 'name', 'grower']


class CommoditySerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity
        fields = '__all__'


class BlockSerializer(serializers.ModelSerializer):
    ranch = RanchSerializer(read_only=True)
    ranch_id = serializers.PrimaryKeyRelatedField(
        queryset=Ranch.objects.all(), write_only=True, source='ranch'
    )
    planted_commodity = serializers.PrimaryKeyRelatedField(
        queryset=Commodity.objects.all(), write_only=True)

    class Meta:
        model = Block
        fields = '__all__'


class PlannedHarvestSerializer(serializers.ModelSerializer):
    planted_commodity = serializers.CharField(source='grower_block.planted_commodity.name', read_only=True)
    ranch = serializers.CharField(source='grower_block.ranch.name', read_only=True)
    growerBlockName = serializers.CharField(source='grower_block.name', read_only=True)
    day_of_week = serializers.SerializerMethodField()

    class Meta:
        model = PlannedHarvest
        fields = [
            'id',
            'grower_block',
            'growerBlockName',
            'planned_bins',
            'contractor',
            'harvesting_rate',
            'hauler',
            'hauling_rate',
            'pool',
            'harvest_date',
            'planted_commodity',  # Include planted commodity
            'ranch',  # Include ranch name for clarity
            'day_of_week',
        ]
    
    def get_day_of_week(self, obj):
        if obj.harvest_date:
            return calendar.day_name[obj.harvest_date.weekday()]
        return None
    



class ReceivingsSerializer(serializers.ModelSerializer):
    harvest = PlannedHarvestSerializer(read_only=True)
    harvest_id = serializers.PrimaryKeyRelatedField(
        queryset=PlannedHarvest.objects.all(), write_only=True, source='harvest'
    )

    class Meta:
        model = Receivings
        fields = '__all__'


class ProductionRunsSerializer(serializers.ModelSerializer):
    grower_block = BlockSerializer(read_only=True)
    grower_block_id = serializers.PrimaryKeyRelatedField(
        queryset=Block.objects.all(), write_only=True, source='grower_block'
    )

    class Meta:
        model = ProductionRuns
        fields = '__all__'

class VarietiesSerializer(serializers.ModelSerializer):
    commodity = CommoditySerializer(read_only=True)

    class Meta:
        model = Varieties
        fields = '__all__'

class LaborContractorSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaborContractors
        fields = '__all__'

class TruckingContractorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TruckingContractors
        fields = '__all__'

class VarietiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Varieties
        fields = '__all__'

class FolderSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ['id', 'name', 'parent', 'grower', 'children']

    def get_children(self, obj):
        return FolderSerializer(obj.children.all(), many=True).data

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'name', 'file', 'uploaded_at', 'folder']

class PoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pools
        fields = '__all__'