from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save
import uuid
import os
class Grower(models.Model):
    name = models.CharField(max_length=255)
    grower_id = models.IntegerField(null=True, blank=True)
    grower_contact = models.CharField(blank=True, max_length=200)
    grower_contact_email = models.EmailField(blank=True, null=True)
    grower_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    contract = models.FileField(upload_to="./grower_contracts", null=True, blank=True)
    property_manger_name = models.CharField(max_length=255, null=True, blank=True)
    property_manager_phone = models.CharField(max_length=255, null=True, blank=True)
    property_manager_email = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.name


class Ranch(models.Model):
    name = models.CharField(max_length=255)
    grower = models.ForeignKey(Grower, on_delete=models.CASCADE, related_name="togrower")
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.grower.name})"

class Commodity (models.Model):
    id = models.CharField(max_length=30, blank=False, unique=True, primary_key=True)
    avgCtnPrice = models.FloatField(null=True, blank=True, default=0)
    stdCtnCost = models.FloatField(null=True, blank=True, default=0)
    pricePerPound = models.FloatField(null=True, blank=True, default=0)
    standardCtnWeight = models.FloatField(null=True, blank=True, default=0)
    packingCharge = models.FloatField(null=True, blank=True, default=0)
    profitPerBag = models.FloatField(null=True, blank=True, default=0)
    promo = models.FloatField(null=True, blank=True, default=0)

    def __str__(self):
        return f"{self.id}"
    
    
class Varieties (models.Model):
    id = models.CharField(max_length=30, blank=False, null=False, unique=True, primary_key=True)
    commodity = models.ForeignKey(Commodity, on_delete=models.CASCADE, related_name="varietytocommodity")
    
    def __str__(self):
        return self.id
    
class Pools (models.Model):
    id = models.CharField(unique=True, primary_key=True, max_length=15)
    commodity = models.ForeignKey(Commodity, on_delete=models.CASCADE, related_name="pooltocommodity")
    description = models.TextField(null=True, blank=True)
    openDate = models.DateField()
    closeDate = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.id}"

class Block(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True, unique=True)
    block_id = models.IntegerField(null=False, blank=False, unique=True, primary_key=True, default=0)
    krpc_id = models.IntegerField(null=True, blank=True)
    ranch = models.ForeignKey(Ranch, on_delete=models.CASCADE, related_name="toranch")
    size = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  # e.g., acres
    variety = models.ForeignKey(Varieties, on_delete=models.CASCADE, related_name="tovariety")
    tree_spacing = models.DecimalField(max_digits=10, null=True, blank=True, decimal_places=2)
    row_spacing = models.DecimalField(max_digits=10, null=True, blank=True, decimal_places=2)

    def __str__(self):
        return f"{self.name} ({self.ranch.name})"
    
    
class ProductionRuns(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False, max_length=36)
    grower_block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name="production_runs")  # Unique related_name
    bins = models.IntegerField(null=False, default=0)
    run_date = models.DateField(null=True)
    pick_date = models.DateField(null=True)
    location = models.CharField(null=True, blank=True)
    pool = models.CharField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    row_order = models.IntegerField(null=True, blank=True)
    run_status = models.CharField(null=True, blank=True)
    batch_id = models.CharField(null=True, blank=True, max_length=50)
    time_started = models.DateTimeField(null=True, blank=True)
    time_completed = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.grower_block}-{self.run_date}"
    
class SizerReport(models.Model):
    process_run = models.OneToOneField(ProductionRuns, on_delete=models.CASCADE, related_name="sizer_data")
    raw_JSON=models.JSONField(null=True, blank=True)
    imported_at=models.DateTimeField(auto_now_add=True, null=True)
    
class LaborContractors(models.Model):
    name = models.CharField(null=False, max_length=100)
    primary_contact_name = models.CharField(null=False, max_length=50)
    primary_contact_phone = models.IntegerField(null=True)
    office_phone = models.IntegerField(null=True)
    mailing_address = models.CharField(null=True, max_length=100)

class TruckingContractors(models.Model):
    name = models.CharField(null=False, max_length=100)
    primary_contact_name = models.CharField(null=False, max_length=50)
    primary_contact_phone = models.IntegerField(null=True)
    office_phone = models.IntegerField(null=True)
    mailing_address = models.CharField(null=True, max_length=100)

class FieldContractors(models.Model):
    name = models.CharField(null=False, max_length=100)
    primary_contact_name = models.CharField(null=False, max_length=50)
    primary_contact_phone = models.IntegerField(null=True)
    office_phone = models.IntegerField(null=True)
    mailing_address = models.CharField(null=True, max_length=100)
    provides_trucking = models.BooleanField(null=True, blank=True)
    provides_picking = models.BooleanField(null=True)
    provides_forklift = models.BooleanField(null=True)

    def __str__(self):
        return self.name


class PlannedHarvest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False, max_length=36)
    grower_block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name="planned_harvests")  # Unique related_name
    planned_bins = models.IntegerField(null=True, default=0)
    contractor = models.ForeignKey(FieldContractors, on_delete=models.CASCADE, related_name='labor_contractors', null=True)
    harvesting_rate = models.FloatField(null=True)
    hauler = models.ForeignKey(FieldContractors, on_delete=models.CASCADE, related_name='trucking_company', null=True)
    hauling_rate = models.FloatField(null=True)
    forklift_contractor = models.ForeignKey(FieldContractors, on_delete=models.CASCADE, related_name="forklift_contractor", null=True)
    forklift_rate = models.FloatField(null=True)
    pool = models.ForeignKey(Pools, on_delete=models.CASCADE, related_name="harvest_pool")
    notes_general = models.TextField(null=True, blank=True)
    deliver_to = models.CharField(null=True, default="CF", max_length=30)
    packed_by = models.CharField(null=True, default="CF", max_length=30)

    def __str__(self):
        return f"{self.grower_block}"
    
class HarvestPlansDate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False, max_length=36)
    harvest_plan = models.ForeignKey(PlannedHarvest, related_name="dates", on_delete=models.CASCADE)
    date=models.DateField()
    estimated_bins=models.IntegerField()

    def __str__(self):
        return f"{self.date} - {self.estimated_bins} bins"

class Receivings (models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True, editable=False, max_length=36)
    receipt_id = models.CharField(null=False, max_length=20)
    harvest = models.ForeignKey(PlannedHarvest, on_delete=models.CASCADE, related_name="receivings")
    qty_received = models.IntegerField(null=False)
    date=models.DateField(auto_now_add=True, null=True)
    created_timestamp=models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"{self.harvest} - {self.receipt_id}"

def file_upload_path(instance, filename):
    if instance.folder:
        return os.path.join("storage", instance.folder.get_full_path(), filename)
    return os.path.join("storage", filename)

class Folder(models.Model):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    grower = models.ForeignKey(Grower, on_delete=models.CASCADE, related_name='folders')  # Link folder to grower

    def __str__(self):
        return self.name

    def get_full_path(self):
        """ Recursively build the folder path. """
        if self.parent:
            return os.path.join(self.parent.get_full_path(), self.name)
        return self.name
@receiver(post_save, sender=Grower)
def create_root_folder_for_grower(sender, instance, created, **kwargs):
    if created:
        Folder.objects.create(name=f"{instance.name}_root", grower=instance, parent=None)   


class File(models.Model):
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='files', null=True, blank=True)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=file_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    