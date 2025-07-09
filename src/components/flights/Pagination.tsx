'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalResults: number;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
  onResultsPerPageChange?: (resultsPerPage: number) => void;
  loading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalResults,
  resultsPerPage,
  onPageChange,
  onResultsPerPageChange,
  loading = false
}) => {
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="pagination-wrapper">
      <div className="d-flex align-items-center justify-content-between flex-wrap mb-4">
        <div className="pagination-info">
          <p className="mb-0 text-muted">
            Showing {startResult} - {endResult} of {totalResults} results
          </p>
        </div>
        
        <nav aria-label="Flight results pagination">
          <ul className="pagination pagination-sm mb-0">
            {/* Previous button */}
            <li className={`page-item ${currentPage === 1 || loading ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                aria-label="Previous"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </li>

            {/* Page numbers */}
            {visiblePages.map((page, index) => (
              <li
                key={index}
                className={`page-item ${
                  page === currentPage ? 'active' : ''
                } ${page === '...' ? 'disabled' : ''} ${loading ? 'disabled' : ''}`}
              >
                {page === '...' ? (
                  <span className="page-link">...</span>
                ) : (
                  <button
                    className="page-link"
                    onClick={() => handlePageClick(page)}
                    disabled={loading}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )}
              </li>
            ))}

            {/* Next button */}
            <li className={`page-item ${currentPage === totalPages || loading ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                aria-label="Next"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Results per page selector */}
      <div className="d-flex align-items-center justify-content-center">
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0 text-muted small">Results per page:</label>
          <select
            className="form-select form-select-sm"
            value={resultsPerPage}
            onChange={(e) => {
              const newResultsPerPage = parseInt(e.target.value);
              if (onResultsPerPageChange) {
                onResultsPerPageChange(newResultsPerPage);
              } else {
                const newPage = Math.ceil(((currentPage - 1) * resultsPerPage + 1) / newResultsPerPage);
                onPageChange(newPage);
              }
            }}
            disabled={loading}
            style={{ width: 'auto' }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center mt-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <small className="text-muted ms-2">Loading results...</small>
        </div>
      )}
    </div>
  );
}; 