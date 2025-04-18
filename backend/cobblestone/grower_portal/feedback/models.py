from django.db import models

class Feedback(models.Model):
    user_id = models.CharField(max_length=50, null=True, blank=True)
    user_name = models.CharField(max_length=100, null=True, blank=True)
    content = models.TextField()
    type = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=20, default="open")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Feedback from {self.user_id} on {self.content}"
    
class FeedbackResponse(models.Model):
    feedback = models.ForeignKey(Feedback, on_delete=models.CASCADE, related_name='responses')
    user_id = models.CharField(max_length=50, null=True, blank=True)
    user_name = models.CharField(max_length=100, null=True, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response to {self.feedback.content[:30]}..."