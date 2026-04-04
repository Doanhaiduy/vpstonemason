'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Loader2,
  Lock,
  Mail,
  Plus,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';

function formatDate(value?: string | Date) {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';
  return date.toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('accessToken') || '';
    try {
      const data = await adminApi.getUsers(token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      alert(err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentRawUser = localStorage.getItem('user');
    if (currentRawUser) {
      try {
        const parsed = JSON.parse(currentRawUser);
        setCurrentUserId(String(parsed.id || parsed._id || ''));
      } catch {
        setCurrentUserId('');
      }
    }
    void fetchUsers();
  }, [fetchUsers]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [users]);

  const resetForm = () => {
    setForm({ firstName: '', lastName: '', email: '', password: '' });
  };

  const handleCreate = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    if (form.password.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('accessToken') || '';
    try {
      await adminApi.createUser(token, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      resetForm();
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create account');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: any) => {
    const id = String(user._id || '');
    if (!id) return;

    if (id === currentUserId && user.isActive !== false) {
      alert('You cannot deactivate your current account.');
      return;
    }

    setActingId(id);
    const token = localStorage.getItem('accessToken') || '';
    try {
      await adminApi.updateUser(token, id, { isActive: !(user.isActive !== false) });
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update account');
    } finally {
      setActingId(null);
    }
  };

  const handleResetPassword = async (user: any) => {
    const id = String(user._id || '');
    if (!id) return;

    const nextPassword = window.prompt(`Set new password for ${user.email}:`, '');
    if (!nextPassword) return;

    if (nextPassword.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }

    setActingId(id);
    const token = localStorage.getItem('accessToken') || '';
    try {
      await adminApi.updateUser(token, id, { password: nextPassword });
      alert('Password updated.');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async (user: any) => {
    const id = String(user._id || '');
    if (!id) return;

    if (user.role === 'admin') {
      alert('Admin accounts cannot be deleted from this panel.');
      return;
    }

    if (id === currentUserId) {
      alert('You cannot delete your own account.');
      return;
    }

    if (!window.confirm(`Delete account ${user.email}?`)) return;

    setActingId(id);
    const token = localStorage.getItem('accessToken') || '';
    try {
      await adminApi.deleteUser(token, id);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Account Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Full account stays as admin. All new accounts are created with manager role by default.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-slate-900">
          <Plus className="h-4 w-4" />
          <h2 className="text-base font-semibold">Create Manager Account</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Temporary Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={handleCreate} disabled={saving} variant="adminPrimary" size="lg">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Create Manager
          </Button>
          <Button onClick={resetForm} variant="adminSoft" size="lg">Reset</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">Accounts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Name</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Email</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Role</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Last Login</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => {
                  const id = String(user._id || '');
                  const isActing = actingId === id;
                  const isActive = user.isActive !== false;
                  const isAdmin = user.role === 'admin';

                  return (
                    <tr key={id} className="border-b border-slate-100 last:border-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                            <User className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {user.firstName} {user.lastName}
                            </p>
                            {id === currentUserId && (
                              <p className="text-xs text-indigo-600">Current account</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isAdmin
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isAdmin ? <Shield className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                          {isAdmin ? 'Full Admin' : 'Manager'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(user.lastLoginAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            onClick={() => handleToggleActive(user)}
                            disabled={isActing}
                            variant="adminSoft"
                            size="sm"
                          >
                            {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            {isActive ? 'Deactivate' : 'Activate'}
                          </Button>

                          <Button
                            type="button"
                            onClick={() => handleResetPassword(user)}
                            disabled={isActing}
                            variant="adminSoft"
                            size="sm"
                          >
                            <Lock className="h-3.5 w-3.5" /> Reset Password
                          </Button>

                          <Button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={isActing || isAdmin}
                            variant="adminDanger"
                            size="sm"
                            title={isAdmin ? 'Admin account cannot be deleted here' : 'Delete account'}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <p className="inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Best practice: keep one full admin account for governance, and use manager accounts for day-to-day operations.
        </p>
      </div>
    </div>
  );
}
