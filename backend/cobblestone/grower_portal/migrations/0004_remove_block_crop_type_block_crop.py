# Generated by Django 5.1.4 on 2024-12-10 00:31

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('grower_portal', '0003_commodity'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='block',
            name='crop_type',
        ),
        migrations.AddField(
            model_name='block',
            name='crop',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, related_name='commodities', to='grower_portal.commodity'),
            preserve_default=False,
        ),
    ]
