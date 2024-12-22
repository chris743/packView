from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('grower_portal.urls')),  # Add this line
    path('data/', include('shed_analysis.urls')),
]
