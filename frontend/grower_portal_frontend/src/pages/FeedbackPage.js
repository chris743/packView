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
  useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import { API_URL, fetchData, createData, editData } from '../api/api';
import axios from 'axios';

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

  // Load feedback data
  const loadFeedback = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from your API
      // For now, we'll use localStorage as a simple data store
      const storedFeedback = localStorage.getItem('growerPortalFeedback');
      const feedbackItems = storedFeedback ? JSON.parse(storedFeedback) : [];
      
      // Sort by date descending (newest first)
      const sortedFeedback = feedbackItems.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setFeedback(sortedFeedback);
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
  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      setErrorMessage('Please enter your feedback before submitting.');
      return;
    }
    
    try {
      // Create new feedback item
      const newFeedback = {
        id: Date.now(), // Simple ID generation for demo
        user_id: currentUser.id,
        user_name: currentUser.name,
        content: feedbackText,
        type: feedbackType,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        responses: []
      };
      
      // Add to existing feedback
      const updatedFeedback = [newFeedback, ...feedback];
      
      // Save to localStorage (in production, you would save to your API)
      localStorage.setItem('growerPortalFeedback', JSON.stringify(updatedFeedback));
      
      // Update state
      setFeedback(updatedFeedback);
      setFeedbackText('');
      setSuccessMessage('Your feedback has been submitted successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrorMessage('Failed to submit feedback. Please try again.');
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
  const handleSubmitResponse = () => {
    if (!responseText.trim()) {
      setErrorMessage('Please enter a response before submitting.');
      return;
    }
    
    try {
      // Create new response
      const newResponse = {
        id: Date.now(),
        user_id: currentUser.id,
        user_name: currentUser.name,
        content: responseText,
        created_at: new Date().toISOString()
      };
      
      // Update the current feedback with the new response
      const updatedFeedback = feedback.map(item => {
        if (item.id === currentFeedback.id) {
          return {
            ...item,
            responses: [...item.responses, newResponse],
            updated_at: new Date().toISOString()
          };
        }
        return item;
      });
      
      // Save to localStorage
      localStorage.setItem('growerPortalFeedback', JSON.stringify(updatedFeedback));
      
      // Update state
      setFeedback(updatedFeedback);
      setSuccessMessage('Response added successfully!');
      handleCloseDialog();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error submitting response:', error);
      setErrorMessage('Failed to submit response. Please try again.');
    }
  };
  
  // Update feedback status (open/closed)
  const handleUpdateStatus = (feedbackId, newStatus) => {
    try {
      // Update the feedback status
      const updatedFeedback = feedback.map(item => {
        if (item.id === feedbackId) {
          return {
            ...item,
            status: newStatus,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      });
      
      // Save to localStorage
      localStorage.setItem('growerPortalFeedback', JSON.stringify(updatedFeedback));
      
      // Update state
      setFeedback(updatedFeedback);
      setSuccessMessage(`Feedback marked as ${newStatus}!`);
      
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
          />
          
          <Button 
            variant="contained" 
            endIcon={<SendIcon />}
            onClick={handleSubmitFeedback}
            disabled={!feedbackText.trim()}
          >
            Submit Feedback
          </Button>
        </Box>
      </Paper>
      
      {/* Feedback List */}
      <Typography variant="h6" gutterBottom>
        Your Feedback History
      </Typography>
      
      {isLoading ? (
        <Typography>Loading feedback...</Typography>
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
                        label={item.type.charAt(0).toUpperCase() + item.type.slice(1)} 
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
                    Submitted by {item.user_name} on {formatDate(item.created_at)}
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
                            Response from {response.user_name} on {formatDate(response.created_at)}
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
                From {currentFeedback.user_name} on {formatDate(currentFeedback.created_at)}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitResponse}
            variant="contained"
            disabled={!responseText.trim()}
          >
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackPage;