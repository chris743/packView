# Generated by Django 5.1.4 on 2025-04-01 18:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('grower_portal', '0003_rename_planted_variety_block_crop_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='block',
            name='gib_applied',
        ),
    ]
