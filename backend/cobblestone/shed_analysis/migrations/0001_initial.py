# Generated by Django 5.1.4 on 2024-12-20 17:48

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('line_id', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('order_quantity', models.IntegerField()),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('import_id', models.IntegerField()),
                ('sales_order_date', models.DateField()),
                ('reserved', models.IntegerField(blank=True, null=True)),
                ('ship_date', models.DateField()),
                ('commodity_id', models.CharField(max_length=50)),
                ('style_id', models.CharField(max_length=50)),
                ('size_id', models.CharField(max_length=50)),
                ('grade_id', models.CharField(max_length=50)),
                ('label_id', models.CharField(max_length=50)),
                ('region_id', models.CharField(max_length=50)),
                ('method_id', models.CharField(max_length=50)),
                ('storage_id', models.CharField(max_length=50)),
                ('color_id', models.CharField(max_length=50)),
                ('flag', models.CharField(blank=True, max_length=50, null=True)),
                ('warehouse_location', models.CharField(max_length=100)),
                ('shipped_status', models.CharField(blank=True, max_length=50, null=True)),
                ('customer', models.CharField(max_length=100)),
                ('ship_to_location', models.CharField(max_length=100)),
                ('sales_order_number', models.CharField(max_length=50)),
                ('salesperson', models.CharField(blank=True, max_length=100, null=True)),
                ('customer_po_number', models.CharField(blank=True, max_length=50, null=True)),
            ],
        ),
    ]