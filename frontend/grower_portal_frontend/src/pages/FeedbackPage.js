import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Dialog, 
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  useTheme,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import { 
  fetchFeedback, 
  createFeedback, 
  updateFeedbackStatus,
  addFeedbackResponse
} from '../api/api';

/**
 * FeedbackPage component
 * Allows users to submit feedback, view submitted feedback, and track responses
 */
const FeedbackPage = () => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // User info (in a real app, this would come from authentication)
  const currentUser = {
    id: 1,
    name: 'Current User',
    isAdmin: true // Toggle this to test admin vs. regular user view
  };

  // Load feedback data from API
  const loadFeedback = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Fetch feedback data from the API
      const feedbackData = await fetchFeedback();
      console.log('Loaded feedback data:', feedbackData);
      
      // Set feedback state
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Error loading feedback:', error);
      setErrorMessage('Failed to load feedback items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    loadFeedback();
  }, []);
  
  // Handle submitting new feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      setErrorMessage('Please enter your feedback before submitting.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // Create feedback data object
      const feedbackData = {
        user_id: currentUser.id.toString(),
        user_name: currentUser.name,
        content: feedbackText,
        type: feedbackType,
        status: 'open'
      };
      
      console.log('Submitting feedback:', feedbackData);
      
      // Send to API
      await createFeedback(feedbackData);
      
      // Clear form and show success message
      setFeedbackText('');
      setSuccessMessage('Your feedback has been submitted successfully!');
      
      // Reload feedback to include the new item
      await loadFeedback();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrorMessage('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Open response dialog
  const handleOpenResponseDialog = (feedbackItem) => {
    setCurrentFeedback(feedbackItem);
    setResponseText('');
    setOpenDialog(true);
  };
  
  // Close response dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentFeedback(null);
    setResponseText('');
  };
  
  // Submit a response to feedback
  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      setErrorMessage('Please enter a response before submitting.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // Prepare response data
      const responseData = {
        user_id: currentUser.id.toString(),
        user_name: currentUser.name,
        content: responseText,
        response: responseText // Include both fields for compatibility
      };
      
      console.log('Submitting response:', responseData);
      
      // Send response to API
      await addFeedbackResponse(currentFeedback.id, responseData);
      
      // Show success message
      setSuccessMessage('Response added successfully!');
      
      // Close dialog and reload feedback
      handleCloseDialog();
      await loadFeedback();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error submitting response:', error);
      setErrorMessage('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update feedback status (open/closed)
  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      // Send status update to API
      await updateFeedbackStatus(feedbackId, newStatus);
      
      // Show success message
      setSuccessMessage(`Feedback marked as ${newStatus}!`);
      
      // Reload feedback data
      await loadFeedback();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error updating feedback status:', error);
      setErrorMessage('Failed to update status. Please try again.');
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get color for feedback type
  const getTypeColor = (type) => {
    switch (type) {
      case 'bug':
        return 'error';
      case 'suggestion':
        return 'primary';
      case 'feature':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Feedback & Suggestions
      </Typography>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>
      )}
      
      {/* Feedback Submission Form */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Submit Feedback
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="feedback-type-label">Type</InputLabel>
            <Select
              labelId="feedback-type-label"
              id="feedback-type"
              value={feedbackType}
              label="Type"
              onChange={(e) => setFeedbackType(e.target.value)}
              disabled={isSubmitting}
            >
              <MenuItem value="suggestion">Suggestion</MenuItem>
              <MenuItem value="bug">Bug Report</MenuItem>
              <MenuItem value="feature">Feature Request</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            id="feedback-text"
            label="Your Feedback"
            multiline
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            sx={{ mb: 2 }}
            disabled={isSubmitting}
          />
          
          <Button 
            variant="contained" 
            endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleSubmitFeedback}
            disabled={!feedbackText.trim() || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </Box>
      </Paper>
      
      {/* Feedback List */}
      <Typography variant="h6" gutterBottom>
        Your Feedback History
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : feedback.length > 0 ? (
        <List>
          {feedback.map((item) => (
            <Paper key={item.id} sx={{ mb: 2, overflow: 'hidden' }}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  borderLeft: `4px solid ${theme.palette[getTypeColor(item.type)].main}`,
                  backgroundColor: item.status === 'closed' ? '#f5f5f5' : 'white'
                }}
              >
                <Box sx={{ width: '100%' }}>
                  {/* Feedback Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Chip 
                        label={item.type?.charAt(0).toUpperCase() + item.type?.slice(1) || 'Unknown'} 
                        color={getTypeColor(item.type)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={item.status === 'open' ? 'Open' : 'Closed'} 
                        color={item.status === 'open' ? 'warning' : 'default'}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    
                    {/* Admin Controls */}
                    {currentUser.isAdmin && (
                      <Box>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenResponseDialog(item)}
                          title="Respond"
                        >
                          <ReplayIcon fontSize="small" />
                        </IconButton>
                        
                        {item.status === 'open' ? (
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleUpdateStatus(item.id, 'closed')}
                            title="Mark as Closed"
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleUpdateStatus(item.id, 'open')}
                            title="Reopen"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    )}
                  </Box>
                  
                  {/* Feedback Content */}
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {item.content}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    Submitted by {item.user_name || 'Anonymous'} on {formatDate(item.created_at)}
                  </Typography>
                  
                  {/* Responses Section */}
                  {item.responses && item.responses.length > 0 && (
                    <Box sx={{ mt: 2, ml: 2, pl: 2, borderLeft: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Responses:
                      </Typography>
                      
                      {item.responses.map((response) => (
                        <Box key={response.id} sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            {response.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Response from {response.user_name || 'Staff'} on {formatDate(response.created_at)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No feedback submitted yet. Be the first to share your thoughts!
          </Typography>
        </Paper>
      )}
      
      {/* Response Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Respond to Feedback</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You are responding to:
          </DialogContentText>
          
          {currentFeedback && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
              <Typography variant="body2">
                {currentFeedback.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                From {currentFeedback.user_name || 'Anonymous'} on {formatDate(currentFeedback.created_at)}
              </Typography>
            </Paper>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="response"
            label="Your Response"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleSubmitResponse}
            variant="contained"
            disabled={!responseText.trim() || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Response'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackPage;