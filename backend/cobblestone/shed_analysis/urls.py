from django.urls import path, include
from rest_framework.routers import DefaultRouter
from shed_analysis.views import GiroCapacityView, GiroBarDataView

urlpatterns = [
    path('giro-capacity/', GiroCapacityView.as_view(), name='giro-capacity'),
    path('giro-bar-data/', GiroBarDataView.as_view(), name='giro-bar-data'),
]