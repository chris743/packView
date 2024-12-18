from rest_framework import serializers
from .models import Grower, Ranch, Block, Commodity, PlannedHarvest, Receivings, ProductionRuns, Varieties, LaborContractors, TruckingContractors, Folder, File

class GrowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grower
        fields = '__all__'


class RanchSerializer(serializers.ModelSerializer):
    grower = GrowerSerializer(read_only=True)
    grower_id = serializers.PrimaryKeyRelatedField(
        queryset=Grower.objects.all(), write_only=True, source='grower'
    )

    class Meta:
        model = Ranch
        fields = '__all__'


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
    grower_block = BlockSerializer(read_only=True)
    grower_block_id = serializers.PrimaryKeyRelatedField(
        queryset=Block.objects.all(), write_only=True, source='grower_block'
    )

    class Meta:
        model = PlannedHarvest
        fields = '__all__'


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
        fields = ['id', 'name', 'parent', 'children']

    def get_children(self, obj):
        return FolderSerializer(obj.children.all(), many=True).data

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'name', 'file', 'uploaded_at', 'folder']