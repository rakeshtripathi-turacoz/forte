import React, { useState, useEffect } from 'react';
import { galleryAPI } from '../../services/api';

const ManageGalleryPage = () => {
  const [activeTab, setActiveTab] = useState('images');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    category_name: '',
    category_slug: '',
    category_description: '',
    display_order: 0,
    is_active: true
  });

  // Images State
  const [images, setImages] = useState([]);
  const [editingImage, setEditingImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageForm, setImageForm] = useState({
    title: '',
    description: '',
    category_id: '',
    photographer: '',
    display_order: 0,
    is_active: true
  });

  // Stats State
  const [stats, setStats] = useState([]);
  const [editingStat, setEditingStat] = useState(null);
  const [statForm, setStatForm] = useState({
    stat_title: '',
    stat_value: '',
    stat_description: '',
    display_order: 0,
    is_active: true
  });

  // Page Header State
  const [pageHeader, setPageHeader] = useState(null);
  const [headerForm, setHeaderForm] = useState({
    page_title: 'Photo Gallery',
    page_description: ''
  });

  useEffect(() => {
    if (activeTab === 'categories') fetchCategories();
    else if (activeTab === 'images') fetchImages();
    else if (activeTab === 'stats') fetchStats();
    else if (activeTab === 'header') fetchPageHeader();
  }, [activeTab]);

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ==============================================
  // CATEGORIES FUNCTIONS
  // ==============================================

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await galleryAPI.getAllCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      category_name: '',
      category_slug: '',
      category_description: '',
      display_order: 0,
      is_active: true
    });
    setEditingCategory(null);
  };

  const handleEditCategory = (category) => {
    setCategoryForm({
      category_name: category.category_name,
      category_slug: category.category_slug,
      category_description: category.category_description || '',
      display_order: category.display_order,
      is_active: category.is_active
    });
    setEditingCategory(category);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.category_name || !categoryForm.category_slug) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingCategory) {
        await galleryAPI.updateCategory(editingCategory.id, categoryForm);
        setSuccess('Category updated successfully!');
      } else {
        await galleryAPI.createCategory(categoryForm);
        setSuccess('Category created successfully!');
      }
      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    setLoading(true);
    try {
      await galleryAPI.deleteCategory(id);
      setSuccess('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(error.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // IMAGES FUNCTIONS
  // ==============================================

  const fetchImages = async () => {
    setLoading(true);
    try {
      // Fetch both images and categories for the dropdown
      const [imagesRes, categoriesRes] = await Promise.all([
        galleryAPI.getAllImages(),
        galleryAPI.getAllCategories()
      ]);

      if (imagesRes.success) {
        setImages(imagesRes.data);
      }
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const resetImageForm = () => {
    setImageForm({
      title: '',
      description: '',
      category_id: '',
      photographer: '',
      display_order: 0,
      is_active: true
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingImage(null);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = (image) => {
    setImageForm({
      title: image.title,
      description: image.description || '',
      category_id: image.category_id,
      photographer: image.photographer || '',
      display_order: image.display_order,
      is_active: image.is_active
    });
    setEditingImage(image);
    setImageFile(null);
    // Set preview to existing image path
    setImagePreview(`${process.env.REACT_APP_API_URL?.replace('/api', '')}/${image.image_path}` || null);
  };

  const handleSaveImage = async () => {
    if (!imageForm.title || !imageForm.category_id) {
      alert('Please fill in all required fields');
      return;
    }

    if (!editingImage && !imageFile) {
      alert('Please select an image file');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', imageForm.title);
      formData.append('description', imageForm.description);
      formData.append('category_id', imageForm.category_id);
      formData.append('photographer', imageForm.photographer);
      formData.append('display_order', imageForm.display_order);
      formData.append('is_active', imageForm.is_active);

      // Add image file if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingImage) {
        await galleryAPI.updateImage(editingImage.id, formData);
        setSuccess('Image updated successfully!');
      } else {
        await galleryAPI.createImage(formData);
        setSuccess('Image uploaded successfully!');
      }

      resetImageForm();
      fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
      setError('Failed to save image');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    setLoading(true);
    try {
      await galleryAPI.deleteImage(id);
      setSuccess('Image deleted successfully!');
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // STATS FUNCTIONS
  // ==============================================

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await galleryAPI.getAllStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const resetStatForm = () => {
    setStatForm({
      stat_title: '',
      stat_value: '',
      stat_description: '',
      display_order: 0,
      is_active: true
    });
    setEditingStat(null);
  };

  const handleEditStat = (stat) => {
    setStatForm({
      stat_title: stat.stat_title,
      stat_value: stat.stat_value,
      stat_description: stat.stat_description,
      display_order: stat.display_order,
      is_active: stat.is_active
    });
    setEditingStat(stat);
  };

  const handleSaveStat = async () => {
    if (!statForm.stat_title || !statForm.stat_value || !statForm.stat_description) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingStat) {
        await galleryAPI.updateStat(editingStat.id, statForm);
        setSuccess('Stat updated successfully!');
      } else {
        await galleryAPI.createStat(statForm);
        setSuccess('Stat created successfully!');
      }
      resetStatForm();
      fetchStats();
    } catch (error) {
      console.error('Error saving stat:', error);
      setError('Failed to save stat');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStat = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stat?')) return;

    setLoading(true);
    try {
      await galleryAPI.deleteStat(id);
      setSuccess('Stat deleted successfully!');
      fetchStats();
    } catch (error) {
      console.error('Error deleting stat:', error);
      setError('Failed to delete stat');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // PAGE HEADER FUNCTIONS
  // ==============================================

  const fetchPageHeader = async () => {
    setLoading(true);
    try {
      const res = await galleryAPI.getHeader();
      if (res.success && res.data) {
        setPageHeader(res.data);
        setHeaderForm({
          page_title: res.data.page_title,
          page_description: res.data.page_description || ''
        });
      }
    } catch (error) {
      console.error('Error fetching page header:', error);
      setError('Failed to load page header');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeader = async () => {
    setLoading(true);
    try {
      await galleryAPI.updateHeader(headerForm);
      setSuccess('Page header updated successfully!');
      fetchPageHeader();
    } catch (error) {
      console.error('Error saving page header:', error);
      setError('Failed to save page header');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // RENDER
  // ==============================================

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate mb-2">Gallery Management</h1>
        <p className="text-gray-600">Manage gallery images, categories, and stats</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <i className="fas fa-exclamation-circle mr-2"></i>{error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <i className="fas fa-check-circle mr-2"></i>{success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {['categories', 'images', 'stats', 'header'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === tab
                  ? 'border-b-2 border-crimson text-crimson'
                  : 'text-gray-600 hover:text-slate'
              }`}
            >
              {tab === 'categories' && <i className="fas fa-folder mr-2"></i>}
              {tab === 'images' && <i className="fas fa-images mr-2"></i>}
              {tab === 'stats' && <i className="fas fa-chart-bar mr-2"></i>}
              {tab === 'header' && <i className="fas fa-heading mr-2"></i>}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div>
            <h2 className="text-2xl font-bold text-slate mb-6">Gallery Categories</h2>

            {/* Category Form */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-slate mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.category_name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, category_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                    placeholder="e.g., Campus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Slug * (URL-friendly)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.category_slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, category_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                    placeholder="e.g., campus"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.category_description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, category_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                    rows="2"
                    placeholder="Brief description of this category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                      className="mr-2 h-4 w-4 text-crimson focus:ring-crimson border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveCategory}
                  disabled={loading}
                  className="bg-crimson hover:bg-red-800 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
                >
                  <i className="fas fa-save mr-2"></i>
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>

                {editingCategory && (
                  <button
                    onClick={resetCategoryForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Categories List */}
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate mb-1">{category.category_name}</h4>
                        <p className="text-sm text-gray-500 mb-2">Slug: {category.category_slug}</p>
                        {category.category_description && (
                          <p className="text-gray-600 text-sm mb-2">{category.category_description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Order: {category.display_order}</span>
                          <span className={`px-2 py-1 rounded ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {categories.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No categories found. Create your first category!</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* IMAGES TAB */}
        {activeTab === 'images' && (
          <div>
            <h2 className="text-2xl font-bold text-slate mb-6">Gallery Images</h2>

            {/* Image Form */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-slate mb-4">
                {editingImage ? 'Edit Image' : 'Upload New Image'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image File * {editingImage && '(Leave empty to keep current image)'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepted: JPG, PNG, GIF, WEBP (Max 5MB)</p>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={imageForm.title}
                    onChange={(e) => setImageForm({ ...imageForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                    placeholder="Image title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={imageForm.category_id}
                    onChange={(e) => setImageForm({ ...imageForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                  >
                    <option value="">Select Category</option>
                    {categories.filter(c => c.is_active).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={imageForm.description}
                    onChange={(e) => setImageForm({ ...imageForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                    rows="2"
                    placeholder="Brief description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photographer
                  </label>
                  <input
                    type="text"
                    value={imageForm.photographer}
                    onChange={(e) => setImageForm({ ...imageForm, photographer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                    placeholder="Photographer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={imageForm.display_order}
                    onChange={(e) => setImageForm({ ...imageForm, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={imageForm.is_active}
                      onChange={(e) => setImageForm({ ...imageForm, is_active: e.target.checked })}
                      className="mr-2 h-4 w-4 text-crimson focus:ring-crimson border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveImage}
                  disabled={loading}
                  className="bg-crimson hover:bg-red-800 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
                >
                  <i className="fas fa-upload mr-2"></i>
                  {editingImage ? 'Update' : 'Upload'} Image
                </button>

                {editingImage && (
                  <button
                    onClick={resetImageForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Images Grid */}
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                    <div className="relative">
                      <img
                        src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/${image.image_path}`}
                        alt={image.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                        }}
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => handleEditImage(image)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="font-bold text-slate mb-1">{image.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{image.category_name}</p>
                      {image.description && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{image.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Order: {image.display_order}</span>
                        <span className={`px-2 py-1 rounded ${image.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {image.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {images.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    No images found. Upload your first image!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold text-slate mb-6">Campus Highlights Stats</h2>

            {/* Stat Form */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-slate mb-4">
                {editingStat ? 'Edit Stat' : 'Add New Stat'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={statForm.stat_title}
                    onChange={(e) => setStatForm({ ...statForm, stat_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                    placeholder="e.g., Campus Area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value *
                  </label>
                  <input
                    type="text"
                    value={statForm.stat_value}
                    onChange={(e) => setStatForm({ ...statForm, stat_value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                    placeholder="e.g., 50+"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={statForm.stat_description}
                    onChange={(e) => setStatForm({ ...statForm, stat_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                    placeholder="e.g., Acres Campus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={statForm.display_order}
                    onChange={(e) => setStatForm({ ...statForm, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statForm.is_active}
                      onChange={(e) => setStatForm({ ...statForm, is_active: e.target.checked })}
                      className="mr-2 h-4 w-4 text-crimson focus:ring-crimson border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveStat}
                  disabled={loading}
                  className="bg-crimson hover:bg-red-800 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
                >
                  <i className="fas fa-save mr-2"></i>
                  {editingStat ? 'Update' : 'Create'} Stat
                </button>

                {editingStat && (
                  <button
                    onClick={resetStatForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Stats List */}
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="text-center mb-3">
                      <div className="text-3xl font-bold text-gold mb-1">{stat.stat_value}</div>
                      <p className="text-gray-600 text-sm">{stat.stat_description}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.stat_title}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Order: {stat.display_order}</span>
                      <span className={`px-2 py-1 rounded ${stat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {stat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditStat(stat)}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteStat(stat.id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}

                {stats.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    No stats found. Create your first stat!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* HEADER TAB */}
        {activeTab === 'header' && (
          <div>
            <h2 className="text-2xl font-bold text-slate mb-6">Page Header</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={headerForm.page_title}
                    onChange={(e) => setHeaderForm({ ...headerForm, page_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                    placeholder="Photo Gallery"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Description
                  </label>
                  <textarea
                    value={headerForm.page_description}
                    onChange={(e) => setHeaderForm({ ...headerForm, page_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-crimson"
                    rows="3"
                    placeholder="Describe your gallery..."
                  />
                </div>
              </div>

              <button
                onClick={handleSaveHeader}
                disabled={loading}
                className="bg-crimson hover:bg-red-800 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
              >
                <i className="fas fa-save mr-2"></i>Save Page Header
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageGalleryPage;
