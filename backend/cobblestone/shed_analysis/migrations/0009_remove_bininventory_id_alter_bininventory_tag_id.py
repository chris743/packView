# Generated by Django 5.1.4 on 2024-12-24 22:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shed_analysis', '0008_alter_bininventory_commodity_id_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='bininventory',
            name='id',
        ),
        migrations.AlterField(
            model_name='bininventory',
            name='tag_id',
            field=models.CharField(default=0, max_length=50, primary_key=True, serialize=False),
            preserve_default=False,
        ),
    ]