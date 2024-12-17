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
                     TruckingContractors
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
    TruckingContractorSerializer
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
