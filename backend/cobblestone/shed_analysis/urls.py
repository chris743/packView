from django.urls import path, include
from rest_framework.routers import DefaultRouter
from shed_analysis.views import CapacityGaugeView, TopFiveThisWeek, WeeklyStatsView, ChartDataView, OrdersDashboardAPIView, PacksCompletedView, ScannedTagsView, OutletVerificationStatusView
from shed_analysis.bin_inventory_views import BinInventoryView, AssociatedBinsView

router = DefaultRouter()
router.register(r'packs-completed', PacksCompletedView, basename='packs-completed')
router.register(r'scanned-tags', ScannedTagsView, basename='scanned-tags')
router.register(r'capacity-all', CapacityGaugeView, basename='capacity-gauges')
router.register(r'top-5', TopFiveThisWeek, basename='top-5')
router.register(r'weekly-stats', WeeklyStatsView, basename='weekly-stats')
router.register(r'capacity-bar-charts', ChartDataView, basename='bar-charts')
router.register(r'bin-inventory', BinInventoryView, basename='bin-inventory')
router.register(r'associated-bins', AssociatedBinsView, basename='associated-bins')
router.register(r'orders-dashboard', OrdersDashboardAPIView, basename='orders-dashboard')


urlpatterns = [
    path("", include(router.urls)),
    path("outlet-dashboard/", OutletVerificationStatusView.as_view(), name="verification-status"),  # ✅ include your APIView here
]