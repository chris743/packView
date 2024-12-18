from rest_framework.routers import DefaultRouter
from .views import (
    GrowerViewSet,
    RanchViewSet,
    BlockViewSet,
    CommodityViewSet,
    PlannedHarvestViewSet,
    ReceivingsViewSet,
    ProductionRunsViewSet,
    LaborContractorsViewSet,
    TruckingContractorViewSet,
    VarietiesViewSet,
    FolderViewSet,
    FileViewSet
)

router = DefaultRouter()
router.register(r'growers', GrowerViewSet)
router.register(r'ranches', RanchViewSet)
router.register(r'blocks', BlockViewSet)
router.register(r'commodities', CommodityViewSet)
router.register(r'planned-harvests', PlannedHarvestViewSet)
router.register(r'receivings', ReceivingsViewSet)
router.register(r'production-runs', ProductionRunsViewSet)
router.register(r'labor_contractors', LaborContractorsViewSet)
router.register(r'trucking_contractors', TruckingContractorViewSet)
router.register(r'varieties', VarietiesViewSet)
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'files', FileViewSet, basename='file')

urlpatterns = router.urls
