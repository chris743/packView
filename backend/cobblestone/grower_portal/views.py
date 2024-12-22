from rest_framework.viewsets import ModelViewSet
from .models import Block
from .serializers import BlockSerializer
from rest_framework.exceptions import ValidationError

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

    def get_queryset(self):
        grower_id = self.request.query_params.get('grower')  # Get grower ID from query params
        if grower_id:
            grower_id = grower_id.rstrip("/")
            return self.queryset.filter(grower_id=grower_id)  # Filter by grower ID
        return self.queryset.none()  # Return an empty queryset if grower ID is not provided

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
        """
        Filter folders based on the grower passed in the query parameters.
        """
        grower_id = self.request.query_params.get('grower')  # Get grower ID from query params
        if grower_id:
            return self.queryset.filter(grower_id=grower_id)  # Return folders for the specified grower
        return self.queryset.none()  # Return nothing if grower ID is missing

    def perform_create(self, serializer):
        """
        Create a folder for the specified grower.
        """
        grower_id = self.request.data.get('grower')
        parent_id = self.request.data.get('parent')

        if not grower_id:
            raise ValidationError({"grower": "This field is required."})

        parent_folder = None
        if parent_id:
            try:
                parent_folder = Folder.objects.get(id=parent_id, grower_id=grower_id)
            except Folder.DoesNotExist:
                raise ValidationError({"parent": "Parent folder does not exist or does not belong to the grower."})

        serializer.save(grower_id=grower_id, parent=parent_folder)

class FileViewSet(ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def get_queryset(self):
        """
        Filter files based on the folder's grower.
        """
        folder_id = self.request.query_params.get('folder')
        if folder_id:
            try:
                folder = Folder.objects.get(id=folder_id)
                return self.queryset.filter(folder=folder)
            except Folder.DoesNotExist:
                return self.queryset.none()
        return self.queryset.none()