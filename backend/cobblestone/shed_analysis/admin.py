from django.contrib import admin
from .models import BinInventory, Orders
# Register your models here.
@admin.register(BinInventory)
class BinInventoryAdmin(admin.ModelAdmin):
    search_fields = ("tag_id",)
