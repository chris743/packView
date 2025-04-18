import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, Divider, Paper } from '@mui/material';
import { printerScannerData } from '../api/api';
import PrintIcon from '@mui/icons-material/Print';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PrinterDiagnostics = ({ isOpen, onClose, index = 0 }) => {
  const [status, setStatus] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(index); // Which pair to show

  useEffect(() => {
    // Reset to provided index when modal is opened
    if (isOpen) {
      setCurrentIndex(index);
    }
  }, [isOpen, index]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const data = await printerScannerData();
        setStatus(data);
      } catch (err) {
        console.error('Diagnostics fetch error:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;
  if (!status) return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <Typography variant="h6">Loading diagnostics...</Typography>
      </Box>
    </Modal>
  );

  const scannerKeys = Object.keys(status.scanners);
  const printerKeys = Object.keys(status.printers);
  const pairCount = Math.min(scannerKeys.length, printerKeys.length);
  
  // Validate index is in range
  const validIndex = Math.min(Math.max(0, currentIndex), pairCount - 1);
  const scannerId = scannerKeys[validIndex] || 'unknown';
  const printerId = printerKeys[validIndex] || 'unknown';
  const scanner = status.scanners[scannerId] || { status: 'disconnected', last_tag: null, last_seen: null };
  const printer = status.printers[printerId] || { status: 'offline', last_check: null, details: {} };

  const printerErrors = Object.entries(printer.details || {})
    .filter(([_, v]) => v === true || v === "1")
    .map(([k]) => k);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Diagnostics for Pair #{validIndex + 1}</Typography>
          <Button onClick={onClose} variant="outlined" size="small">Close</Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />

        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6"><QrCodeScannerIcon /> Scanner: {scannerId}</Typography>
          <Box sx={{ ml: 2, mt: 1 }}>
            <Typography>
              Status: <span style={{ color: scanner.status === 'connected' ? 'green' : 'red', fontWeight: 'bold' }}>
                {scanner.status}
              </span>
            </Typography>
            <Typography>Last Tag: {scanner.last_tag || '-'}</Typography>
            <Typography>
              Last Seen: {scanner.last_seen ? new Date(scanner.last_seen).toLocaleString() : '-'}
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6"><PrintIcon /> Printer: {printerId}</Typography>
          <Box sx={{ ml: 2, mt: 1 }}>
            <Typography>
              Status: <span style={{ color: printer.status === 'online' ? 'green' : 'red', fontWeight: 'bold' }}>
                {printer.status}
              </span>
            </Typography>
            <Typography>
              Last Check: {printer.last_check ? new Date(printer.last_check).toLocaleString() : '-'}
            </Typography>
            <Typography>
              Errors: <span style={{ color: printerErrors.length ? 'red' : 'green', fontWeight: 'bold' }}>
                {printerErrors.length ? printerErrors.join(', ') : <><CheckCircleIcon fontSize='small' 
                sx={{ verticalAlign: 'middle', color: 'green', mb: '3px' }}/> No Issues</>}
              </span>
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="contained" 
            onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))} 
            disabled={validIndex === 0}
          >
            Previous
          </Button>
          <Button 
            variant="contained"
            onClick={() => setCurrentIndex(i => Math.min(i + 1, pairCount - 1))} 
            disabled={validIndex === pairCount - 1}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PrinterDiagnostics;
