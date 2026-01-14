import React from 'react';
import './Report.css';

const Report = React.forwardRef(({ data, title }, ref) => {
  if (!data) {
    return null;
  }

  const { summary, tableData, columns } = data;

  return (
    <div ref={ref} className="report-container">
      <div className="report-header">
        <h1 className="report-title">{title}</h1>
      </div>

      {summary && (
        <div className="summary-section">
          <h2 className="section-title">Summary</h2>
          <div className="summary-grid">
            {Object.entries(summary).map(([key, value]) => (
              <div key={key} className="summary-item">
                <span className="summary-label">{key}</span>
                <span className="summary-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tableData && columns && (
        <div className="table-section">
          <h2 className="section-title">Details</h2>
          <table className="report-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.accessor}>{col.Header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col) => (
                    <td key={col.accessor}>{row[col.accessor]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="report-footer">
        <p>Generated on: {new Date().toLocaleDateString()}</p>
        <p>Inventory Management System</p>
      </div>
    </div>
  );
});

export default Report;
