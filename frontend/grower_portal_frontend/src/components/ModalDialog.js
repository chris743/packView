import React from 'react';
import { 
  Modal, 
  Box, 
  Paper, 
  Typography, 
  Button,
  IconButton,
  Divider 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';

/**
 * Enhanced modal dialog component with a standardized layout
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Function to call when modal is closed
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.actions - Modal footer actions
 * @param {Object} props.sx - Additional styles to apply to the modal paper
 * @param {string} props.maxWidth - Maximum width of the modal
 * @param {boolean} props.fullWidth - Whether the modal should take full width
 * @param {boolean} props.disableBackdropClick - Whether clicking backdrop should close modal
 */
const ModalDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  sx = {},
  maxWidth = "600px",
  fullWidth = false,
  disableBackdropClick = false
}) => {
  const theme = useTheme();

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (disableBackdropClick) return;
    
    // Only close if the click was directly on the backdrop
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={disableBackdropClick ? undefined : onClose}
      onClick={handleBackdropClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        sx={{
          width: fullWidth ? '90%' : 'auto',
          maxWidth: maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[5],
          ...sx
        }}
      >
        {/* Modal header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ color: theme.palette.primary.contrastText }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        {/* Modal content */}
        <Box
          sx={{
            p: 3,
            flexGrow: 1,
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
        
        {/* Modal footer with actions */}
        {actions && (
          <>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                p: 2,
                gap: 1,
              }}
            >
              {actions}
            </Box>
          </>
        )}
      </Paper>
    </Modal>
  );
};

export default ModalDialog;