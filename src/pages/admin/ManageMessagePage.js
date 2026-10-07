import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api.config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ManageHomePage.css';

const API_URL = API_CONFIG.API_URL;

const ManageMessagePage = ({ title, role }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: role || '',
    message_content: '',
    quote: '',
  });

  // Convert role to API format (e.g., "Director" -> "director")
  const roleType = role.toLowerCase().replace(/\s+/g, '_');

  // Quill editor configuration
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
    // eslint-disable-next-line
  }, [role]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/messages/${roleType}`);
      const result = await response.json();

      if (result.success && result.data) {
        setFormData({
          name: result.data.name || '',
          designation: result.data.designation || role || '',
          message_content: result.data.message_content || '',
          quote: result.data.quote || '',
        });

        // Set existing image preview
        if (result.data.profile_image_path) {
          const baseUrl = API_URL.replace('/api', '');
          setImagePreview(`${baseUrl}/${result.data.profile_image_path}`);
        }
      }
    } catch (error) {
      console.error('Error loading message data:', error);
      alert('Error loading data from backend. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
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

      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('designation', formData.designation);
      formDataToSend.append('message_content', formData.message_content);
      formDataToSend.append('quote', formData.quote || '');

      // Add image file if selected
      if (profileImage) {
        formDataToSend.append('profile_image', profileImage);
      }

      const response = await fetch(`${API_URL}/messages/${roleType}`, {
        method: 'PUT',
        body: formDataToSend // Don't set Content-Type header - browser will set it with boundary
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ ${title} updated successfully!`);
        setProfileImage(null); // Clear file input
        loadData(); // Reload data
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error(`Error saving ${title}:`, error);
      alert('❌ Error saving data. Please check if the server is running.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-slate mb-2">{title}</h1>
        <p className="text-sm text-gray-600">Update {role.toLowerCase()} message and profile - Frontend content shown below</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Profile Section */}
          <div>
            <h3 className="text-lg font-bold text-slate mb-4 pb-2 border-b">Profile Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                  placeholder={`Enter ${role.toLowerCase()} name`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                  placeholder="Enter designation"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted: JPG, PNG, GIF, WEBP (Max 5MB) - Leave empty to keep current image
                </p>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-32 h-32 object-cover rounded-full border-4 border-gray-200 shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Section */}
          <div>
            <h3 className="text-lg font-bold text-slate mb-4 pb-2 border-b">Message Content</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <ReactQuill
                  theme="snow"
                  value={formData.message_content}
                  onChange={(value) => setFormData({ ...formData, message_content: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  style={{ minHeight: '300px' }}
                  placeholder="Enter message content"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will appear on the {role}'s Message page
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quote (Optional)
                </label>
                <textarea
                  name="quote"
                  value={formData.quote}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                  placeholder="Enter inspirational quote"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition font-semibold ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
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
              type="button"
              onClick={() => {
                setProfileImage(null);
                loadData();
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              <i className="fas fa-undo mr-2"></i>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Individual message page components
export const ManageChairmanMessage = () => (
  <ManageMessagePage title="Manage Chairman's Message" role="Chairman" />
);

export const ManageSecretaryMessage = () => (
  <ManageMessagePage title="Manage Secretary's Message" role="Secretary" />
);

export const ManageJointSecretaryMessage = () => (
  <ManageMessagePage title="Manage Joint Secretary's Message" role="Joint Secretary" />
);

export const ManageDirectorMessage = () => (
  <ManageMessagePage title="Manage Director's Message" role="Director" />
);

export default ManageMessagePage;
