import React, { useState, useEffect } from 'react';
import { getHomePageData, saveHomePageData, resetHomePageData } from '../../utils/homePageData';

const ManageHomePage = () => {
  const [formData, setFormData] = useState(getHomePageData());
  const [activeTab, setActiveTab] = useState('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState({
    hero: false,
    stats: false,
    programs: false,
    announcements: false,
    whyChoose: false,
    testimonials: false,
    cta: false
  });

  // Load data on component mount
  useEffect(() => {
    const data = getHomePageData();
    setFormData(data);
  }, []);

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
      } else if (section === 'whyChoose') {
        newData.whyChoose.features.push({
          icon: 'fas fa-star',
          title: '',
          description: ''
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

      if (section === 'whyChoose') {
        newData.whyChoose.features.splice(index, 1);
      } else {
        newData[section].splice(index, 1);
      }

      return newData;
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    const success = saveHomePageData(formData);

    setTimeout(() => {
      setIsSaving(false);
      if (success) {
        alert('Home page updated successfully! Refresh the home page to see changes.');
      } else {
        alert('Error saving data. Please try again.');
      }
    }, 500);
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
    { id: 'announcements', label: 'Announcements', icon: 'fa-bullhorn' },
    { id: 'whyChoose', label: 'Why Choose Us', icon: 'fa-star' },
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
                      <td className="px-6 py-4 text-sm text-gray-900">{formData.hero.description || '-'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700 bg-gray-50">Background Image</td>
                      <td className="px-6 py-4">
                        {formData.hero.image ? (
                          <div>
                            <img src={formData.hero.image} alt="Hero background" className="h-24 w-auto object-cover rounded-lg mb-2" />
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
                  <textarea
                    value={formData.hero.description}
                    onChange={(e) => handleChange('hero', 'description', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Background Image URL</label>
                  <input
                    type="text"
                    value={formData.hero.image}
                    onChange={(e) => handleChange('hero', 'image', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    placeholder="https://..."
                  />
                  {formData.hero.image && (
                    <img src={formData.hero.image} alt="Preview" className="mt-2 h-32 w-full object-cover rounded" />
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
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">{program.description || '-'}</td>
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
                        <textarea
                          value={program.description}
                          onChange={(e) => handleChange('featuredPrograms', 'description', e.target.value, index)}
                          rows="2"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
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

        {/* Announcements */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-lg font-bold text-slate">Announcements</h3>
              {!editMode.announcements ? (
                <button
                  onClick={() => setEditMode({ ...editMode, announcements: true })}
                  className="px-4 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition text-sm font-semibold"
                >
                  <i className="fas fa-edit mr-2"></i>Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddItem('announcements')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                  >
                    <i className="fas fa-plus mr-2"></i>Add Announcement
                  </button>
                  <button
                    onClick={() => setEditMode({ ...editMode, announcements: false })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                </div>
              )}
            </div>

            {!editMode.announcements ? (
              /* Table View */
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Title</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.announcements.map((announcement, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{announcement.date || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{announcement.title || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Form View */
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {formData.announcements.map((announcement, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                        <input
                          type="text"
                          value={announcement.date}
                          onChange={(e) => handleChange('announcements', 'date', e.target.value, index)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={announcement.title}
                          onChange={(e) => handleChange('announcements', 'title', e.target.value, index)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem('announcements', index)}
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
                      setEditMode({ ...editMode, announcements: false });
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    <i className="fas fa-check mr-2"></i>Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode({ ...editMode, announcements: false })}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Why Choose Us */}
        {activeTab === 'whyChoose' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate mb-4 pb-2 border-b">Why Choose Us Section</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
              <input
                type="text"
                value={formData.whyChoose.title}
                onChange={(e) => handleChange('whyChoose', 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h4 className="font-semibold text-slate">Features</h4>
              <button
                onClick={() => handleAddItem('whyChoose')}
                className="px-4 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 transition text-sm font-semibold"
              >
                <i className="fas fa-plus mr-2"></i>Add Feature
              </button>
            </div>

            {formData.whyChoose.features.map((feature, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold text-slate">Feature {index + 1}</h5>
                  <button
                    onClick={() => handleRemoveItem('whyChoose', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                      <input
                        type="text"
                        value={feature.icon}
                        onChange={(e) => handleChange('whyChoose', 'icon', e.target.value, index, 'features')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => handleChange('whyChoose', 'title', e.target.value, index, 'features')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={feature.description}
                      onChange={(e) => handleChange('whyChoose', 'description', e.target.value, index, 'features')}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
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
                    <textarea
                      value={testimonial.text}
                      onChange={(e) => handleChange('testimonials', 'text', e.target.value, index)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
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
              <textarea
                value={formData.cta.description}
                onChange={(e) => handleChange('cta', 'description', e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
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
