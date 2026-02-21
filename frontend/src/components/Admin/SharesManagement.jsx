import { useState, useEffect } from 'react';
import { getAllShares, revokeShare, activateShare, deleteShare } from '../../services/shareService';

const SharesManagement = () => {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    isActive: '',
    search: ''
  });

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    setLoading(true);
    try {
      const response = await getAllShares(filters);
      setShares(response.data.shares);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shares');
      console.error('Fetch shares error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchShares();
  };

  const handleRevoke = async (token) => {
    if (!confirm('Are you sure you want to revoke this share link?')) return;

    try {
      await revokeShare(token);
      fetchShares();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke share');
    }
  };

  const handleActivate = async (token) => {
    if (!confirm('Are you sure you want to activate this share link?')) return;

    try {
      await activateShare(token);
      fetchShares();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate share');
    }
  };

  const handleDelete = async (token) => {
    if (!confirm('Are you sure you want to permanently delete this share link? This cannot be undone.')) return;

    try {
      await deleteShare(token);
      fetchShares();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete share');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Share Links Management</h2>
        <p className="mt-1 text-gray-600">
          View and manage all shared workout history links
        </p>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="statusFilter"
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Revoked</option>
            </select>
          </div>

          <div>
            <label htmlFor="searchFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              id="searchFilter"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Username or token..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="w-full px-4 py-2 btn-primary font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Shares Table */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shares...</p>
        </div>
      ) : shares.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No shares found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shares.map((share) => (
                  <tr key={share.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {share.user.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {share.token.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(share.fromDate)} - {formatDate(share.toDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(share.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {share.expiresAt ? (
                        <div className={`text-sm ${isExpired(share.expiresAt) ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatDate(share.expiresAt)}
                          {isExpired(share.expiresAt) && (
                            <span className="ml-1 text-xs">(Expired)</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Never</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          share.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {share.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {share.isActive ? (
                          <button
                            onClick={() => handleRevoke(share.token)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(share.token)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(share.token)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {shares.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Showing {shares.length} share link{shares.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default SharesManagement;

