from django.contrib import admin
from .models import Feedback, FeedbackResponse

class FeedbackResponseInline(admin.TabularInline):
    model = FeedbackResponse
    extra = 0

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_name', 'type', 'status', 'created_at')
    list_filter = ('type', 'status')
    search_fields = ('content', 'user_name')
    inlines = [FeedbackResponseInline]

@admin.register(FeedbackResponse)
class FeedbackResponseAdmin(admin.ModelAdmin):
    list_display = ('id', 'feedback', 'user_name', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'user_name')