# Generated by Django 5.1.4 on 2025-01-15 18:12

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('grower_portal', '0023_remove_plannedharvest_harvest_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='receivings',
            name='date',
            field=models.DateField(null=True),
        ),
        migrations.AlterField(
            model_name='receivings',
            name='harvest',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='receivings', to='grower_portal.plannedharvest'),
        ),
    ]
