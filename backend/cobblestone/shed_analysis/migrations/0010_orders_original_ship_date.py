# Generated by Django 5.1.4 on 2025-02-18 22:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shed_analysis', '0009_remove_bininventory_id_alter_bininventory_tag_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='orders',
            name='original_ship_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
