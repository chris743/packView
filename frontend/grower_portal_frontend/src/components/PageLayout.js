import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * PageLayout - A reusable component for consistent page layouts
 * 
 * @param {Object} props
 * @param {string} props.title - The page title
 * @param {React.ReactNode} props.headerActions - Actions to display in the header (buttons, etc.)
 * @param {React.ReactNode} props.children - Page content
 * @param {boolean} props.loading - Whether the page is loading
 * @param {string} props.error - Error message to display
 * @param {Object} props.sx - Additional styles to apply to the container
 */
const PageLayout = ({ 
  title, 
  headerActions, 
  children, 
  loading = false, 
  error = null,
  sx = {}
}) => {
  const theme = useTheme();

  return (
    <Box 
      sx={{
        p: 3,
        maxWidth: '1400px',
        mx: 'auto',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        ...sx
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h4" component="h1">{title}</Typography>
        {headerActions && (
          <Box>
            {headerActions}
          </Box>
        )}
      </Box>

      {error && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: theme.palette.error.light,
            color: theme.palette.error.contrastText
          }}
        >
          <Typography>{error}</Typography>
        </Paper>
      )}

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 8
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        children
      )}
    </Box>
  );
};

export default PageLayout;