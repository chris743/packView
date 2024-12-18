from rest_framework.viewsets import ModelViewSet
from .models import Block
from .serializers import BlockSerializer

from .models import (Grower, 
                     Ranch,
                     Block, 
                     Commodity,
                     Varieties, 
                     PlannedHarvest, 
                     Receivings, 
                     ProductionRuns,
                     LaborContractors,
                     TruckingContractors,
                     Folder,
                     File
                     )
from .serializers import (
    GrowerSerializer,
    RanchSerializer,
    BlockSerializer,
    CommoditySerializer,
    PlannedHarvestSerializer,
    ReceivingsSerializer,
    ProductionRunsSerializer,
    LaborContractorSerializer,
    VarietiesSerializer,
    TruckingContractorSerializer,
    FolderSerializer,
    FileSerializer
)

class GrowerViewSet(ModelViewSet):
    queryset = Grower.objects.all()
    serializer_class = GrowerSerializer


class RanchViewSet(ModelViewSet):
    queryset = Ranch.objects.all()
    serializer_class = RanchSerializer


class BlockViewSet(ModelViewSet):
    queryset = Block.objects.all()
    serializer_class = BlockSerializer

    def get_queryset(self):
        ranch_id = self.request.query_params.get('ranch')
        if ranch_id:
            ranch_id = ranch_id.rstrip('/')
            return self.queryset.filter(ranch_id=ranch_id)
        return self.queryset


class CommodityViewSet(ModelViewSet):
    queryset = Commodity.objects.all()
    serializer_class = CommoditySerializer


class PlannedHarvestViewSet(ModelViewSet):
    queryset = PlannedHarvest.objects.all()
    serializer_class = PlannedHarvestSerializer


class ReceivingsViewSet(ModelViewSet):
    queryset = Receivings.objects.all()
    serializer_class = ReceivingsSerializer


class ProductionRunsViewSet(ModelViewSet):
    queryset = ProductionRuns.objects.all()
    serializer_class = ProductionRunsSerializer

class LaborContractorsViewSet(ModelViewSet):
    queryset = LaborContractors.objects.all()
    serializer_class = LaborContractorSerializer

class TruckingContractorViewSet(ModelViewSet):
    queryset = TruckingContractors.objects.all()
    serializer_class = TruckingContractorSerializer

class VarietiesViewSet(ModelViewSet):
    queryset = Varieties.objects.all()
    serializer_class = VarietiesSerializer


class FolderViewSet(ModelViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer

    def get_queryset(self):
        grower_id = self.request.query_params.get('grower')  # Fetch grower_id from query parameters
        parent_id = self.request.query_params.get('parent')  # Fetch parent_id from query parameters

        if not grower_id:
            return self.queryset.none()  # Return an empty queryset if grower_id is missing

        queryset = self.queryset.filter(grower_id=grower_id)  # Filter by grower_id

        if parent_id:
            queryset = queryset.filter(parent_id=parent_id)  # Further filter by parent_id
        elif parent_id is None:
            queryset = queryset.filter(parent__isnull=True)  # Return root folders for the grower

        return queryset

class FileViewSet(ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer