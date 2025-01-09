from django.contrib import admin
from .models import Grower, Ranch, Pools, Block, Commodity, FieldContractors, PlannedHarvest, Receivings, ProductionRuns, Varieties, LaborContractors, TruckingContractors, Folder, File

@admin.register(Commodity)
class CommodityAdmin(admin.ModelAdmin):
    list_display = ("name", "avgCtnPrice", "stdCtnCost", "pricePerPound", "standardCtnWeight", "packingCharge", "profitPerBag", "promo")
    search_fields = ("name",)

@admin.register(Grower)
class GrowerAdmin(admin.ModelAdmin):
    list_display = ("name", "grower_id", "grower_contact_email", "grower_contact_phone")
    search_fields = ("name",)

@admin.register(Ranch)
class RanchAdmin(admin.ModelAdmin):
    list_display = ("name", "grower", "location")
    search_fields = ("name", "grower__name")
    list_filter = ("grower",)

@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ("name", "block_id", "ranch", "size", "planted_commodity", "planted_variety")
    search_fields = ("name", "ranch__name", "planted_commodity__name")
    list_filter = ("ranch", "planted_commodity")

@admin.register(PlannedHarvest)
class PlannedHarvestAdmin(admin.ModelAdmin):
    list_display = ("grower_block", "planned_bins", "harvest_date")  # Corrected 'block' to 'grower_block'
    search_fields = ("grower_block__name",)
    list_filter = ("harvest_date",)

@admin.register(ProductionRuns)
class ProductionRunsAdmin(admin.ModelAdmin):
    list_display = ("name", "grower_block", "bins")  # Corrected 'block' to 'grower_block'
    search_fields = ("name", "grower_block__name")

@admin.register(Receivings)
class ReceivingsAdmin(admin.ModelAdmin):
    list_display = ("receipt_id", "qty_received")  # Corrected 'block' to 'grower_block'
    search_fields = ("receipt_id", )

@admin.register(Varieties)
class VarietiesAdmin(admin.ModelAdmin):
    list_display = ('name', 'commodity')
    search_fields = ('name',)

@admin.register(LaborContractors)
class LaborContractorsAdmin(admin.ModelAdmin):
    list_display = ('name', 'primary_contact_name', 'primary_contact_phone', 'office_phone', 'mailing_address')
    search_fields = ('name',)

@admin.register(TruckingContractors)
class TruckingContractorsAdmin(admin.ModelAdmin):
    list_display = ('name', 'primary_contact_name', 'primary_contact_phone', 'office_phone', 'mailing_address')
    search_fields = ('name',)

@admin.register(FieldContractors)
class TruckingContractorsAdmin(admin.ModelAdmin):
    list_display = ('name', 'primary_contact_name', 'primary_contact_phone', 'office_phone', 'mailing_address')
    search_fields = ('name',)

@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display=('name', 'parent')

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display=('folder', 'name', 'file', 'uploaded_at')
    search_fields=('name',)
    
@admin.register(Pools)
class PoolsAdmin(admin.ModelAdmin):
    list_display=('id', 'commodity', 'description', 'openDate', 'closeDate')
    search_fields=('id',)