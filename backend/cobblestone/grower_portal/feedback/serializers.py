from rest_framework import serializers
from .models import Feedback, FeedbackResponse

class FeedbackResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackResponse
        fields = ['id', 'feedback', 'user_id', 'user_name', 'content', 'created_at']

class FeedbackSerializer(serializers.ModelSerializer):
    responses = FeedbackResponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Feedback
        fields = ['id', 'user_id', 'user_name', 'content', 'type', 'status', 
                  'created_at', 'updated_at', 'responses']
        read_only_fields = ['created_at', 'updated_at']