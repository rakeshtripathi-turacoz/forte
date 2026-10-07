import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api.config';

const API_URL = API_CONFIG.API_URL;

const EmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    email_type: '',
    from_date: '',
    to_date: '',
    search: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    total_pages: 0
  });

  const [emailTypes, setEmailTypes] = useState([]);
  const [selectedLogs, setSelectedLogs] = useState([]);

  useEffect(() => {
    loadLogs();
    loadStatistics();
    loadEmailTypes();
  }, [filters, pagination.page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });

      // Remove empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key]) {
          queryParams.delete(key);
        }
      });

      const response = await fetch(`${API_URL}/email-logs?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setLogs(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total,
          total_pages: result.pagination.total_pages
        }));
      }
    } catch (error) {
      console.error('Error loading email logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.from_date) queryParams.append('from_date', filters.from_date);
      if (filters.to_date) queryParams.append('to_date', filters.to_date);

      const response = await fetch(`${API_URL}/email-logs/statistics?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadEmailTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/email-logs/filters/types`);
      const result = await response.json();

      if (result.success) {
        setEmailTypes(result.data);
      }
    } catch (error) {
      console.error('Error loading email types:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      email_type: '',
      from_date: '',
      to_date: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewDetails = async (logId) => {
    try {
      const response = await fetch(`${API_URL}/email-logs/${logId}`);
      const result = await response.json();

      if (result.success) {
        setSelectedLog(result.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error loading email details:', error);
      alert('Error loading email details');
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this email log?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/email-logs/${logId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        alert('Email log deleted successfully');
        loadLogs();
        loadStatistics();
      } else {
        alert(result.message || 'Error deleting email log');
      }
    } catch (error) {
      console.error('Error deleting email log:', error);
      alert('Error deleting email log');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLogs.length === 0) {
      alert('Please select emails to delete');
      return;
    }

    if (!window.confirm(`Delete ${selectedLogs.length} selected email log(s)?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/email-logs/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedLogs })
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        setSelectedLogs([]);
        loadLogs();
        loadStatistics();
      } else {
        alert(result.message || 'Error deleting emails');
      }
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Error deleting emails');
    }
  };

  const handleRetry = async (logId) => {
    if (!window.confirm('Retry sending this email?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/email-logs/${logId}/retry`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        loadLogs();
      } else {
        alert(result.message || 'Error retrying email');
      }
    } catch (error) {
      console.error('Error retrying email:', error);
      alert('Error retrying email');
    }
  };

  const handleSelectLog = (logId) => {
    setSelectedLogs(prev => {
      if (prev.includes(logId)) {
        return prev.filter(id => id !== logId);
      } else {
        return [...prev, logId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map(log => log.id));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      sent: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      bounced: 'bg-orange-100 text-orange-700',
      opened: 'bg-blue-100 text-blue-700',
      clicked: 'bg-purple-100 text-purple-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      normal: 'bg-blue-100 text-blue-700',
      low: 'bg-gray-100 text-gray-700'
    };
    return badges[priority] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading email logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate flex items-center gap-3">
              <i className="fas fa-envelope-open text-crimson"></i>
              Email Logs
            </h1>
            <p className="text-gray-600 mt-2">Track and monitor all sent emails</p>
          </div>
          {selectedLogs.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <i className="fas fa-trash"></i>
              Delete Selected ({selectedLogs.length})
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && statistics.overall && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase">Total Emails</p>
                <p className="text-3xl font-bold text-slate mt-2">{statistics.overall.total_emails}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-envelope text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase">Sent</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{statistics.overall.sent_emails}</p>
                <p className="text-xs text-gray-500 mt-1">{statistics.overall.delivery_rate}% delivery rate</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase">Failed</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{statistics.overall.failed_emails}</p>
              </div>
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <i className="fas fa-times-circle text-2xl text-red-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{statistics.overall.pending_emails}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-2xl text-yellow-600"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-slate mb-4 flex items-center gap-2">
          <i className="fas fa-filter text-blue-600"></i>
          Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="bounced">Bounced</option>
              <option value="opened">Opened</option>
              <option value="clicked">Clicked</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate mb-2">Email Type</label>
            <select
              name="email_type"
              value={filters.email_type}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
            >
              <option value="">All Types</option>
              {emailTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate mb-2">From Date</label>
            <input
              type="date"
              name="from_date"
              value={filters.from_date}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate mb-2">To Date</label>
            <input
              type="date"
              name="to_date"
              value={filters.to_date}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate mb-2">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Email or subject..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <i className="fas fa-redo mr-2"></i>
            Clear Filters
          </button>
          <p className="text-sm text-gray-600">
            Showing {logs.length} of {pagination.total} emails
          </p>
        </div>
      </div>

      {/* Email Logs Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedLogs.length === logs.length && logs.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-crimson border-gray-300 rounded focus:ring-2 focus:ring-crimson"
                  />
                </th>
                <th className="text-left p-4 font-semibold text-slate">Date</th>
                <th className="text-left p-4 font-semibold text-slate">To</th>
                <th className="text-left p-4 font-semibold text-slate">Subject</th>
                <th className="text-left p-4 font-semibold text-slate">Type</th>
                <th className="text-left p-4 font-semibold text-slate">Status</th>
                <th className="text-left p-4 font-semibold text-slate">Priority</th>
                <th className="text-left p-4 font-semibold text-slate">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center">
                    <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 text-lg">No email logs found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log.id)}
                        onChange={() => handleSelectLog(log.id)}
                        className="w-4 h-4 text-crimson border-gray-300 rounded focus:ring-2 focus:ring-crimson"
                      />
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">{formatDate(log.created_at)}</div>
                      {log.sent_at && (
                        <div className="text-xs text-green-600 mt-1">
                          <i className="fas fa-paper-plane mr-1"></i>
                          {formatDate(log.sent_at)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate">{log.to_name || log.to_email}</div>
                      <div className="text-xs text-gray-500">{log.to_email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-700 font-medium max-w-xs truncate">
                        {log.subject}
                      </div>
                      {log.error_message && (
                        <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                          <i className="fas fa-exclamation-triangle mr-1"></i>
                          {log.error_message}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {log.email_type && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {log.email_type}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getPriorityBadge(log.priority)}`}>
                        {log.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(log.id)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {log.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(log.id)}
                            className="text-orange-600 hover:text-orange-800 p-2 rounded hover:bg-orange-50 transition"
                            title="Retry"
                          >
                            <i className="fas fa-redo"></i>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.total_pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-left mr-2"></i>
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.total_pages}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <i className="fas fa-chevron-right ml-2"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate flex items-center gap-2">
                <i className="fas fa-envelope-open text-crimson"></i>
                Email Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">To</label>
                  <p className="text-slate font-medium">{selectedLog.to_name || selectedLog.to_email}</p>
                  <p className="text-sm text-gray-500">{selectedLog.to_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">From</label>
                  <p className="text-slate font-medium">{selectedLog.from_name || selectedLog.from_email}</p>
                  <p className="text-sm text-gray-500">{selectedLog.from_email}</p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Subject</label>
                <p className="text-slate font-medium">{selectedLog.subject}</p>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(selectedLog.status)}`}>
                    {selectedLog.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Type</label>
                  <p className="text-slate">{selectedLog.email_type || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Priority</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getPriorityBadge(selectedLog.priority)}`}>
                    {selectedLog.priority}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Created At</label>
                  <p className="text-sm text-gray-700">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Sent At</label>
                  <p className="text-sm text-gray-700">{formatDate(selectedLog.sent_at)}</p>
                </div>
              </div>

              {/* Error Message */}
              {selectedLog.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-red-700 mb-1">Error Message</label>
                  <p className="text-sm text-red-600">{selectedLog.error_message}</p>
                </div>
              )}

              {/* Email Body */}
              {selectedLog.body_html && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Email Content (HTML)</label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: selectedLog.body_html }}></div>
                  </div>
                </div>
              )}

              {selectedLog.body_text && !selectedLog.body_html && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Email Content (Text)</label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 whitespace-pre-wrap">
                    {selectedLog.body_text}
                  </div>
                </div>
              )}

              {/* SMTP Config */}
              {selectedLog.smtp_config_name && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">SMTP Configuration</label>
                  <p className="text-slate">{selectedLog.smtp_config_name} ({selectedLog.smtp_host})</p>
                </div>
              )}

              {/* Additional Info */}
              {selectedLog.triggered_by && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Triggered By</label>
                  <p className="text-slate">{selectedLog.triggered_by}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-end gap-4">
              {selectedLog.status === 'failed' && (
                <button
                  onClick={() => {
                    handleRetry(selectedLog.id);
                    setShowDetailModal(false);
                  }}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Retry Sending
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailLogs;
