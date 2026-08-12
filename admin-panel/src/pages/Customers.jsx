import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, ShieldAlert, UserCheck, Mail, Phone, Calendar, ArrowRightLeft, Shield } from 'lucide-react';

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('customer');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const res = await api.patch(`/users/${userId}/status`, {});
      toast.success(res.data?.message || 'User status updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(
        `/users/${selectedUser._id}/role`,
        { role: newRole }
      );
      toast.success(res.data?.message || 'User role updated successfully');
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Get Initials for Avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Filter & Search Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phoneNumber?.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
  <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-br from-[#312e81] via-[#3730a3] to-[#4338ca] p-5 sm:p-7 rounded-2xl shadow-lg shadow-indigo-900/20">
        <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute right-24 -bottom-20 w-40 h-40 rounded-full bg-white/5" />
        
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200 mb-1">User Management</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Customers & Staff
          </h1>
          <p className="text-sm text-indigo-200/80 mt-1">
            Manage user profiles, accounts status, and operational roles.
          </p>
        </div>

        <div className="relative shrink-0">
          <div className="inline-flex items-center text-xs bg-white/10 text-white font-semibold px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm shadow-sm">
            Total Users: {users.length}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#181B2A] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#272B40] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8fafc] dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#272B40] rounded-xl text-sm outline-none transition-all duration-150 focus:border-[#4f46e5] focus:bg-white dark:focus:bg-[#1E2235] focus:ring-2 focus:ring-[#4f46e5]/10 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#f8fafc] dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#272B40] rounded-xl text-xs px-3 py-2 outline-none text-[#475569] dark:text-slate-200 font-medium"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
            <option value="moderator">Moderators</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#f8fafc] dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#272B40] rounded-xl text-xs px-3 py-2 outline-none text-[#475569] dark:text-slate-200 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#181B2A] rounded-2xl border border-[#e2e8f0] dark:border-[#272B40] shadow-sm overflow-hidden transition-colors">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm">Loading users data...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No users match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f8fafc] dark:bg-[#0F172A] border-b border-[#f1f5f9] dark:border-[#272B40] text-[11px] font-bold tracking-wider text-[#64748b] dark:text-slate-400 uppercase">
                  <th className="py-3 px-6">User Details</th>
                  <th className="py-3 px-6">Contact info</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Account Status</th>
                  <th className="py-3 px-6">Registered On</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] dark:divide-[#272B40] text-sm text-[#334155] dark:text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#fafafa] dark:hover:bg-[#1E2235] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-[#0F172A] border border-indigo-100 dark:border-[#272B40] flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300 text-sm shadow-inner">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-200 leading-tight">{u.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{u._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Mail size={12} className="text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                      {u.phoneNumber && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <Phone size={12} className="text-slate-400" />
                          <span>{u.phoneNumber}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === 'admin' 
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900'
                          : u.role === 'moderator'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900'
                          : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
                      }`}>
                        {u.role === 'admin' && <Shield size={12} />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        u.status === 'active' 
                          ? 'bg-green-50 dark:bg-emerald-950/40 text-green-600 dark:text-emerald-400 border border-green-100 dark:border-emerald-900'
                          : u.status === 'suspended'
                          ? 'bg-red-50 dark:bg-rose-950/40 text-red-600 dark:text-rose-400 border border-red-100 dark:border-rose-900'
                          : 'bg-yellow-50 dark:bg-amber-950/40 text-yellow-600 dark:text-amber-400 border border-yellow-100 dark:border-amber-900'
                      }`}>
                        {u.status === 'active' ? 'Active' : u.status === 'suspended' ? 'Suspended' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(u._id, u.status)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.status === 'active'
                              ? 'border-red-100 dark:border-rose-900/40 hover:bg-red-50 dark:hover:bg-rose-950/40 text-red-500 dark:text-rose-400'
                              : 'border-green-100 dark:border-emerald-900/40 hover:bg-green-50 dark:hover:bg-emerald-950/40 text-green-600 dark:text-emerald-400'
                          }`}
                          title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                        >
                          {u.status === 'active' ? <ShieldAlert size={15} /> : <UserCheck size={15} />}
                        </button>
                        <button
                          onClick={() => handleOpenRoleModal(u)}
                          className="p-1.5 rounded-lg border border-slate-100 dark:border-[#272B40] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#212538] hover:text-slate-800 dark:hover:text-white transition-colors"
                          title="Change Role"
                        >
                          <ArrowRightLeft size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#181B2A] rounded-2xl border border-slate-100 dark:border-[#272B40] shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#f1f5f9] dark:border-[#272B40] pb-3">
              <h3 className="font-bold text-lg text-[#0f172a] dark:text-white">Modify User Role</h3>
              <button 
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Updating role for:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-base">{selectedUser?.name}</p>
                <p className="text-xs text-slate-400">{selectedUser?.email}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#475569] dark:text-slate-300 uppercase tracking-wider">Select Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-[#f8fafc] dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#272B40] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="customer">Customer (Standard User)</option>
                  <option value="moderator">Moderator (Limited Operations)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#f1f5f9] dark:border-[#272B40]">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#272B40] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#212538] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
