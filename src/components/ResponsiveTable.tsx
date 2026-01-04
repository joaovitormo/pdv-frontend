import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  className?: string;
  condition?: (row: T) => boolean;
}

interface ResponsiveTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: TableAction<T>[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  emptyMessage?: string;
  getRowKey: (row: T) => string | number;
}

export const ResponsiveTable = <T extends object>({
  columns,
  data,
  actions,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  emptyMessage = 'Nenhum item encontrado',
  getRowKey,
}: ResponsiveTableProps<T>) => {
  const startIdx = (currentPage - 1) * itemsPerPage;

  return (
    <div className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                    >
                      {column.label}
                    </th>
                  ))}
                  {actions && actions.length > 0 && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={getRowKey(row)} className="border-b border-gray-200 hover:bg-gray-50">
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={`px-6 py-4 text-sm text-gray-900 ${column.className || ''}`}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key])}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        {actions
                          .filter((action) => !action.condition || action.condition(row))
                          .map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => action.onClick(row)}
                              className={`p-2 rounded flex items-center space-x-1 ${
                                action.className || 'text-blue-600 hover:bg-blue-100'
                              }`}
                              title={action.label}
                            >
                              {action.icon && <span>{action.icon}</span>}
                            </button>
                          ))}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg">
            {emptyMessage}
          </div>
        ) : (
          data.map((row) => (
            <div key={getRowKey(row)} className="bg-white rounded-lg shadow p-4 space-y-3">
              {columns.map((column) => (
                <div key={String(column.key)} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">{column.label}</span>
                  <span className="text-sm text-gray-900 text-right">
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key])}
                  </span>
                </div>
              ))}
              {actions && actions.length > 0 && (
                <div className="border-t border-gray-200 pt-3 flex space-x-2">
                  {actions
                    .filter((action) => !action.condition || action.condition(row))
                    .map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => action.onClick(row)}
                        className={`flex-1 px-3 py-2 text-sm rounded flex items-center justify-center space-x-1 ${
                          action.className || 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                        title={action.label}
                      >
                        {action.icon && <span>{action.icon}</span>}
                        <span>{action.label}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          {/* Mobile Pagination */}
          <div className="md:hidden flex items-center justify-between gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-sm text-gray-600 text-center flex-1">
              Página {currentPage} de {totalPages}
            </div>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Desktop Pagination */}
          <div className="hidden md:flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {startIdx + 1} a {Math.min(startIdx + itemsPerPage, data.length)} de{' '}
                {data.length} itens
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
