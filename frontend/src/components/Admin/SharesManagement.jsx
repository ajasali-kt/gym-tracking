import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getAllShares, revokeShare, activateShare, deleteShare } from '../../services/shareService';
import CustomPopup from '../ui/CustomPopup';

const SharesManagement = () => {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuShareId, setOpenMenuShareId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [confirmModal, setConfirmModal] = useState(null); // { action: 'activate'|'revoke'|'delete', share }
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [filters, setFilters] = useState({
    isActive: '',
    search: ''
  });

  useEffect(() => {
    fetchShares();
  }, []);

  useEffect(() => {
    if (!openMenuShareId) return;

    const handlePointerDown = (event) => {
      if (event.target.closest?.(`[data-share-actions-button="${openMenuShareId}"]`)) return;
      if (event.target.closest?.(`[data-share-actions-menu="${openMenuShareId}"]`)) return;
      setOpenMenuShareId(null);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpenMenuShareId(null);
    };

    const handleScrollOrResize = () => setOpenMenuShareId(null);

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [openMenuShareId]);

  const openMenuAtButton = (shareId, buttonEl) => {
    const MENU_WIDTH = 180;
    const GAP = 8;
    const PAD = 8;

    const rect = buttonEl.getBoundingClientRect();
    const rawLeft = rect.right - MENU_WIDTH;
    const left = Math.max(PAD, Math.min(rawLeft, window.innerWidth - PAD - MENU_WIDTH));
    const top = Math.max(PAD, Math.min(rect.bottom + GAP, window.innerHeight - PAD));

    setMenuPosition({ top, left });
    setOpenMenuShareId(shareId);
  };

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

  const openShare = openMenuShareId ? shares.find((share) => share.id === openMenuShareId) : null;

  const openConfirmModal = (action, share) => {
    setConfirmBusy(false);
    setConfirmModal({ action, share });
  };

  const closeConfirmModal = () => {
    if (confirmBusy) return;
    setConfirmModal(null);
  };

  const handleConfirmOk = async () => {
    if (!confirmModal?.share?.token || !confirmModal?.action) return;

    setConfirmBusy(true);
    try {
      if (confirmModal.action === 'revoke') {
        await revokeShare(confirmModal.share.token);
      } else if (confirmModal.action === 'activate') {
        await activateShare(confirmModal.share.token);
      } else if (confirmModal.action === 'delete') {
        await deleteShare(confirmModal.share.token);
      }

      await fetchShares();
      setConfirmModal(null);
    } catch (err) {
      const fallbackMessage =
        confirmModal.action === 'revoke'
          ? 'Failed to revoke share'
          : confirmModal.action === 'activate'
            ? 'Failed to activate share'
            : 'Failed to delete share';
      alert(err.response?.data?.message || fallbackMessage);
    } finally {
      setConfirmBusy(false);
    }
  };

  const confirmTitle =
    confirmModal?.action === 'revoke'
      ? 'Revoke share link?'
      : confirmModal?.action === 'activate'
        ? 'Activate share link?'
        : confirmModal?.action === 'delete'
          ? 'Delete share link?'
          : '';

  const confirmBodyText = (() => {
    const username = confirmModal?.share?.user?.username ? ` for ${confirmModal.share.user.username}` : '';
    if (confirmModal?.action === 'revoke') return `Are you sure you want to revoke this share link${username}?`;
    if (confirmModal?.action === 'activate') return `Are you sure you want to activate this share link${username}?`;
    if (confirmModal?.action === 'delete') {
      return [
        `Are you sure you want to permanently delete this share link${username}?`,
        'This cannot be undone.'
      ].join('\n');
    }
    return '';
  })();

  const confirmButtonText =
    confirmModal?.action === 'revoke'
      ? 'Revoke'
      : confirmModal?.action === 'activate'
        ? 'Activate'
        : confirmModal?.action === 'delete'
          ? 'Delete'
          : 'Ok';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-app-primary">Share Links</h2>
        <p className="mt-1 text-app-muted">
          View and manage all shared workout history links
        </p>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="statusFilter" className="label">
              Status
            </label>
            <select
              id="statusFilter"
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Revoked</option>
            </select>
          </div>

          <div>
            <label htmlFor="searchFilter" className="label">
              Search
            </label>
            <input
              type="text"
              id="searchFilter"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Username or token..."
              className="input-field"
            />
          </div>

          <div className="flex items-end">
            <button
              id="admin-shares-apply-filters-button"
              onClick={handleApplyFilters}
              className="btn-outline w-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Shares Table */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-400"></div>
          <p className="mt-4 text-app-muted">Loading shares…</p>
        </div>
      ) : shares.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-app-muted">No shares found</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-app-muted uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-app-muted uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-app-muted uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-app-muted uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-app-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-app-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {shares.map((share) => (
                  <tr key={share.id} className="border-t border-app-subtle hover:bg-surface">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-app-primary">
                          {share.user.username}
                        </div>
                        <div className="text-xs text-app-muted">
                          {share.token.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-app-primary">
                        {formatDate(share.fromDate)} - {formatDate(share.toDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-app-primary">
                        {formatDate(share.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {share.expiresAt ? (
                        <div className={`text-sm ${isExpired(share.expiresAt) ? 'text-red-300' : 'text-app-primary'}`}>
                          {formatDate(share.expiresAt)}
                          {isExpired(share.expiresAt) && (
                            <span className="ml-1 text-xs">(Expired)</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-app-muted">Never</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={share.isActive
                          ? 'badge-success'
                          : 'inline-flex items-center rounded-md border border-red-500/35 bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-300'}
                      >
                        {share.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        id={`share-${share.id}-actions-menu-button`}
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={openMenuShareId === share.id}
                        data-share-actions-button={share.id}
                        onClick={(e) => {
                          if (openMenuShareId === share.id) {
                            setOpenMenuShareId(null);
                            return;
                          }
                          openMenuAtButton(share.id, e.currentTarget);
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-transparent text-app-muted transition hover:border-app-subtle hover:bg-surface hover:text-app-primary"
                        title="Actions"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path d="M10 3.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {openShare && createPortal(
        <div
          role="menu"
          aria-label="Share actions"
          data-share-actions-menu={openShare.id}
          className="fixed z-[9999] w-[180px] rounded-xl border border-app-subtle bg-card p-1 shadow-card"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <button
            id={openShare.isActive ? `share-${openShare.id}-revoke-button` : `share-${openShare.id}-activate-button`}
            type="button"
            role="menuitem"
            onClick={() => {
              setOpenMenuShareId(null);
              if (openShare.isActive) {
                openConfirmModal('revoke', openShare);
              } else {
                openConfirmModal('activate', openShare);
              }
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app-primary transition hover:bg-surface"
          >
            {openShare.isActive ? 'Revoke' : 'Activate'}
          </button>

          <button
            id={`share-${openShare.id}-delete-button`}
            type="button"
            role="menuitem"
            onClick={() => {
              setOpenMenuShareId(null);
              openConfirmModal('delete', openShare);
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app-primary transition hover:bg-surface"
          >
            Delete
          </button>
        </div>,
        document.body
      )}

      <CustomPopup
        isOpen={Boolean(confirmModal)}
        title={confirmTitle}
        idBase={confirmModal?.action ? `admin-shares-${confirmModal.action}-popup` : 'admin-shares-confirm-popup'}
        bodyText={confirmBodyText}
        onClose={closeConfirmModal}
        onOk={handleConfirmOk}
        buttonType={['delete','revoke'].includes(confirmModal?.action) ? 'delete' : 'default'}
        buttonText={confirmButtonText}
        okDisabled={confirmBusy}
        closeOnOverlayClick={!confirmBusy}
      />

      {/* Summary */}
      {shares.length > 0 && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-100">
            Showing {shares.length} share link{shares.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default SharesManagement;
