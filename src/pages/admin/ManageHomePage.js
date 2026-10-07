import React, { useState, useEffect } from 'react';
import { getHomePageData, resetHomePageData, defaultHomePageData } from '../../utils/homePageData';
import { homeAPI } from '../../services/api';
import API_CONFIG from '../../config/api.config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ManageHomePage.css';

const ManageHomePage = () => {
  const [formData, setFormData] = useState(defaultHomePageData);
  const [activeTab, setActiveTab] = useState('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [editMode, setEditMode] = useState({
    hero: false,
    stats: false,
    programs: false,
    testimonials: false,
    cta: false
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

  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    // If already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Convert relative path to full URL
    return API_CONFIG.getFileUrl(imageUrl);
  };

  // Load data on component mount
  useEffect(() => {
    loadDataFromBackend();
  }, []);

  const loadDataFromBackend = async () => {
    try {
      const response = await fetch(`${API_CONFIG.API_URL}/home/complete`);
      const result = await response.json();

      if (result.success && result.data) {
        const backendData = result.data;

        // Transform backend data to formData format
        setFormData({
          hero: {
            title: backendData.hero?.hero_title || '',
            subtitle: backendData.hero?.hero_subtitle || '',
            description: backendData.hero?.hero_description || '',
            image: backendData.hero?.hero_background_image || '',
            buttons: {
              primary: {
                text: backendData.hero?.primary_btn_text || 'Explore Programs',
                link: '/academics',
                enabled: true
              },
              secondary: {
                text: backendData.hero?.secondary_btn_text || 'Apply Now',
                link: backendData.hero?.secondary_btn_link || '/admission',
                enabled: true
              }
            }
          },
          stats: (backendData.stats || []).map(stat => ({
            number: stat.stat_value,
            label: stat.stat_title
          })),
          featuredPrograms: (backendData.programs || []).map(program => ({
            title: program.program_title,
            description: program.program_description,
            icon: program.program_icon,
            link: program.program_link
          })),
          announcements: (backendData.announcements || []).map(announcement => ({
            date: announcement.announcement_date,
            title: announcement.announcement_title,
            link: announcement.announcement_link
          })),
          testimonials: (backendData.testimonials || []).map(testimonial => ({
            rating: testimonial.rating,
            text: testimonial.testimonial_text,
            name: testimonial.student_name,
            designation: testimonial.student_designation,
            avatar: testimonial.student_avatar_initials
          })),
          cta: {
            title: backendData.cta?.cta_title || '',
            description: backendData.cta?.cta_description || '',
            buttons: {
              primary: {
                text: backendData.cta?.primary_btn_text || 'Apply for Admission',
                link: '/admission',
                enabled: true
              },
              secondary: {
                text: backendData.cta?.secondary_btn_text || 'Schedule Campus Visit',
                link: backendData.cta?.secondary_btn_link || '/contact',
                enabled: true
              }
            }
          }
        });
      } else {
        // Fallback to localStorage if backend fails
        const data = getHomePageData();
        setFormData(data);
      }
    } catch (error) {
      console.error('Error loading data from backend:', error);
      // Fallback to localStorage if backend fails
      const data = getHomePageData();
      setFormData(data);
    }
  };

  const handleChange = (section, field, value, index = null, subfield = null) => {
    setFormData(prev => {
      const newData = { ...prev };

      if (index !== null) {
        // Handle array items
        if (subfield) {
          newData[section][index][subfield] = value;
        } else {
          newData[section][index][field] = value;
        }
      } else if (field.includes('.')) {
        // Handle nested objects (e.g., hero.buttons.primary.text)
        const keys = field.split('.');
        let current = newData[section];
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        // Handle simple fields
        newData[section][field] = value;
      }

      return newData;
    });
  };

  const handleAddItem = (section) => {
    setFormData(prev => {
      const newData = { ...prev };

      if (section === 'stats') {
        newData.stats.push({ number: '', label: '' });
      } else if (section === 'featuredPrograms') {
        newData.featuredPrograms.push({
          title: '',
          description: '',
          icon: 'fas fa-star',
          link: '/academics'
        });
      } else if (section === 'announcements') {
        newData.announcements.unshift({
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          title: '',
          link: '#'
        });
      } else if (section === 'testimonials') {
        newData.testimonials.push({
          rating: 5,
          text: '',
          name: '',
          designation: '',
          avatar: ''
        });
      }

      return newData;
    });
  };

  const handleRemoveItem = (section, index) => {
    setFormData(prev => {
      const newData = { ...prev };
      newData[section].splice(index, 1);
      return newData;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Save Hero Section
      await homeAPI.updateHero({
        hero_title: formData.hero.title,
        hero_subtitle: formData.hero.subtitle,
        hero_description: formData.hero.description,
        hero_background_image: formData.hero.image,
        primary_btn_text: formData.hero.buttons.primary.text,
        secondary_btn_text: formData.hero.buttons.secondary.text,
        secondary_btn_link: formData.hero.buttons.secondary.link
      });

      // Save Statistics Section
      // First, get all existing stats to delete them
      const statsResponse = await fetch(`${API_CONFIG.API_URL}/home/stats`);
      const statsData = await statsResponse.json();

      if (statsData.success && statsData.data) {
        // Delete all existing stats
        for (const stat of statsData.data) {
          await fetch(`${API_CONFIG.API_URL}/home/stats/${stat.id}`, { method: 'DELETE' });
        }
      }

      // Add all new stats
      for (let i = 0; i < formData.stats.length; i++) {
        const stat = formData.stats[i];
        await fetch(`${API_CONFIG.API_URL}/home/stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stat_value: stat.number,
            stat_title: stat.label,
            display_order: i
          })
        });
      }

      // Save Featured Programs Section
      const programsResponse = await fetch(`${API_CONFIG.API_URL}/home/programs`);
      const programsData = await programsResponse.json();

      if (programsData.success && programsData.data) {
        for (const program of programsData.data) {
          await fetch(`${API_CONFIG.API_URL}/home/programs/${program.id}`, { method: 'DELETE' });
        }
      }

      for (let i = 0; i < formData.featuredPrograms.length; i++) {
        const program = formData.featuredPrograms[i];
        await fetch(`${API_CONFIG.API_URL}/home/programs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            program_title: program.title,
            program_description: program.description,
            program_icon: program.icon,
            program_link: program.link,
            display_order: i
          })
        });
      }

      // Save Testimonials Section
      const testimonialsResponse = await fetch(`${API_CONFIG.API_URL}/home/testimonials`);
      const testimonialsData = await testimonialsResponse.json();

      if (testimonialsData.success && testimonialsData.data) {
        for (const testimonial of testimonialsData.data) {
          await fetch(`${API_CONFIG.API_URL}/home/testimonials/${testimonial.id}`, { method: 'DELETE' });
        }
      }

      for (let i = 0; i < formData.testimonials.length; i++) {
        const testimonial = formData.testimonials[i];
        await fetch(`${API_CONFIG.API_URL}/home/testimonials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_name: testimonial.name,
            student_designation: testimonial.designation,
            testimonial_text: testimonial.text,
            student_avatar_initials: testimonial.avatar,
            rating: testimonial.rating || 5,
            display_order: i
          })
        });
      }

      // Save CTA Section
      await homeAPI.updateCTA({
        cta_title: formData.cta.title,
        cta_description: formData.cta.description,
        primary_btn_text: formData.cta.buttons.primary.text,
        secondary_btn_text: formData.cta.buttons.secondary.text,
        secondary_btn_link: formData.cta.buttons.secondary.link
      });

      setSaveMessage('✅ Home page updated successfully!');
      alert('All sections saved successfully to database! Refresh the home page to see changes.');

    } catch (error) {
      console.error('Error saving home page data:', error);
      setSaveMessage('❌ Error saving data. Please try again.');
      alert('Error saving data to backend. Please check if the server is running.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default content? This cannot be undone.')) {
      const defaultData = resetHomePageData();
      setFormData(defaultData);
      alert('Home page reset to default content!');
    }
  };

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: 'fa-image' },
    { id: 'stats', label: 'Statistics', icon: 'fa-chart-bar' },
    { id: 'programs', label: 'Featured Programs', icon: 'fa-graduation-cap' },
    { id: 'testimonials', label: 'Testimonials', icon: 'fa-comments' },
    { id: 'cta', label: 'Call to Action', icon: 'fa-bullseye' }
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate mb-2">Manage Home Page</h1>
          <p className="text-sm text-gray-600">Update all home page content dynamically</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition font-semibold text-sm ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
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
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-sm"
          >
            <i className="fas fa-undo mr-2"></i>
            Reset to Default
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'text-crimson border-crimson'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <i className={`fas ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

        {/* Hero Section */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-lg font-bold text-slate">Hero Section</h3>
              {!editMode.hero ? (
                <button
                  onClick={() => setEditMode({ ...editMode, hero: true })}
                  className="px-4 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition text-sm font-semibold"
                >
                  <i className="fas fa-edit mr-2"></i>Edit
                </button>
              ) : (
                <button
                  onClick={() => setEditMode({ ...editMode, hero: false })}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-semibold"
                >
                  <i className="fas fa-times mr-2"></i>Cancel
                </button>
              )}
            </div>

            {!editMode.hero ? (
              /* Table View */
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50 w-1/4">Title</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formData.hero.title || '-'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">Subtitle (Institute Name)</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formData.hero.subtitle || '-'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">Description</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xl" dangerouslySetInnerHTML={{ __html: formData.hero.description || '-' }} />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">Background Image</td>
                      <td className="px-6 py-4">
                        {formData.hero.image ? (
                          <div>
                            <img
                              src={getImageUrl(formData.hero.image)}
                              alt="Hero background"
                              className="h-24 w-auto object-cover rounded-lg mb-2"
                              onError={(e) => {
                                console.error('Failed to load image:', formData.hero.image);
                                e.target.style.display = 'none';
                              }}
                            />
                            <p className="text-xs text-gray-500 break-all">{formData.hero.image}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">Primary Button</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formData.hero.buttons.primary.text || '-'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">Secondary Button</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formData.hero.buttons.secondary.text || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              /* Form View */
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.hero.title}
                    onChange={(e) => handleChange('hero', 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle (Institute Name)</label>
                  <input
                    type="text"
                    value={formData.hero.subtitle}
                    onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <ReactQuill
                    theme="snow"
                    value={formData.hero.description}
                    onChange={(value) => handleChange('hero', 'description', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-white"
                    style={{ minHeight: '200px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Background Image</label>

                  {/* File Upload Option */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">Upload New Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Upload to server
                          const formData = new FormData();
                          formData.append('image', file);

                          try {
                            const response = await fetch(`${API_CONFIG.BASE_URL}/api/upload/hero-image`, {
                              method: 'POST',
                              body: formData
                            });
                            const result = await response.json();
                            if (result.success) {
                              handleChange('hero', 'image', result.imageUrl);
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
                      value={formData.hero.image}
                      onChange={(e) => handleChange('hero', 'image', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Image Preview */}
                  {formData.hero.image && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                      <img
                        src={getImageUrl(formData.hero.image)}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          console.error('Failed to load preview image:', formData.hero.image);
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="12" fill="%23999"%3EImage Error%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-2 break-all">{formData.hero.image}</p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Button Text</label>
                    <input
                      type="text"
                      value={formData.hero.buttons.primary.text}
                      onChange={(e) => handleChange('hero', 'buttons.primary.text', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Button Text</label>
                    <input
                      type="text"
                      value={formData.hero.buttons.secondary.text}
                      onChange={(e) => handleChange('hero', 'buttons.secondary.text', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleSave();
                      setEditMode({ ...editMode, hero: false });
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    <i className="fas fa-check mr-2"></i>Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode({ ...editMode, hero: false })}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Section */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-lg font-bold text-slate">Statistics</h3>
              {!editMode.stats ? (
                <button
                  onClick={() => setEditMode({ ...editMode, stats: true })}
                  className="px-4 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition text-sm font-semibold"
                >
                  <i className="fas fa-edit mr-2"></i>Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddItem('stats')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                  >
                    <i className="fas fa-plus mr-2"></i>Add Stat
                  </button>
                  <button
                    onClick={() => setEditMode({ ...editMode, stats: false })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                </div>
              )}
            </div>

            {!editMode.stats ? (
              /* Table View */
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Number</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Label</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.stats.map((stat, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{stat.number || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{stat.label || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Form View */
              <div className="space-y-4">
                {formData.stats.map((stat, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Number</label>
                        <input
                          type="text"
                          value={stat.number}
                          onChange={(e) => handleChange('stats', 'number', e.target.value, index)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                          placeholder="e.g., 10+"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => handleChange('stats', 'label', e.target.value, index)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                          placeholder="e.g., Academic Programs"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem('stats', index)}
                      className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleSave();
                      setEditMode({ ...editMode, stats: false });
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    <i className="fas fa-check mr-2"></i>Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode({ ...editMode, stats: false })}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Featured Programs */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-lg font-bold text-slate">Featured Programs</h3>
              {!editMode.programs ? (
                <button
                  onClick={() => setEditMode({ ...editMode, programs: true })}
                  className="px-4 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition text-sm font-semibold"
                >
                  <i className="fas fa-edit mr-2"></i>Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddItem('featuredPrograms')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                  >
                    <i className="fas fa-plus mr-2"></i>Add Program
                  </button>
                  <button
                    onClick={() => setEditMode({ ...editMode, programs: false })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                </div>
              )}
            </div>

            {!editMode.programs ? (
              /* Table View */
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Icon</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.featuredPrograms.map((program, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 text-sm"><i className={`${program.icon} text-2xl text-crimson`}></i></td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{program.title || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                          <div className="line-clamp-2" dangerouslySetInnerHTML={{ __html: program.description || '-' }} />
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-600">{program.link || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Form View */
              <div className="space-y-4">
                {formData.featuredPrograms.map((program, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate">Program {index + 1}</h4>
                      <button
                        onClick={() => handleRemoveItem('featuredPrograms', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={program.title}
                            onChange={(e) => handleChange('featuredPrograms', 'title', e.target.value, index)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Icon (FontAwesome class)</label>
                          <input
                            type="text"
                            value={program.icon}
                            onChange={(e) => handleChange('featuredPrograms', 'icon', e.target.value, index)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                            placeholder="fas fa-laptop-code"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <ReactQuill
                          theme="snow"
                          value={program.description}
                          onChange={(value) => handleChange('featuredPrograms', 'description', value, index)}
                          modules={quillModules}
                          formats={quillFormats}
                          className="bg-white"
                          style={{ minHeight: '150px' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Link</label>
                        <input
                          type="text"
                          value={program.link}
                          onChange={(e) => handleChange('featuredPrograms', 'link', e.target.value, index)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleSave();
                      setEditMode({ ...editMode, programs: false });
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    <i className="fas fa-check mr-2"></i>Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode({ ...editMode, programs: false })}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Testimonials */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-lg font-bold text-slate">Student Testimonials</h3>
              <button
                onClick={() => handleAddItem('testimonials')}
                className="px-4 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition text-sm font-semibold"
              >
                <i className="fas fa-plus mr-2"></i>Add Testimonial
              </button>
            </div>

            {formData.testimonials.map((testimonial, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate">Testimonial {index + 1}</h4>
                  <button
                    onClick={() => handleRemoveItem('testimonials', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Testimonial Text</label>
                    <ReactQuill
                      theme="snow"
                      value={testimonial.text}
                      onChange={(value) => handleChange('testimonials', 'text', value, index)}
                      modules={quillModules}
                      formats={quillFormats}
                      className="bg-white"
                      style={{ minHeight: '150px' }}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(e) => handleChange('testimonials', 'name', e.target.value, index)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
                      <input
                        type="text"
                        value={testimonial.designation}
                        onChange={(e) => handleChange('testimonials', 'designation', e.target.value, index)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar (Initials)</label>
                      <input
                        type="text"
                        value={testimonial.avatar}
                        onChange={(e) => handleChange('testimonials', 'avatar', e.target.value, index)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                        placeholder="e.g., RK"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Save Button for Testimonials */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <i className="fas fa-save mr-2"></i>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                <i className="fas fa-eye mr-2"></i>
                Preview Home Page
              </a>
            </div>
          </div>
        )}

        {/* CTA Section */}
        {activeTab === 'cta' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate mb-4 pb-2 border-b">Call to Action Section</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.cta.title}
                onChange={(e) => handleChange('cta', 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <ReactQuill
                theme="snow"
                value={formData.cta.description}
                onChange={(value) => handleChange('cta', 'description', value)}
                modules={quillModules}
                formats={quillFormats}
                className="bg-white"
                style={{ minHeight: '150px' }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Button Text</label>
                <input
                  type="text"
                  value={formData.cta.buttons.primary.text}
                  onChange={(e) => handleChange('cta', 'buttons.primary.text', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Button Text</label>
                <input
                  type="text"
                  value={formData.cta.buttons.secondary.text}
                  onChange={(e) => handleChange('cta', 'buttons.secondary.text', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                />
              </div>
            </div>

            {/* Save Button for CTA */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <i className="fas fa-save mr-2"></i>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                <i className="fas fa-eye mr-2"></i>
                Preview Home Page
              </a>
            </div>
          </div>
        )}

        {/* Save Button Logic - Only show for sections NOT in edit mode */}
        {!editMode[activeTab] && (
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              <i className="fas fa-eye mr-2"></i>
              Preview Home Page
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageHomePage;
