from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Feedback, FeedbackResponse
from .serializers import FeedbackSerializer, FeedbackResponseSerializer

class FeedbackViewSet(viewsets.ModelViewSet):
    """
    API endpoint for feedback management
    """
    queryset = Feedback.objects.all().order_by('-created_at')
    serializer_class = FeedbackSerializer
    
    @action(detail=True, methods=['post'])
    def add_response(self, request, pk=None):
        """
        Add a response to a specific feedback
        """
        try:
            feedback = self.get_object()
            
            # Log request data for debugging
            print(f"Add response request data: {request.data}")
            
            # Create response with content from either content or response field
            content = request.data.get('content', request.data.get('response', ''))
            
            response_data = {
                'feedback': feedback.id,
                'user_id': request.data.get('user_id'),
                'user_name': request.data.get('user_name'),
                'content': content
            }
            
            # Log response data for debugging
            print(f"Creating response with data: {response_data}")
            
            serializer = FeedbackResponseSerializer(data=response_data)
            if serializer.is_valid():
                response_obj = serializer.save()
                print(f"Response created successfully with ID: {response_obj.id}")
                
                # Refresh the feedback object to get the latest responses
                feedback = Feedback.objects.get(pk=feedback.pk)
                
                # Return the updated feedback with responses
                feedback_serializer = FeedbackSerializer(feedback)
                return Response(feedback_serializer.data)
            else:
                print(f"Serializer validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error in add_response: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Update the status of a feedback item
        """
        feedback = self.get_object()
        status_value = request.data.get('status')
        
        if status_value not in ['open', 'closed']:
            return Response(
                {'error': 'Status must be "open" or "closed"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        feedback.status = status_value
        feedback.save()
        
        serializer = FeedbackSerializer(feedback)
        return Response(serializer.data)

class FeedbackResponseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for feedback responses
    """
    queryset = FeedbackResponse.objects.all().order_by('-created_at')
    serializer_class = FeedbackResponseSerializer