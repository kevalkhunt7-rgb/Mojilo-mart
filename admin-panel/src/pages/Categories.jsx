import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Plus,
  Trash2,
  Edit2,
  Folder,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);

    try {
      const res = await api.get('/categories');

      setCategories(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);

      toast.success('Category deleted successfully!');
      setConfirmDeleteId(null);
      fetchCategories();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to delete category'
      );
    }
  };

  return (
   <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-br from-[#312e81] via-[#3730a3] to-[#4338ca] p-5 sm:p-7 rounded-2xl shadow-lg shadow-indigo-900/20">
        <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute right-24 -bottom-20 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200 mb-1">Taxonomy & Organization</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Categories
          </h1>
          <p className="text-sm text-indigo-200/80 mt-1">
            Manage product categories and catalog structure.
          </p>
        </div>

        <div className="relative flex gap-2 shrink-0">
          <button
            onClick={fetchCategories}
            className="p-2.5 border border-white/10 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white backdrop-blur-sm"
            title="Refresh"
          >
            <RefreshCw
              size={15}
              className={loading ? 'animate-spin' : ''}
            />
          </button>

          <button
            onClick={() => navigate('/categories/add')}
            className="flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors active:scale-[0.98] flex-1 sm:flex-none"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#181B2A] rounded-2xl border border-slate-200 dark:border-[#272B40] shadow-sm overflow-hidden transition-colors">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>

            <p className="text-slate-500 dark:text-slate-400">
              Loading categories...
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            No categories found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#272B40] text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-[#272B40]">
                {categories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-slate-50 dark:hover:bg-[#1E2235] transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-[#0F172A] border border-indigo-100 dark:border-[#272B40] flex items-center justify-center overflow-hidden">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Folder
                              size={18}
                              className="text-indigo-600 dark:text-indigo-400"
                            />
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-200">
                            {category.name}
                          </h3>

                          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                            {category._id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-sm text-slate-500 dark:text-slate-400">
                      {category.slug}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/categories/edit/${category._id}`
                            )
                          }
                          className="p-2 rounded-lg border border-slate-200 dark:border-[#272B40] hover:bg-slate-100 dark:hover:bg-[#212538] text-slate-600 dark:text-slate-300 transition"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() =>
                            setConfirmDeleteId(category._id)
                          }
                          className="p-2 rounded-lg border border-red-200 dark:border-rose-900/40 hover:bg-red-50 dark:hover:bg-rose-950/40 text-red-600 dark:text-rose-400 transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
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

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-[#181B2A] rounded-2xl shadow-xl border border-slate-200 dark:border-[#272B40] p-6 max-w-sm w-full">
            <div className="flex gap-3">
              <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-rose-950/50 flex items-center justify-center text-red-600 dark:text-rose-400">
                <AlertCircle size={20} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Delete Category?
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-[#272B40] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#212538] transition"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  handleDelete(confirmDeleteId)
                }
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}