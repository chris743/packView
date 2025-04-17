import React from 'react';

const DiagnosticsStatusButton = ({ index, scannerId, scanner, printerId, printer, onClick }) => {
  const isScannerOk = scanner?.status === 'connected';
  const isPrinterOk = printer?.status === 'online' && !Object.values(printer?.details || {}).some(v => v === true || v === "1");

  const Dot = ({ ok }) => (
    <span
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: ok ? 'green' : 'red',
        marginLeft: 6
      }}
    />
  );

  return (
    <button onClick={() => onClick(index)} style={{ margin: '0.5rem', padding: '1rem', minWidth: '220px' }}>
      <div>
        🖨️ {printerId} <Dot ok={isPrinterOk} />
      </div>
      <div>
        📡 {scannerId} <Dot ok={isScannerOk} />
      </div>
    </button>
  );
};

export default DiagnosticsStatusButton;
