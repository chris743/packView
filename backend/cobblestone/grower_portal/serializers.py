from rest_framework import serializers
from .models import Grower, Ranch, Pools, Block, HarvestPlansDate, Commodity, FieldContractors, PlannedHarvest, Receivings, ProductionRuns, Varieties, LaborContractors, TruckingContractors, Folder, File
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

class HarvestDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvestPlansDate
        fields = ['date', 'estimated_bins']

class PlannedHarvestSerializer(serializers.ModelSerializer):
    planted_commodity = serializers.CharField(source='grower_block.planted_commodity.name', read_only=True)
    ranch = serializers.CharField(source='grower_block.ranch.name', read_only=True)
    growerBlockName = serializers.CharField(source='grower_block.name', read_only=True)
    growerBlockId = serializers.CharField(source='grower_block.block_id', read_only=True)
    forkliftContractorName = serializers.CharField(source='forklift_contractor.name', read_only=True)
    truckingContractorName = serializers.CharField(source='hauler.name', read_only=True)
    laborContractorName = serializers.CharField(source='contractor.name', read_only=True)
    dates = HarvestDateSerializer(many=True)

    class Meta:
        model = PlannedHarvest
        fields = [
            'id',
            'grower_block',
            'growerBlockName',
            'growerBlockId',
            'planned_bins',
            'contractor',
            'laborContractorName',
            'harvesting_rate',
            'hauler',
            'truckingContractorName',
            'hauling_rate',
            'pool',
            'planted_commodity',
            'ranch',
            'notes_general',
            'forklift_contractor',
            'forkliftContractorName',
            'forklift_rate',
            'deliver_to',
            'packed_by',
            'dates',
        ]

    def create(self, validated_data):
        # Extract nested dates
        dates_data = validated_data.pop('dates')
        harvest_plan = PlannedHarvest.objects.create(**validated_data)

        # Create HarvestDate entries
        for date_data in dates_data:
            HarvestPlansDate.objects.create(harvest_plan=harvest_plan, **date_data)

        return harvest_plan

    def update(self, instance, validated_data):
        # Extract nested dates
        dates_data = validated_data.pop('dates')

        # Update PlannedHarvest fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Clear and recreate HarvestDate entries
        instance.dates.all().delete()  # Assuming related name is 'dates'
        for date_data in dates_data:
            HarvestPlansDate.objects.create(harvest_plan=instance, **date_data)

        return instance
    



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

class FieldContractorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldContractors
        fields = '__all__'

