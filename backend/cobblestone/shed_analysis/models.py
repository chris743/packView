from django.db import models

# Create your models here.
class Orders(models.Model):
    line_id = models.CharField(max_length=100, primary_key=True)  # Primary Key
    order_quantity = models.IntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)  # Timestamp for when the record is created
    import_id = models.IntegerField(null=True, blank=True)
    sales_order_date = models.DateField(null=True, blank=True)
    reserved = models.IntegerField(null=True, blank=True)  # Optional field
    ship_date = models.DateField(null=True, blank=True)
    original_ship_date = models.DateField(null=True, blank=True)
    commodity_id = models.CharField(max_length=50, null=True, blank=True)
    style_id = models.CharField(max_length=50,null=True, blank=True)
    size_id = models.CharField(max_length=50,null=True, blank=True)
    grade_id = models.CharField(max_length=50,null=True, blank=True)
    label_id = models.CharField(max_length=50,null=True, blank=True)
    region_id = models.CharField(max_length=50,null=True, blank=True)
    method_id = models.CharField(max_length=50,null=True, blank=True)
    storage_id = models.CharField(max_length=50,null=True, blank=True)
    color_id = models.CharField(max_length=50,null=True, blank=True)
    flag = models.CharField(max_length=50, null=True, blank=True)
    warehouse_location = models.CharField(max_length=100, null=True, blank=True)
    shipped_status = models.CharField(max_length=50, null=True, blank=True)
    customer = models.CharField(max_length=100, null=True, blank=True)
    ship_to_location = models.CharField(max_length=100, null=True, blank=True)
    sales_order_number = models.CharField(max_length=50, null=True, blank=True)
    salesperson = models.CharField(max_length=100, null=True, blank=True)
    customer_po_number = models.CharField(max_length=50, null=True, blank=True)
    filled_quantity = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"Order {self.sales_order_number} ({self.line_id})"


class BinInventory(models.Model):
    size_id = models.CharField(max_length=50,null=True, blank=True)
    on_hand_quantity = models.FloatField(null=True, blank=True)
    import_id = models.BigIntegerField(null=True, blank=True)
    grade_id = models.CharField(max_length=50,null=True, blank=True)
    variety_id = models.CharField(max_length=50,null=True, blank=True)
    commodity_id = models.CharField(max_length=50,null=True, blank=True)
    first_receive_date = models.CharField(max_length=50,null=True, blank=True)
    warehouse_location = models.CharField(max_length=50,null=True, blank=True)
    company = models.CharField(max_length=50,null=True, blank=True)
    commodity_id_1 = models.CharField(max_length=50,null=True, blank=True, db_column='commodity_id.1')
    grade_id_1 = models.CharField(max_length=50,null=True, blank=True, db_column='grade_id.1')
    style_id = models.CharField(max_length=50,null=True, blank=True)
    method_id = models.CharField(max_length=50,null=True, blank=True)
    room_row_id = models.CharField(max_length=50,null=True, blank=True)
    tag_id = models.CharField(max_length=50, primary_key=True, null=False, blank=False)
    region_id = models.CharField(max_length=50,null=True, blank=True)

    def __str__(self):
        return f"Order {self.tag_id} ({self.commodity_id})"
    
class packs_completed(models.Model):
    outlet = models.CharField(max_length=50, null=True, blank=True)
    batch = models.CharField(max_length=50, null=True, blank=True)
    payload = models.TextField(null=True, blank=True)
    timestamp = models.CharField(max_length=50,null=False, blank=False, primary_key=True)
    created = models.DateTimeField(auto_now_add=True, null=True, blank=True)  # Timestamp for when the record is created

    class Meta:
        managed = False  # No migrations will be created for this model
        db_table = 'production"."packs_completed'  # Specify the name of the table in the database
        app_label = 'packs-completed'  # Specify the app label for this model

class scanned_tags(models.Model):
    scanner_id = models.CharField(max_length=50, null=True, blank=True)
    tag_id = models.CharField(max_length=50, null=True, blank=True)
    block_id = models.CharField(max_length=50, null=True, blank=True)
    pool_id = models.CharField(max_length=50, null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    scanned_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)  # Timestamp for when the record is created

    class Meta:
        managed = False
        db_table = 'production"."scanned_tags'
        app_label = 'scanned-tags'