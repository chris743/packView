import React from 'react';

/**
 * Component for rendering a printable version of process plan data
 * 
 * @param {Object} props
 * @param {Array} props.data - The rows of data to display in the table
 * @param {Array} props.columns - Column definitions for the table
 * @param {string} props.date - The date for the process plan
 * @param {Object} props.summary - Summary data to display
 * @param {React.Ref} ref - Forwarded ref for printing
 */
const PrintableTable = React.forwardRef(({ data, columns, date, summary }, ref) => {
  // Format the current date and time
  const formattedDate = new Date().toLocaleString();
  
  // Filter columns to only show relevant ones for printing
  const printColumns = columns.filter(col => 
    !['actions', 'row_order', 'run_status'].includes(col.field) && col.field !== ''
  );
  
  return (
    <div className="print-container" ref={ref}>
      {/* Header */}
      <div className="print-header">
        <h2>Process Plan</h2>
        <div>
          <p>Run Date: {date}</p>
          <p>Printed: {formattedDate}</p>
        </div>
      </div>
      
      {/* Summary Section */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="summary-container">
          <h3>Run Summary</h3>
          <table className="summary-table">
            <tbody>
              {Object.entries(summary).map(([commodity, bins], index) => (
                index % 2 === 0 && (
                  <tr key={commodity}>
                    <td><b>{commodity}:</b></td>
                    <td>{bins} bins</td>
                    {Object.entries(summary)[index + 1] && (
                      <>
                        <td style={{ paddingLeft: '20px' }}><b>{Object.entries(summary)[index + 1][0]}:</b></td>
                        <td>{Object.entries(summary)[index + 1][1]} bins</td>
                      </>
                    )}
                  </tr>
                )
              )).filter(Boolean)}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Main Table */}
      <table className="data-table">
        <thead>
          <tr>
            {printColumns.map((column) => (
              <th key={column.field}>
                {column.headerName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {printColumns.map((column) => (
                <td key={`${row.id}-${column.field}`}>
                  {renderCellValue(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Footer */}
      <div className="print-footer">
        <span>Generated from Grower Portal</span>
        <span>Page 1</span>
      </div>
    </div>
  );
});

// Helper function to render cell values
const renderCellValue = (row, column) => {
  const value = row[column.field];
  
  // Handle special fields
  if (column.field === 'run_status') {
    return value || 'Not Started';
  }
  
  // Handle nested fields with dot notation
  if (column.field.includes('.')) {
    const parts = column.field.split('.');
    let currentValue = row;
    
    for (const part of parts) {
      if (currentValue && currentValue[part] !== undefined) {
        currentValue = currentValue[part];
      } else {
        // Try alternate notation
        const alternateKey = parts.join('.');
        return row[alternateKey] || '';
      }
    }
    
    return currentValue || '';
  }
  
  return value !== undefined && value !== null ? value : '';
};

export default PrintableTable;