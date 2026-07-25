import React from 'react';
import './Report.css';

const Report = React.forwardRef(({ data, title }, ref) => {
  if (!data) {
    return null;
  }

  const { summary, tableData, columns } = data;

  return (
    <div ref={ref} className="report-container">
      {/* Header Banner */}
      <div className="report-header">
        <div className="institute-header">
          <img src="/sgi_logo.png" alt="SGI Logo" className="institute-logo" />
          <div className="institute-info">
            <div className="institute-name">SANJAY GHODAWAT INSTITUTE</div>
            <div className="institute-subtext">Approved by A.I.C.T.E. New Delhi, and Recognized by DTE Mumbai, Govt. of Maharashtra</div>
          </div>
        </div>
        <div className="header-divider"></div>
        <div className="report-title-bar">
          <h1 className="report-title">{title}</h1>
          <span className="report-date">Generated on: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Summary Metrics */}
      {summary && (
        <div className="summary-section">
          <h2 className="section-title">Summary Overview</h2>
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

      {/* Main Details Table */}
      {tableData && columns && (
        <div className="table-section">
          <h2 className="section-title">Detailed Records</h2>
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
                    <td key={col.accessor}>{row[col.accessor] !== undefined && row[col.accessor] !== null ? row[col.accessor] : 'N/A'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Footer */}
      <div className="report-footer">
        <p>Inventory Management System • Official Record</p>
        <p>Page 1 of 1</p>
      </div>
    </div>
  );
});

export default Report;
