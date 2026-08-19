import React, { useState, useRef } from 'react';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft, FolderPlus, UploadCloud, X } from 'lucide-react';

export default function AddCategory() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.warning('Please select a valid image file');
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return toast.warning('Image size should be under 5MB');
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.warning('Category name is required');
    }

    try {
      setLoading(true);

      let imageBase64 = '';

      if (imageFile) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(imageFile);
        });
      }

      await api.post('/categories', {
        name: name.trim(),
        image: imageBase64,
      });

      toast.success('Category created successfully!');

      setTimeout(() => {
        navigate('/categories');
      }, 1200);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to create category'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <ToastContainer theme="colored" />

      {/* Header */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <button
          type="button"
          onClick={() => navigate('/categories')}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Create Category
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Add a new product category.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <FolderPlus
            size={18}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            Category Details
          </h2>
        </div>

        {/* Category Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Category Name
          </label>

          <input
            type="text"
            required
            placeholder="e.g. T-Shirts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800/90"
          />
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Category Image (Optional)
          </label>

          {previewUrl ? (
            /* Preview State */
            <div className="relative w-full h-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 overflow-hidden group">
              <img
                src={previewUrl}
                alt="Category preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg shadow hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
                  title="Remove Image"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Drag and Drop Zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800'
              }`}
            >
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-full text-indigo-600 dark:text-indigo-400 mb-3">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Click to upload <span className="text-slate-400 dark:text-slate-500">or drag and drop</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                PNG, JPG, WEBP up to 5MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}