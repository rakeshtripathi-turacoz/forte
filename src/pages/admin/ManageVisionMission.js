import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api.config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ManageVisionMission.css';

const API_URL = API_CONFIG.API_URL;

const ManageVisionMission = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('vision');
  const [formData, setFormData] = useState({
    vision: {
      title: 'Our Vision',
      content: '',
      image_url: ''
    },
    mission: {
      title: 'Our Mission',
      content: '',
      image_url: ''
    },
    coreValues: []
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
      const response = await fetch(`${API_URL}/vision-mission/complete`);
      const data = await response.json();

      if (data.success) {
        const { vision, mission, coreValues } = data.data;

        setFormData({
          vision: vision || { title: 'Our Vision', content: '', image_url: '' },
          mission: mission || { title: 'Our Mission', content: '', image_url: '' },
          coreValues: coreValues || []
        });
      }
    } catch (error) {
      console.error('Error loading vision & mission data:', error);
      alert('Error loading data from backend. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vision: {
        ...prev.vision,
        [field]: value
      }
    }));
  };

  const handleMissionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      mission: {
        ...prev.mission,
        [field]: value
      }
    }));
  };

  const handleCoreValueChange = (index, field, value) => {
    setFormData(prev => {
      const newCoreValues = [...prev.coreValues];
      newCoreValues[index] = {
        ...newCoreValues[index],
        [field]: value
      };
      return {
        ...prev,
        coreValues: newCoreValues
      };
    });
  };

  const handleAddCoreValue = () => {
    setFormData(prev => ({
      ...prev,
      coreValues: [
        ...prev.coreValues,
        {
          title: '',
          description: '',
          icon_class: 'fas fa-star',
          display_order: prev.coreValues.length + 1
        }
      ]
    }));
  };

  const handleRemoveCoreValue = async (index, id) => {
    if (window.confirm('Are you sure you want to delete this core value?')) {
      try {
        if (id) {
          // Delete from backend
          await fetch(`${API_URL}/vision-mission/core-values/${id}`, {
            method: 'DELETE'
          });
        }

        // Remove from state
        setFormData(prev => ({
          ...prev,
          coreValues: prev.coreValues.filter((_, i) => i !== index)
        }));

        alert('Core value deleted successfully!');
      } catch (error) {
        console.error('Error deleting core value:', error);
        alert('Error deleting core value.');
      }
    }
  };

  const handleSaveVision = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving Vision Data:', formData.vision);
      console.log('📝 Vision Content Length:', formData.vision.content?.length);

      const response = await fetch(`${API_URL}/vision-mission/vision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.vision)
      });

      const result = await response.json();
      console.log('✅ Save Response:', result);

      alert('✅ Vision updated successfully!');
    } catch (error) {
      console.error('Error saving vision:', error);
      alert('❌ Error saving vision. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMission = async () => {
    try {
      setSaving(true);
      await fetch(`${API_URL}/vision-mission/mission`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.mission)
      });
      alert('✅ Mission updated successfully!');
    } catch (error) {
      console.error('Error saving mission:', error);
      alert('❌ Error saving mission. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCoreValues = async () => {
    try {
      setSaving(true);

      for (const value of formData.coreValues) {
        if (value.id) {
          // Update existing
          await fetch(`${API_URL}/vision-mission/core-values/${value.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(value)
          });
        } else {
          // Add new
          await fetch(`${API_URL}/vision-mission/core-values`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(value)
          });
        }
      }

      alert('✅ Core values updated successfully!');
      loadData(); // Reload to get IDs of new items
    } catch (error) {
      console.error('Error saving core values:', error);
      alert('❌ Error saving core values. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await handleSaveVision();
      await handleSaveMission();
      await handleSaveCoreValues();
      alert('✅ All changes saved successfully!');
      loadData();
    } catch (error) {
      console.error('Error saving all:', error);
      alert('❌ Error saving changes. Please try again.');
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate mb-2">Manage Vision & Mission</h1>
          <p className="text-sm text-gray-600">Update institute's vision, mission and core values - Frontend content shown below</p>
        </div>
        <button
          onClick={handleSaveAll}
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
              Save All Changes
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('vision')}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition ${
              activeTab === 'vision'
                ? 'text-crimson border-crimson'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <i className="fas fa-eye mr-2"></i>
            Vision
          </button>
          <button
            onClick={() => setActiveTab('mission')}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition ${
              activeTab === 'mission'
                ? 'text-crimson border-crimson'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <i className="fas fa-bullseye mr-2"></i>
            Mission
          </button>
          <button
            onClick={() => setActiveTab('coreValues')}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition ${
              activeTab === 'coreValues'
                ? 'text-crimson border-crimson'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <i className="fas fa-star mr-2"></i>
            Core Values ({formData.coreValues.length})
          </button>
        </div>
      </div>

      {/* Vision Tab */}
      {activeTab === 'vision' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vision Title
            </label>
            <input
              type="text"
              value={formData.vision.title}
              onChange={(e) => handleVisionChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
              placeholder="e.g., Our Vision"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vision Content
            </label>
            <ReactQuill
              theme="snow"
              value={formData.vision.content}
              onChange={(value) => handleVisionChange('content', value)}
              modules={quillModules}
              formats={quillFormats}
              className="bg-white"
              style={{ minHeight: '200px' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              This is what appears on the Vision & Mission page
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vision Image (Optional)
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
                    const formDataUpload = new FormData();
                    formDataUpload.append('image', file);

                    try {
                      const response = await fetch(`${API_CONFIG.BASE_URL}/api/upload/vision-image`, {
                        method: 'POST',
                        body: formDataUpload
                      });
                      const result = await response.json();
                      if (result.success) {
                        handleVisionChange('image_url', result.imageUrl);
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
              <p className="text-xs text-gray-500 mt-1">Upload a new image file (JPG, PNG, etc.)</p>
            </div>

            {/* OR URL Input */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Or Enter Image URL:</label>
              <input
                type="text"
                value={formData.vision.image_url || ''}
                onChange={(e) => handleVisionChange('image_url', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                placeholder="https://example.com/vision-image.jpg"
              />
            </div>

            {/* Image Preview */}
            {formData.vision.image_url && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                <img
                  src={formData.vision.image_url}
                  alt="Vision"
                  className="h-32 w-auto object-cover rounded-lg border-2 border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-2 break-all">{formData.vision.image_url}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSaveVision}
              disabled={saving}
              className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition font-semibold"
            >
              <i className="fas fa-save mr-2"></i>
              Save Vision
            </button>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              <i className="fas fa-undo mr-2"></i>
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Mission Tab */}
      {activeTab === 'mission' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mission Title
            </label>
            <input
              type="text"
              value={formData.mission.title}
              onChange={(e) => handleMissionChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
              placeholder="e.g., Our Mission"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mission Content
            </label>
            <ReactQuill
              theme="snow"
              value={formData.mission.content}
              onChange={(value) => handleMissionChange('content', value)}
              modules={quillModules}
              formats={quillFormats}
              className="bg-white"
              style={{ minHeight: '250px' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              This is what appears on the Vision & Mission page
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mission Image (Optional)
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
                    const formDataUpload = new FormData();
                    formDataUpload.append('image', file);

                    try {
                      const response = await fetch(`${API_CONFIG.BASE_URL}/api/upload/mission-image`, {
                        method: 'POST',
                        body: formDataUpload
                      });
                      const result = await response.json();
                      if (result.success) {
                        handleMissionChange('image_url', result.imageUrl);
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
              <p className="text-xs text-gray-500 mt-1">Upload a new image file (JPG, PNG, etc.)</p>
            </div>

            {/* OR URL Input */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Or Enter Image URL:</label>
              <input
                type="text"
                value={formData.mission.image_url || ''}
                onChange={(e) => handleMissionChange('image_url', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                placeholder="https://example.com/mission-image.jpg"
              />
            </div>

            {/* Image Preview */}
            {formData.mission.image_url && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                <img
                  src={formData.mission.image_url}
                  alt="Mission"
                  className="h-32 w-auto object-cover rounded-lg border-2 border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-2 break-all">{formData.mission.image_url}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSaveMission}
              disabled={saving}
              className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition font-semibold"
            >
              <i className="fas fa-save mr-2"></i>
              Save Mission
            </button>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              <i className="fas fa-undo mr-2"></i>
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Core Values Tab */}
      {activeTab === 'coreValues' && (
        <div className="space-y-4">
          {formData.coreValues.map((value, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate">Core Value #{index + 1}</h3>
                <button
                  onClick={() => handleRemoveCoreValue(index, value.id)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm"
                >
                  <i className="fas fa-trash mr-1"></i>
                  Delete
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={value.title}
                    onChange={(e) => handleCoreValueChange(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    placeholder="e.g., Excellence"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Icon Class <span className="text-xs text-gray-500">(Font Awesome)</span>
                  </label>
                  <input
                    type="text"
                    value={value.icon_class}
                    onChange={(e) => handleCoreValueChange(index, 'icon_class', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    placeholder="e.g., fas fa-star"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <ReactQuill
                    theme="snow"
                    value={value.description}
                    onChange={(content) => handleCoreValueChange(index, 'description', content)}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-white"
                    style={{ minHeight: '150px' }}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button
              onClick={handleAddCoreValue}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Core Value
            </button>
            <button
              onClick={handleSaveCoreValues}
              disabled={saving}
              className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition font-semibold"
            >
              <i className="fas fa-save mr-2"></i>
              Save Core Values
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVisionMission;
