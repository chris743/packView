from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Feedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_id', models.CharField(blank=True, max_length=50, null=True)),
                ('user_name', models.CharField(blank=True, max_length=100, null=True)),
                ('content', models.TextField()),
                ('type', models.CharField(blank=True, max_length=50, null=True)),
                ('status', models.CharField(default='open', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='FeedbackResponse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_id', models.CharField(blank=True, max_length=50, null=True)),
                ('user_name', models.CharField(blank=True, max_length=100, null=True)),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('feedback', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='responses', to='feedback.feedback')),
            ],
        ),
    ]