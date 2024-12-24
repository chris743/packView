from django.urls import path, include
from rest_framework.routers import DefaultRouter
from shed_analysis.views import GiroCapacityView, CapacityGaugeView ,GiroBarDataView, FoxCapacityView, VexarCapacityView, BulkCapacityView

urlpatterns = [
    path('giro-capacity/', GiroCapacityView.as_view(), name='giro-capacity'),
    path('fox-capacity/', FoxCapacityView.as_view(), name='fox-capacity'),
    path('vexar-capacity/', VexarCapacityView.as_view(), name='vexar-capacity'),
    path('bulk-capacity/', BulkCapacityView.as_view(), name='bulk-capacity'),

    path('capacity-all/', CapacityGaugeView.as_view(), name='capacity-gauges'),


    path('giro-bar-data/', GiroBarDataView.as_view(), name='giro-bar-data'),
]