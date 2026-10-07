import React, { useState, useEffect } from 'react';
import { announcementsAPI, getBaseURL } from '../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ManageAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    announcement_date: new Date().toISOString().split('T')[0],
    link_url: '#',
    is_featured: false,
    is_active: true,
    display_order: 0
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);

  // Full-featured Quill editor configuration (same as other pages)
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

  // Predefined categories
  const defaultCategories = [
    'Admission', 'Achievement', 'Partnership', 'Event', 'Academic',
    'Examination', 'Placement', 'Conference', 'Scholarship', 'Workshop', 'General'
  ];

  // Load announcements and categories
  useEffect(() => {
    fetchAnnouncements();
    fetchCategories();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await announcementsAPI.getAllAdmin();
      if (response.success) {
        setAnnouncements(response.data);
      }
    } catch (err) {
      setError('Failed to load announcements: ' + err.message);
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await announcementsAPI.getCategories();
      if (response.success && response.data.length > 0) {
        // Merge default categories with fetched ones
        const mergedCategories = [...new Set([...defaultCategories, ...response.data])];
        setCategories(mergedCategories);
      } else {
        setCategories(defaultCategories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories(defaultCategories);
    }
  };

  const handleAdd = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      description: '',
      category: 'General',
      announcement_date: new Date().toISOString().split('T')[0],
      link_url: '#',
      is_featured: false,
      is_active: true,
      display_order: 0
    });
    setSelectedFile(null);
    setExistingAttachment(null);
    setRemoveAttachment(false);
    setShowModal(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description || '',
      category: announcement.category || 'General',
      announcement_date: new Date(announcement.announcement_date).toISOString().split('T')[0],
      link_url: announcement.link_url || '#',
      is_featured: announcement.is_featured || false,
      is_active: announcement.is_active !== undefined ? announcement.is_active : true,
      display_order: announcement.display_order || 0
    });
    setSelectedFile(null);
    setExistingAttachment(announcement.attachment_url ? {
      url: announcement.attachment_url,
      name: announcement.attachment_name
    } : null);
    setRemoveAttachment(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    // Clear previous messages
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter announcement title');
      return;
    }

    if (!formData.announcement_date) {
      setError('Please select announcement date');
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Append all form fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('announcement_date', formData.announcement_date);
      submitData.append('link_url', formData.link_url);
      submitData.append('is_featured', formData.is_featured);
      submitData.append('is_active', formData.is_active);
      submitData.append('display_order', formData.display_order);

      // Append file if selected
      if (selectedFile) {
        submitData.append('attachment', selectedFile);
      }

      // Append remove attachment flag
      if (removeAttachment) {
        submitData.append('remove_attachment', 'true');
      }

      if (editingAnnouncement) {
        // Update existing
        await announcementsAPI.updateWithFile(editingAnnouncement.id, submitData);
        setSuccess('Announcement updated successfully!');
      } else {
        // Add new
        await announcementsAPI.createWithFile(submitData);
        setSuccess('Announcement created successfully!');
      }

      setShowModal(false);
      fetchAnnouncements();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save announcement: ' + err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
      setRemoveAttachment(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setRemoveAttachment(true);
    setExistingAttachment(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await announcementsAPI.delete(id);
      setSuccess('Announcement deleted successfully!');
      fetchAnnouncements();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete announcement: ' + err.message);
    }
  };

  const handleToggleActive = async (announcement) => {
    try {
      await announcementsAPI.update(announcement.id, {
        ...announcement,
        is_active: !announcement.is_active
      });
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to update status: ' + err.message);
    }
  };

  const handleToggleFeatured = async (announcement) => {
    try {
      await announcementsAPI.update(announcement.id, {
        ...announcement,
        is_featured: !announcement.is_featured
      });
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to update featured status: ' + err.message);
    }
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || announcement.category === filterCategory;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && announcement.is_active) ||
      (filterStatus === 'inactive' && !announcement.is_active) ||
      (filterStatus === 'featured' && announcement.is_featured);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get statistics
  const stats = {
    total: announcements.length,
    active: announcements.filter(a => a.is_active).length,
    featured: announcements.filter(a => a.is_featured).length,
    inactive: announcements.filter(a => !a.is_active).length
  };

  // Category colors
  const getCategoryColor = (category) => {
    const colors = {
      'Admission': 'bg-green-100 text-green-700 border-green-300',
      'Achievement': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'Partnership': 'bg-blue-100 text-blue-700 border-blue-300',
      'Event': 'bg-purple-100 text-purple-700 border-purple-300',
      'Academic': 'bg-red-100 text-red-700 border-red-300',
      'Examination': 'bg-orange-100 text-orange-700 border-orange-300',
      'Placement': 'bg-teal-100 text-teal-700 border-teal-300',
      'Conference': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'Scholarship': 'bg-pink-100 text-pink-700 border-pink-300',
      'Workshop': 'bg-cyan-100 text-cyan-700 border-cyan-300',
      'General': 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (loading && announcements.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate">Manage Announcements</h1>
        <p className="text-gray-600 mt-2">Create and manage website announcements</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <i className="fas fa-check-circle text-green-600 mr-3"></i>
            <p className="text-sm text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-600 mr-3"></i>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <i className="fas fa-bullhorn text-3xl text-purple-500"></i>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <i className="fas fa-check-circle text-3xl text-green-500"></i>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
            </div>
            <i className="fas fa-star text-3xl text-yellow-500"></i>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
            <i className="fas fa-eye-slash text-3xl text-gray-500"></i>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="featured">Featured Only</option>
            </select>
            <button
              onClick={handleAdd}
              className="bg-crimson text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Announcements Table */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <i className="fas fa-bullhorn text-gray-300 text-5xl mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Announcements Found</h3>
          <p className="text-gray-500">
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first announcement'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Horizontal Scroll Container */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attachment
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnnouncements.map((announcement) => (
                <tr
                  key={announcement.id}
                  className={`hover:bg-gray-50 ${!announcement.is_active ? 'opacity-60' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(announcement.announcement_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{announcement.title}</div>
                    {announcement.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {announcement.description.replace(/<[^>]*>/g, '')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getCategoryColor(announcement.category)}`}>
                      {announcement.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {announcement.attachment_url ? (
                      <a
                        href={`${getBaseURL()}${announcement.attachment_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title={announcement.attachment_name || 'Download attachment'}
                      >
                        <i className="fas fa-paperclip text-lg"></i>
                      </a>
                    ) : (
                      <span className="text-gray-300">
                        <i className="fas fa-minus"></i>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleFeatured(announcement)}
                      className={`text-2xl ${
                        announcement.is_featured ? 'text-yellow-500' : 'text-gray-300'
                      } hover:scale-110 transition-transform`}
                      title={announcement.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <i className={announcement.is_featured ? 'fas fa-star' : 'far fa-star'}></i>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleActive(announcement)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        announcement.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {announcement.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="text-crimson hover:text-red-900 mr-3"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-slate">
                  {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    placeholder="e.g., Admissions Open for Academic Year 2025-26"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-white"
                    style={{ minHeight: '150px' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.announcement_date}
                      onChange={(e) => setFormData({ ...formData, announcement_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      placeholder="/admission or https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-paperclip mr-2"></i>
                    Attachment (Optional)
                  </label>

                  {/* Show existing attachment */}
                  {existingAttachment && !removeAttachment && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <i className="fas fa-file text-blue-600 mr-2"></i>
                          <span className="text-sm text-blue-900">{existingAttachment.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <i className="fas fa-times mr-1"></i>
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show selected file */}
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <i className="fas fa-file text-green-600 mr-2"></i>
                          <span className="text-sm text-green-900">{selectedFile.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(selectedFile.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <i className="fas fa-times mr-1"></i>
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File input */}
                  {!existingAttachment && !selectedFile && (
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-crimson file:text-white hover:file:bg-red-800"
                    />
                  )}

                  {(!existingAttachment && !selectedFile) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Allowed formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF (Max 10MB)
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-6 pt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="h-4 w-4 text-crimson focus:ring-crimson border-gray-300 rounded"
                    />
                    <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                      <i className="fas fa-star text-yellow-500 mr-1"></i>
                      Mark as Featured
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 text-crimson focus:ring-crimson border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      <i className="fas fa-check-circle text-green-500 mr-1"></i>
                      Active
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <i className="fas fa-info-circle mr-2"></i>
                    <strong>Featured announcements</strong> will be highlighted on the announcements page.
                    Only active announcements will be visible to visitors.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  {editingAnnouncement ? 'Update' : 'Add'} Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAnnouncementsPage;
