import React, { useEffect, useState } from 'react';

const DiagnosticsModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState(null);
  const [index, setIndex] = useState(0); // Which pair to show

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = () => {
      fetch('http://<YOUR-FLASK-IP>:5001/status')
        .then(res => res.json())
        .then(data => setStatus(data))
        .catch(err => console.error('Diagnostics fetch error:', err));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;
  if (!status) return <div className="modal">Loading diagnostics...</div>;

  const scannerKeys = Object.keys(status.scanners);
  const printerKeys = Object.keys(status.printers);
  const pairCount = Math.min(scannerKeys.length, printerKeys.length);
  const scannerId = scannerKeys[index];
  const printerId = printerKeys[index];
  const scanner = status.scanners[scannerId];
  const printer = status.printers[printerId];

  const printerErrors = Object.entries(printer.details || {})
    .filter(([_, v]) => v === true || v === "1")
    .map(([k]) => k);

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Diagnostics for Pair #{index + 1}</h2>
        <button onClick={onClose} style={{ float: 'right' }}>✖️ Close</button>

        <div>
          <h3>📡 Scanner: {scannerId}</h3>
          <p>Status: <span style={{ color: scanner.status === 'connected' ? 'green' : 'red' }}>{scanner.status}</span></p>
          <p>Last Tag: {scanner.last_tag || '-'}</p>
          <p>Last Seen: {scanner.last_seen ? new Date(scanner.last_seen).toLocaleString() : '-'}</p>
        </div>

        <div>
          <h3>🖨️ Printer: {printerId}</h3>
          <p>Status: <span style={{ color: printer.status === 'online' ? 'green' : 'red' }}>{printer.status}</span></p>
          <p>Last Check: {printer.last_check ? new Date(printer.last_check).toLocaleString() : '-'}</p>
          <p>Errors: <span style={{ color: printerErrors.length ? 'red' : 'green' }}>
            {printerErrors.length ? printerErrors.join(', ') : '✅ No Issues'}
          </span></p>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button onClick={() => setIndex(i => Math.max(i - 1, 0))} disabled={index === 0}>⬅ Prev</button>
          <button onClick={() => setIndex(i => Math.min(i + 1, pairCount - 1))} disabled={index === pairCount - 1}>Next ➡</button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsModal;
