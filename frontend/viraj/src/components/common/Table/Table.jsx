import React from 'react';
import './Table.css';

export const Table = ({
  columns = [],
  data = [],
  keyExtractor = (item, index) => item.id || index,
  emptyMessage = 'No records found',
  className = '',
  onRowClick,
}) => {
  return (
    <div className={`table-responsive ${className}`}>
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{ width: col.width, textAlign: col.align || 'left' }}
                className="table-th"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty-cell">
                <div className="table-empty-state">
                  <span className="table-empty-text">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={keyExtractor(row, rowIdx)}
                className={`table-row ${onRowClick ? 'table-row-clickable' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    style={{ textAlign: col.align || 'left' }}
                    className="table-td"
                  >
                    {col.render ? col.render(row[col.dataIndex], row, rowIdx) : row[col.dataIndex]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
