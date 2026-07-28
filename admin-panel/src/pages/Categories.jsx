import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
      const res = await axios.get('/api/categories', {
        withCredentials: true,
      });

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
      await axios.delete(`/api/categories/${id}`, {
        withCredentials: true,
      });

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
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Categories
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage product categories.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchCategories}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw
              size={15}
              className={loading ? 'animate-spin' : ''}
            />
          </button>

          <button
            onClick={() => navigate('/categories/add')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>

            <p className="text-slate-500">
              Loading categories...
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No categories found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Folder
                              size={18}
                              className="text-indigo-600"
                            />
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {category.name}
                          </h3>

                          <p className="text-[10px] font-mono text-slate-400 mt-1">
                            {category._id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-sm text-slate-500">
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
                          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() =>
                            setConfirmDeleteId(category._id)
                          }
                          className="p-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full">
            <div className="flex gap-3">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Delete Category?
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  This action will permanently delete this
                  category. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  handleDelete(confirmDeleteId)
                }
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium"
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