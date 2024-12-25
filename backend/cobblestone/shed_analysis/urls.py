from django.urls import path, include
from rest_framework.routers import DefaultRouter
from shed_analysis.views import CapacityGaugeView, TopFiveThisWeek, WeeklyStatsView, ChartDataView, OrdersDashboardAPIView
from shed_analysis.bin_inventory_views import BinInventoryView, AssociatedBinsView

urlpatterns = [
    path('capacity-all/', CapacityGaugeView.as_view(), name='capacity-gauges'),
    path('top-5/', TopFiveThisWeek.as_view(), name='top-5'),
    path('weekly-stats/', WeeklyStatsView.as_view(), name='weekly-stats'),
    path('capacity-bar-charts/', ChartDataView.as_view(), name='bar-charts'),
    path('bin-inventory/', BinInventoryView.as_view(), name='bin-inventory'),
    path('associated-bins/', AssociatedBinsView.as_view(), name='associated-bins'),
    path('orders-dashboard/', OrdersDashboardAPIView.as_view(), name='orders-dashboard')
]