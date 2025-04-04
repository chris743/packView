from rest_framework import serializers
from .models import Grower, Ranch, Pools, Block, HarvestPlansDate, Commodity, FieldContractors, PlannedHarvest, Receivings, ProductionRuns, Varieties, LaborContractors, TruckingContractors, Folder, File, SizerReport
import calendar
class GrowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grower
        fields = '__all__'


class RanchSerializer(serializers.ModelSerializer):
    grower = GrowerSerializer(read_only=True)
    
    class Meta:
        model = Ranch
        fields = ['id', 'name', 'grower']


class CommoditySerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity
        fields = '__all__'

class VarietiesSerializer(serializers.ModelSerializer):
    commodity = CommoditySerializer(read_only=True)

    class Meta:
        model = Varieties
        fields = '__all__'

class BlockSerializer(serializers.ModelSerializer):
    ranch = RanchSerializer(read_only=True)
    ranch_id = serializers.PrimaryKeyRelatedField(
        queryset=Ranch.objects.all(), write_only=True, source='ranch'
    )
    variety = VarietiesSerializer(read_only=True)

    class Meta:
        model = Block
        fields = '__all__'

class HarvestDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvestPlansDate
        fields = ['date', 'estimated_bins']

class ReceivingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receivings
        fields = ['receipt_id', 'qty_received', 'harvest', 'date']

class PlannedHarvestSerializer(serializers.ModelSerializer):
    planted_commodity = serializers.CharField(source='grower_block.planted_commodity.name', read_only=True)
    ranch = serializers.CharField(source='grower_block.ranch.name', read_only=True)
    growerBlockName = serializers.CharField(source='grower_block.name', read_only=True)
    growerBlockId = serializers.CharField(source='grower_block.block_id', read_only=True)
    block_size = serializers.CharField(source='grower_block.size', read_only=True)
    forkliftContractorName = serializers.CharField(source='forklift_contractor.name', read_only=True)
    truckingContractorName = serializers.CharField(source='hauler.name', read_only=True)
    laborContractorName = serializers.CharField(source='contractor.name', read_only=True)
    dates = HarvestDateSerializer(many=True)
    receivings = ReceivingsSerializer(many=True, required=False)

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
            'receivings',
            'block_size',
        ]

    def create(self, validated_data):
        # Extract nested dates
        dates_data = validated_data.pop('dates', [])
        harvest_plan = PlannedHarvest.objects.create(**validated_data)

        # Create HarvestDate entries in bulk
        dates = [HarvestPlansDate(harvest_plan=harvest_plan, **date_data) for date_data in dates_data]
        HarvestPlansDate.objects.bulk_create(dates)

        return harvest_plan

    def update(self, instance, validated_data):
        # Extract nested dates
        dates_data = validated_data.pop('dates', [])

        # Update PlannedHarvest fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Clear and recreate HarvestDate entries
        instance.dates.all().delete()
        dates = [HarvestPlansDate(harvest_plan=instance, **date_data) for date_data in dates_data]
        HarvestPlansDate.objects.bulk_create(dates)

        return instance

    def validate_dates(self, value):
        if not value:
            raise serializers.ValidationError("Dates cannot be empty.")
        for date_data in value:
            if 'date' not in date_data or 'estimated_bins' not in date_data:
                raise serializers.ValidationError("Each date must have 'date' and 'estimated_bins' fields.")
        return value
    
class SizerReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SizerReport
        fields = ['raw_JSON',]

class ProductionRunsSerializer(serializers.ModelSerializer):
    grower_block = BlockSerializer(read_only=True)
    grower_block_id = serializers.PrimaryKeyRelatedField(
        queryset=Block.objects.all(), write_only=True, source='grower_block'
    )
    sizer_data = SizerReportSerializer(read_only=True)
    variety = VarietiesSerializer(read_only=True)

    class Meta:
        model = ProductionRuns
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

