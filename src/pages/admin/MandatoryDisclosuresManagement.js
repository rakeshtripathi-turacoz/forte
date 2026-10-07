import React, { useState, useEffect } from 'react';
import { mandatoryDisclosuresAPI } from '../../services/api';
import API_CONFIG from '../../config/api.config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../admin/ManageHomePage.css';

const MandatoryDisclosuresManagement = () => {
  const [activeTab, setActiveTab] = useState('header');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Full-featured Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['clean']
    ]
  };

  const quillFormats = [
    'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'blockquote', 'code-block',
    'script',
    'header',
    'clean'
  ];

  // State for different sections
  const [header, setHeader] = useState({
    title: '',
    subtitle: '',
    description: ''
  });

  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // File upload states
  const [uploadingFile, setUploadingFile] = useState(false);

  // File upload handler
  const handleFileUpload = async (file) => {
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      setUploadingFile(true);

      const response = await fetch(`${API_CONFIG.API_URL}/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success) {
        // Set the file URL in formData
        setFormData({ ...formData, file_url: result.fileUrl });
        showMessage('success', 'File uploaded successfully!');
      } else {
        showMessage('error', 'File upload failed: ' + result.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showMessage('error', 'Error uploading file');
    } finally {
      setUploadingFile(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab, selectedCategory, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'header':
          const headerRes = await mandatoryDisclosuresAPI.getHeader();
          if (headerRes.success && headerRes.data) {
            setHeader(headerRes.data);
          }
          break;

        case 'categories':
          const catRes = await mandatoryDisclosuresAPI.getCategories();
          if (catRes.success) {
            setCategories(catRes.data);
          }
          break;

        case 'documents':
          const params = {};
          if (selectedCategory) params.category_id = selectedCategory;
          if (selectedYear) params.academic_year = selectedYear;

          const docsRes = await mandatoryDisclosuresAPI.getDocuments(params);
          if (docsRes.success) {
            setDocuments(docsRes.data);
          }

          // Also load categories for dropdown
          const catRes2 = await mandatoryDisclosuresAPI.getCategories();
          if (catRes2.success) {
            setCategories(catRes2.data);
          }
          break;

        case 'statistics':
          const statsRes = await mandatoryDisclosuresAPI.getStatistics();
          if (statsRes.success) {
            setStatistics(statsRes.data);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      showMessage('error', 'Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Header Management
  const handleHeaderUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await mandatoryDisclosuresAPI.updateHeader(header);
      if (res.success) {
        showMessage('success', 'Header updated successfully');
      }
    } catch (error) {
      showMessage('error', 'Failed to update header');
    } finally {
      setLoading(false);
    }
  };

  // Generic CRUD handlers
  const handleAdd = (type) => {
    setModalType(type);
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (type, item) => {
    setModalType(type);
    setEditingItem(item);

    // Format dates to yyyy-MM-dd for date input fields
    const formattedItem = { ...item };
    if (formattedItem.uploaded_date) {
      // Convert ISO date to yyyy-MM-dd format
      const date = new Date(formattedItem.uploaded_date);
      formattedItem.uploaded_date = date.toISOString().split('T')[0];
    }

    setFormData(formattedItem);
    setShowModal(true);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      let res;
      if (type === 'category') {
        res = await mandatoryDisclosuresAPI.deleteCategory(id);
      } else if (type === 'document') {
        res = await mandatoryDisclosuresAPI.deleteDocument(id);
      }

      if (res.success) {
        showMessage('success', 'Item deleted successfully');
        loadData();
      }
    } catch (error) {
      showMessage('error', 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      const isEditing = editingItem !== null;

      if (modalType === 'category') {
        res = isEditing
          ? await mandatoryDisclosuresAPI.updateCategory(editingItem.id, formData)
          : await mandatoryDisclosuresAPI.createCategory(formData);
      } else if (modalType === 'document') {
        res = isEditing
          ? await mandatoryDisclosuresAPI.updateDocument(editingItem.id, formData)
          : await mandatoryDisclosuresAPI.createDocument(formData);
      }

      if (res.success) {
        showMessage('success', `Item ${isEditing ? 'updated' : 'added'} successfully`);
        setShowModal(false);
        loadData();
      }
    } catch (error) {
      showMessage('error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate mb-2">
          Mandatory Disclosures Management
        </h1>
        <p className="text-gray-600">Manage transparency and compliance disclosures</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          {[
            { id: 'header', label: 'Page Header' },
            { id: 'categories', label: 'Categories' },
            { id: 'documents', label: 'Documents' },
            { id: 'statistics', label: 'Statistics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab.id
                  ? 'text-crimson border-b-2 border-crimson'
                  : 'text-gray-600 hover:text-slate'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {loading && <div className="text-center py-4">Loading...</div>}

        {/* Header Tab */}
        {activeTab === 'header' && !loading && (
          <form onSubmit={handleHeaderUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={header.title}
                onChange={(e) => setHeader({ ...header, title: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={header.subtitle}
                onChange={(e) => setHeader({ ...header, subtitle: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <ReactQuill
                theme="snow"
                value={header.description}
                onChange={(value) => setHeader({ ...header, description: value })}
                modules={quillModules}
                formats={quillFormats}
                className="bg-white"
                style={{ height: '200px', marginBottom: '50px' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-crimson text-white px-6 py-2 rounded hover:bg-opacity-90"
            >
              Update Header
            </button>
          </form>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && !loading && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Disclosure Categories</h2>
              <button
                onClick={() => handleAdd('category')}
                className="bg-crimson text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                + Add Category
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <i className={`fas ${category.icon} text-2xl text-crimson`}></i>
                      <div>
                        <h3 className="font-bold text-slate">{category.category_name}</h3>
                        <p className="text-xs text-gray-500">{category.category_slug}</p>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      #{category.display_order}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit('category', category)}
                      className="flex-1 bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete('category', category.id)}
                      className="flex-1 bg-red-50 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && !loading && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Disclosure Documents</h2>
              <button
                onClick={() => handleAdd('document')}
                className="bg-crimson text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                + Add Document
              </button>
            </div>

            {/* Filters */}
            <div className="mb-4 flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Academic Year (e.g., 2024-25)"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="p-2 border rounded"
              />
              <button
                onClick={() => { setSelectedCategory(''); setSelectedYear(''); loadData(); }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Year</th>
                    <th className="px-4 py-2 text-left">Size</th>
                    <th className="px-4 py-2 text-left">Featured</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id} className="border-b">
                      <td className="px-4 py-2">
                        <p className="font-medium">{doc.document_title}</p>
                        {doc.description && (
                          <p className="text-xs text-gray-500 mt-1">{doc.description.substring(0, 60)}...</p>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                          {doc.category_name}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {doc.document_type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{doc.academic_year}</td>
                      <td className="px-4 py-2 text-sm">{doc.file_size}</td>
                      <td className="px-4 py-2">
                        {doc.is_featured ? (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                            <i className="fas fa-star mr-1"></i>Featured
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEdit('document', doc)}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete('document', doc.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && !loading && statistics && (
          <div>
            <h2 className="text-xl font-bold mb-4">Disclosure Statistics</h2>

            {/* Overview Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.overview.total_categories}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-green-600">{statistics.overview.total_documents}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <p className="text-sm text-gray-600">Featured Documents</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.overview.featured_documents}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-sm text-gray-600">Academic Years</p>
                <p className="text-2xl font-bold text-purple-600">{statistics.overview.academic_years}</p>
              </div>
            </div>

            {/* Category-wise Stats */}
            <h3 className="font-bold mb-3">Documents by Category</h3>
            <div className="grid grid-cols-2 gap-4">
              {statistics.categoryWise.map(cat => (
                <div key={cat.id} className="border rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{cat.category_name}</p>
                    <p className="text-xs text-gray-500">{cat.category_slug}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-crimson">{cat.document_count}</p>
                    <p className="text-xs text-gray-500">documents</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit' : 'Add'} {modalType === 'category' ? 'Category' : 'Document'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {modalType === 'category' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category Name *</label>
                    <input
                      type="text"
                      value={formData.category_name || ''}
                      onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category Slug * (URL-friendly)</label>
                    <input
                      type="text"
                      value={formData.category_slug || ''}
                      onChange={(e) => setFormData({ ...formData, category_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., institute-information"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <ReactQuill
                      theme="snow"
                      value={formData.description || ''}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      modules={quillModules}
                      formats={quillFormats}
                      className="bg-white"
                      style={{ height: '150px', marginBottom: '50px' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Icon (FontAwesome class)</label>
                    <input
                      type="text"
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., fa-university"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order || 0}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}

              {modalType === 'document' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      value={formData.category_id || ''}
                      onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Document Title *</label>
                    <input
                      type="text"
                      value={formData.document_title || ''}
                      onChange={(e) => setFormData({ ...formData, document_title: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Document Type *</label>
                    <select
                      value={formData.document_type || 'PDF'}
                      onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="PDF">PDF</option>
                      <option value="Excel">Excel</option>
                      <option value="Word">Word</option>
                      <option value="Image">Image</option>
                      <option value="Link">Link</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Upload File</label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      className="w-full p-2 border rounded"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      disabled={uploadingFile}
                    />
                    {uploadingFile && (
                      <p className="text-xs text-blue-600 mt-1">
                        <i className="fas fa-spinner fa-spin mr-1"></i>Uploading file...
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Upload a file or enter URL manually below</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">File URL *</label>
                    <input
                      type="text"
                      value={formData.file_url || ''}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="/documents/disclosures/filename.pdf"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">File Size</label>
                    <input
                      type="text"
                      value={formData.file_size || ''}
                      onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., 2.5 MB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <ReactQuill
                      theme="snow"
                      value={formData.description || ''}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      modules={quillModules}
                      formats={quillFormats}
                      className="bg-white"
                      style={{ height: '150px', marginBottom: '50px' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={formData.academic_year || ''}
                      onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., 2024-25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Date</label>
                    <input
                      type="date"
                      value={formData.uploaded_date || ''}
                      onChange={(e) => setFormData({ ...formData, uploaded_date: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_featured || false}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium">Featured Document</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Display Order</label>
                      <input
                        type="number"
                        value={formData.display_order || 0}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                        className="p-2 border rounded w-24"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MandatoryDisclosuresManagement;
