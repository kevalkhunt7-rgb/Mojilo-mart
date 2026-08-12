import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft, FolderPlus, UploadCloud, X, Image as ImageIcon } from 'lucide-react';

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchCategory = async () => {
    try {
      setLoading(true);

      const res = await api.get('/categories');

      const category = (res.data?.data || []).find(
        (item) => item._id === id
      );

      if (!category) {
        toast.error('Category not found');
        return navigate('/categories');
      }

      setName(category.name || '');
      if (category.image) {
        setPreviewUrl(category.image);
      }
    } catch (err) {
      toast.error('Failed to load category');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.warning('Please select a valid image file');
    }

    // Limit to 5MB
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
    setSaving(true);

    let imagePayload = previewUrl;

    // Convert new File to Base64 string if a new image was selected
    if (imageFile) {
      imagePayload = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageFile);
      });
    }

    // Send standard JSON object matching express.json()
    await api.patch(
      `/categories/${id}`,
      {
        name: name.trim(),
        image: imagePayload,
      }
    );

    toast.success('Category updated successfully!');

    setTimeout(() => {
      navigate('/categories');
    }, 1200);
  } catch (err) {
    toast.error(
      err.response?.data?.message || 'Failed to update category'
    );
    console.error(err);
  } finally {
    setSaving(false);
  }
};
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <span className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
        <p className="text-sm text-slate-500">Loading category...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/categories')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Category</h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your category information.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FolderPlus size={18} className="text-indigo-600" />
          <h2 className="font-semibold text-slate-800">Category Details</h2>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Category Name
          </label>
          <input
            type="text"
            required
            value={name}
            placeholder="Enter category name"
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Category Image
          </label>

          {previewUrl ? (
            /* Preview Container */
            <div className="relative w-full h-48 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden group">
              <img
                src={previewUrl}
                alt="Category preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium bg-white text-slate-800 rounded-lg shadow hover:bg-slate-100 transition"
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
            /* Dropzone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
              }`}
            >
              <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 mb-3">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-medium text-slate-700">
                Click to upload <span className="text-slate-400">or drag and drop</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
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
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </form>
    </div>
  );
}