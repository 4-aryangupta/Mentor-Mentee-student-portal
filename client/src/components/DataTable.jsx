import EmptyState from './EmptyState.jsx';
export default function DataTable({ columns, rows = [], rowKey = 'id', emptyTitle, emptyDescription, onRowClick }) {
  if (!rows.length) return <EmptyState title={emptyTitle || 'No records found'} description={emptyDescription || 'Try changing the filters or add a new record.'}/>;
  return <div className="table-scroll"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row[rowKey] ?? index} onClick={() => onRowClick?.(row)} className={onRowClick ? 'is-clickable' : ''}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}</tr>)}</tbody></table></div>;
}
