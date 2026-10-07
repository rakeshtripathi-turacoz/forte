import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api.config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../admin/ManageHomePage.css';

const API_URL = API_CONFIG.API_URL;

const ManageAboutPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    page_title: '',
    page_subtitle: '',
    banner_image_url: '',
    overview_heading: '',
    overview_description: '',
    approval_badge_text: '',
    logo_tagline: ''
  });

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

  // Load data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/about-page`);
      const data = await response.json();

      if (data.success && data.data) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error loading about page data:', error);
      alert('Error loading data from backend. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/about-page`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ About page updated successfully!');
        loadData();
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving about page:', error);
      alert('❌ Error saving about page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate mb-2">Manage About Page</h1>
        <p className="text-gray-600">Update content for "About Forte Institute of Technology" page</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'overview'
              ? 'text-crimson border-b-2 border-crimson'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-info-circle mr-2"></i>
          Page Overview
        </button>
        <button
          onClick={() => setActiveTab('banner')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'banner'
              ? 'text-crimson border-b-2 border-crimson'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-image mr-2"></i>
          Banner Settings
        </button>
      </div>

      {/* Page Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Overview Heading
            </label>
            <input
              type="text"
              value={formData.overview_heading}
              onChange={(e) => handleChange('overview_heading', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
              placeholder="e.g., About Forte Institute of Technology"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Overview Description
            </label>
            <ReactQuill
              theme="snow"
              value={formData.overview_description}
              onChange={(value) => handleChange('overview_description', value)}
              modules={quillModules}
              formats={quillFormats}
              className="bg-white"
              style={{ minHeight: '300px' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              This content appears in the main overview section
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Approval Badge Text
            </label>
            <input
              type="text"
              value={formData.approval_badge_text}
              onChange={(e) => handleChange('approval_badge_text', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
              placeholder="e.g., AICTE Approved | AKTU Affiliated"
            />
            <p className="text-xs text-gray-500 mt-1">
              Yellow badge text showing approvals and affiliations
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logo Tagline
            </label>
            <input
              type="text"
              value={formData.logo_tagline}
              onChange={(e) => handleChange('logo_tagline', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
              placeholder="e.g., Excellence in Education"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tagline displayed under the logo
            </p>
          </div>
        </div>
      )}

      {/* Banner Settings Tab */}
      {activeTab === 'banner' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Page Title (Banner)
            </label>
            <input
              type="text"
              value={formData.page_title}
              onChange={(e) => handleChange('page_title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
              placeholder="e.g., About Forte Institute of Technology"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Page Subtitle (Banner)
            </label>
            <input
              type="text"
              value={formData.page_subtitle}
              onChange={(e) => handleChange('page_subtitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
              placeholder="e.g., Excellence in Education | Building Tomorrow's Leaders"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Banner Background Image
            </label>

            {/* File Upload Option */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Upload New Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const uploadData = new FormData();
                    uploadData.append('image', file);

                    try {
                      const response = await fetch(`${API_CONFIG.BASE_URL}/api/upload/banner-image`, {
                        method: 'POST',
                        body: uploadData
                      });
                      const result = await response.json();
                      if (result.success) {
                        handleChange('banner_image_url', result.imageUrl);
                        alert('Image uploaded successfully!');
                      } else {
                        alert('Failed to upload image: ' + result.message);
                      }
                    } catch (error) {
                      console.error('Upload error:', error);
                      alert('Error uploading image. Please try again.');
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Upload a new banner image (JPG, PNG, etc.)</p>
            </div>

            {/* OR URL Input */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Or Enter Image URL:</label>
              <input
                type="text"
                value={formData.banner_image_url}
                onChange={(e) => handleChange('banner_image_url', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            {/* Image Preview */}
            {formData.banner_image_url && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                <img
                  src={formData.banner_image_url}
                  alt="Banner"
                  className="h-32 w-full object-cover rounded-lg border-2 border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-2 break-all">{formData.banner_image_url}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-crimson text-white rounded-lg hover:bg-red-800 transition font-semibold disabled:opacity-50"
        >
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>
              Save Changes
            </>
          )}
        </button>
        <button
          onClick={loadData}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
        >
          <i className="fas fa-undo mr-2"></i>
          Reset
        </button>
      </div>
    </div>
  );
};

export default ManageAboutPage;
