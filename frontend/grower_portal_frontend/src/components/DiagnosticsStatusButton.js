import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/InfoSharp';

/**
 * DiagnosticsStatusButton component for displaying scanner and printer status
 * with a button to open detailed diagnostics.
 * 
 * @param {number} index - Index of the diagnostics pair to show
 * @param {string} scannerId - ID of the scanner
 * @param {object} scanner - Scanner status object
 * @param {string} printerId - ID of the printer
 * @param {object} printer - Printer status object
 * @param {function} onClick - Handler for clicking the button
 */
const DiagnosticsStatusButton = ({ index, scannerId, scanner, printerId, printer, onClick }) => {
  const isScannerOk = scanner?.status === 'connected';
  const isPrinterOk = printer?.status === 'online' && 
    !Object.values(printer?.details || {}).some(v => v === true || v === "1");

  // Get status message for tooltip
  const getStatusMessage = () => {
    const scannerMsg = isScannerOk ? 'Scanner connected' : 'Scanner disconnected';
    const printerMsg = isPrinterOk ? 'Printer online' : 'Printer has issues';
    return `Diagnostics: ${scannerMsg}, ${printerMsg}`;
  };

  // Determine button color based on status
  const getButtonColor = () => {
    if (isScannerOk && isPrinterOk) return 'success.main';
    if (!isScannerOk && !isPrinterOk) return 'error.main';
    return 'warning.main';
  };

  return (
    <Tooltip title={getStatusMessage()} arrow>
      <IconButton 
        onClick={() => onClick(index)} 
        size="small"
        sx={{ 
          color: 'white',
          backgroundColor: getButtonColor(),
          '&:hover': {
            backgroundColor: getButtonColor(),
            opacity: 0.9
          },
          width: 28,
          height: 28
        }}
      >
        <InfoIcon />
      </IconButton>
    </Tooltip>
  );
};

export default DiagnosticsStatusButton;
