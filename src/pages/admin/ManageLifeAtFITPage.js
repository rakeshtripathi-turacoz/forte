import React, { useState, useEffect } from 'react';
import { lifeAtFitAPI } from '../../services/api';

const ManageLifeAtFITPage = () => {
  const [activeTab, setActiveTab] = useState('activities');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Activities State
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityForm, setActivityForm] = useState({
    title: '',
    icon: 'fas fa-users',
    description: '',
    display_order: 0,
    items: []
  });
  const [newItem, setNewItem] = useState('');

  // Facilities State
  const [facilities, setFacilities] = useState([]);
  const [editingFacility, setEditingFacility] = useState(null);
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    icon: 'fas fa-building',
    description: '',
    display_order: 0
  });

  // Hostel Features State
  const [hostelFeatures, setHostelFeatures] = useState([]);
  const [editingHostelFeature, setEditingHostelFeature] = useState(null);
  const [hostelFeatureForm, setHostelFeatureForm] = useState({
    hostel_type: 'boys',
    feature_text: '',
    display_order: 0
  });

  // Testimonials State
  const [testimonials, setTestimonials] = useState([]);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    student_name: '',
    course: '',
    year: '',
    testimonial_text: '',
    avatar_url: '',
    rating: 5,
    is_featured: false,
    display_order: 0
  });

  // Fetch Statistics
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await lifeAtFitAPI.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'activities') {
      fetchActivities();
    } else if (activeTab === 'facilities') {
      fetchFacilities();
    } else if (activeTab === 'hostel') {
      fetchHostelFeatures();
    } else if (activeTab === 'testimonials') {
      fetchTestimonials();
    }
  }, [activeTab]);

  // ============================================
  // ACTIVITIES CRUD
  // ============================================

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await lifeAtFitAPI.getActivities();
      if (response.success) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      alert('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveActivity = async () => {
    if (!activityForm.title || !activityForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingActivity) {
        await lifeAtFitAPI.updateActivity(editingActivity.id, activityForm);
        alert('Activity updated successfully!');
      } else {
        await lifeAtFitAPI.createActivity(activityForm);
        alert('Activity created successfully!');
      }
      resetActivityForm();
      fetchActivities();
      fetchStatistics();
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityForm({
      title: activity.title,
      icon: activity.icon,
      description: activity.description,
      display_order: activity.display_order,
      items: activity.items.map(item => item.item_name)
    });
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;

    setLoading(true);
    try {
      await lifeAtFitAPI.deleteActivity(id);
      alert('Activity deleted successfully!');
      fetchActivities();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity');
    } finally {
      setLoading(false);
    }
  };

  const resetActivityForm = () => {
    setEditingActivity(null);
    setActivityForm({
      title: '',
      icon: 'fas fa-users',
      description: '',
      display_order: 0,
      items: []
    });
    setNewItem('');
  };

  const addItemToActivity = () => {
    if (newItem.trim()) {
      setActivityForm({
        ...activityForm,
        items: [...activityForm.items, newItem.trim()]
      });
      setNewItem('');
    }
  };

  const removeItemFromActivity = (index) => {
    setActivityForm({
      ...activityForm,
      items: activityForm.items.filter((_, i) => i !== index)
    });
  };

  // ============================================
  // FACILITIES CRUD
  // ============================================

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const response = await lifeAtFitAPI.getFacilities();
      if (response.success) {
        setFacilities(response.data);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
      alert('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFacility = async () => {
    if (!facilityForm.name || !facilityForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingFacility) {
        await lifeAtFitAPI.updateFacility(editingFacility.id, facilityForm);
        alert('Facility updated successfully!');
      } else {
        await lifeAtFitAPI.createFacility(facilityForm);
        alert('Facility created successfully!');
      }
      resetFacilityForm();
      fetchFacilities();
      fetchStatistics();
    } catch (error) {
      console.error('Error saving facility:', error);
      alert('Failed to save facility');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFacility = (facility) => {
    setEditingFacility(facility);
    setFacilityForm({
      name: facility.name,
      icon: facility.icon,
      description: facility.description,
      display_order: facility.display_order
    });
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;

    setLoading(true);
    try {
      await lifeAtFitAPI.deleteFacility(id);
      alert('Facility deleted successfully!');
      fetchFacilities();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting facility:', error);
      alert('Failed to delete facility');
    } finally {
      setLoading(false);
    }
  };

  const resetFacilityForm = () => {
    setEditingFacility(null);
    setFacilityForm({
      name: '',
      icon: 'fas fa-building',
      description: '',
      display_order: 0
    });
  };

  // ============================================
  // HOSTEL FEATURES CRUD
  // ============================================

  const fetchHostelFeatures = async () => {
    setLoading(true);
    try {
      const response = await lifeAtFitAPI.getHostelFeatures();
      if (response.success) {
        setHostelFeatures(response.data);
      }
    } catch (error) {
      console.error('Error fetching hostel features:', error);
      alert('Failed to fetch hostel features');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHostelFeature = async () => {
    if (!hostelFeatureForm.feature_text) {
      alert('Please enter feature text');
      return;
    }

    setLoading(true);
    try {
      if (editingHostelFeature) {
        await lifeAtFitAPI.updateHostelFeature(editingHostelFeature.id, hostelFeatureForm);
        alert('Hostel feature updated successfully!');
      } else {
        await lifeAtFitAPI.createHostelFeature(hostelFeatureForm);
        alert('Hostel feature created successfully!');
      }
      resetHostelFeatureForm();
      fetchHostelFeatures();
      fetchStatistics();
    } catch (error) {
      console.error('Error saving hostel feature:', error);
      alert('Failed to save hostel feature');
    } finally {
      setLoading(false);
    }
  };

  const handleEditHostelFeature = (feature) => {
    setEditingHostelFeature(feature);
    setHostelFeatureForm({
      hostel_type: feature.hostel_type,
      feature_text: feature.feature_text,
      display_order: feature.display_order
    });
  };

  const handleDeleteHostelFeature = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hostel feature?')) return;

    setLoading(true);
    try {
      await lifeAtFitAPI.deleteHostelFeature(id);
      alert('Hostel feature deleted successfully!');
      fetchHostelFeatures();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting hostel feature:', error);
      alert('Failed to delete hostel feature');
    } finally {
      setLoading(false);
    }
  };

  const resetHostelFeatureForm = () => {
    setEditingHostelFeature(null);
    setHostelFeatureForm({
      hostel_type: 'boys',
      feature_text: '',
      display_order: 0
    });
  };

  // ============================================
  // TESTIMONIALS CRUD
  // ============================================

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await lifeAtFitAPI.getTestimonials();
      if (response.success) {
        setTestimonials(response.data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      alert('Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTestimonial = async () => {
    if (!testimonialForm.student_name || !testimonialForm.course || !testimonialForm.year || !testimonialForm.testimonial_text) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingTestimonial) {
        await lifeAtFitAPI.updateTestimonial(editingTestimonial.id, testimonialForm);
        alert('Testimonial updated successfully!');
      } else {
        await lifeAtFitAPI.createTestimonial(testimonialForm);
        alert('Testimonial created successfully!');
      }
      resetTestimonialForm();
      fetchTestimonials();
      fetchStatistics();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Failed to save testimonial');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTestimonial = (testimonial) => {
    setEditingTestimonial(testimonial);
    setTestimonialForm({
      student_name: testimonial.student_name,
      course: testimonial.course,
      year: testimonial.year,
      testimonial_text: testimonial.testimonial_text,
      avatar_url: testimonial.avatar_url || '',
      rating: testimonial.rating,
      is_featured: testimonial.is_featured,
      display_order: testimonial.display_order
    });
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    setLoading(true);
    try {
      await lifeAtFitAPI.deleteTestimonial(id);
      alert('Testimonial deleted successfully!');
      fetchTestimonials();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial');
    } finally {
      setLoading(false);
    }
  };

  const resetTestimonialForm = () => {
    setEditingTestimonial(null);
    setTestimonialForm({
      student_name: '',
      course: '',
      year: '',
      testimonial_text: '',
      avatar_url: '',
      rating: 5,
      is_featured: false,
      display_order: 0
    });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate mb-2">Manage Life@FIT Content</h1>
        <p className="text-gray-600">Manage campus life activities, facilities, hostel features, and student testimonials</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-border_gray">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Activities</p>
                <p className="text-2xl font-bold text-slate">{statistics.activities}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-border_gray">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Facilities</p>
                <p className="text-2xl font-bold text-slate">{statistics.facilities}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-building text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-border_gray">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Testimonials</p>
                <p className="text-2xl font-bold text-slate">{statistics.testimonials}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="fas fa-quote-right text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-border_gray">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Hostel Features</p>
                <p className="text-2xl font-bold text-slate">{statistics.hostel_features}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fas fa-bed text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-border_gray">
        <div className="border-b border-border_gray">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'activities'
                  ? 'text-crimson border-b-2 border-crimson'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-users mr-2"></i>Activities
            </button>
            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'facilities'
                  ? 'text-crimson border-b-2 border-crimson'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-building mr-2"></i>Facilities
            </button>
            <button
              onClick={() => setActiveTab('hostel')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'hostel'
                  ? 'text-crimson border-b-2 border-crimson'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-bed mr-2"></i>Hostel Features
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'testimonials'
                  ? 'text-crimson border-b-2 border-crimson'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-quote-right mr-2"></i>Testimonials
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* ACTIVITIES TAB */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-border_gray">
                <h3 className="text-xl font-bold text-slate mb-4">
                  {editingActivity ? 'Edit Activity' : 'Add New Activity'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={activityForm.title}
                      onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      placeholder="e.g., Student Clubs & Societies"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon Class
                      </label>
                      <input
                        type="text"
                        value={activityForm.icon}
                        onChange={(e) => setActivityForm({ ...activityForm, icon: e.target.value })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                        placeholder="fas fa-users"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={activityForm.display_order}
                        onChange={(e) => setActivityForm({ ...activityForm, display_order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={activityForm.description}
                      onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      rows="3"
                      placeholder="Brief description of the activity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Items (tags)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addItemToActivity()}
                        className="flex-1 px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                        placeholder="Add an item and press Enter"
                      />
                      <button
                        type="button"
                        onClick={addItemToActivity}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activityForm.items.map((item, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeItemFromActivity(index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveActivity}
                      disabled={loading}
                      className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : editingActivity ? 'Update Activity' : 'Add Activity'}
                    </button>
                    {editingActivity && (
                      <button
                        onClick={resetActivityForm}
                        className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Activities List */}
              <div>
                <h3 className="text-xl font-bold text-slate mb-4">Existing Activities</h3>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="bg-white p-4 rounded-lg border border-border_gray">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <i className={`${activity.icon} text-crimson`}></i>
                              <h4 className="font-bold text-slate">{activity.title}</h4>
                              <span className="text-xs text-gray-500">Order: {activity.display_order}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {activity.items && activity.items.map((item) => (
                                <span key={item.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                  {item.item_name}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditActivity(activity)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FACILITIES TAB */}
          {activeTab === 'facilities' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-border_gray">
                <h3 className="text-xl font-bold text-slate mb-4">
                  {editingFacility ? 'Edit Facility' : 'Add New Facility'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={facilityForm.name}
                      onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      placeholder="e.g., Library"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon Class
                      </label>
                      <input
                        type="text"
                        value={facilityForm.icon}
                        onChange={(e) => setFacilityForm({ ...facilityForm, icon: e.target.value })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                        placeholder="fas fa-book"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={facilityForm.display_order}
                        onChange={(e) => setFacilityForm({ ...facilityForm, display_order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={facilityForm.description}
                      onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      rows="2"
                      placeholder="Brief description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveFacility}
                      disabled={loading}
                      className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : editingFacility ? 'Update Facility' : 'Add Facility'}
                    </button>
                    {editingFacility && (
                      <button
                        onClick={resetFacilityForm}
                        className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Facilities List */}
              <div>
                <h3 className="text-xl font-bold text-slate mb-4">Existing Facilities</h3>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {facilities.map((facility) => (
                      <div key={facility.id} className="bg-white p-4 rounded-lg border border-border_gray">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <i className={`${facility.icon} text-crimson`}></i>
                            <h4 className="font-bold text-slate">{facility.name}</h4>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditFacility(facility)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteFacility(facility.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{facility.description}</p>
                        <p className="text-xs text-gray-500 mt-2">Order: {facility.display_order}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HOSTEL FEATURES TAB */}
          {activeTab === 'hostel' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-border_gray">
                <h3 className="text-xl font-bold text-slate mb-4">
                  {editingHostelFeature ? 'Edit Hostel Feature' : 'Add New Hostel Feature'}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hostel Type *
                      </label>
                      <select
                        value={hostelFeatureForm.hostel_type}
                        onChange={(e) => setHostelFeatureForm({ ...hostelFeatureForm, hostel_type: e.target.value })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      >
                        <option value="boys">Boys Hostel</option>
                        <option value="girls">Girls Hostel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={hostelFeatureForm.display_order}
                        onChange={(e) => setHostelFeatureForm({ ...hostelFeatureForm, display_order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feature Text *
                    </label>
                    <input
                      type="text"
                      value={hostelFeatureForm.feature_text}
                      onChange={(e) => setHostelFeatureForm({ ...hostelFeatureForm, feature_text: e.target.value })}
                      className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      placeholder="e.g., 24/7 security and CCTV surveillance"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveHostelFeature}
                      disabled={loading}
                      className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : editingHostelFeature ? 'Update Feature' : 'Add Feature'}
                    </button>
                    {editingHostelFeature && (
                      <button
                        onClick={resetHostelFeatureForm}
                        className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Hostel Features List */}
              <div>
                <h3 className="text-xl font-bold text-slate mb-4">Existing Hostel Features</h3>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate mb-3">Boys Hostel</h4>
                      <div className="space-y-2">
                        {hostelFeatures.filter(f => f.hostel_type === 'boys').map((feature) => (
                          <div key={feature.id} className="bg-white p-3 rounded-lg border border-border_gray flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              <span className="text-sm">{feature.feature_text}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditHostelFeature(feature)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteHostelFeature(feature.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate mb-3">Girls Hostel</h4>
                      <div className="space-y-2">
                        {hostelFeatures.filter(f => f.hostel_type === 'girls').map((feature) => (
                          <div key={feature.id} className="bg-white p-3 rounded-lg border border-border_gray flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              <span className="text-sm">{feature.feature_text}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditHostelFeature(feature)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteHostelFeature(feature.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TESTIMONIALS TAB */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-border_gray">
                <h3 className="text-xl font-bold text-slate mb-4">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Name *
                      </label>
                      <input
                        type="text"
                        value={testimonialForm.student_name}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, student_name: e.target.value })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course *
                      </label>
                      <input
                        type="text"
                        value={testimonialForm.course}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, course: e.target.value })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                        placeholder="MCA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year *
                      </label>
                      <input
                        type="text"
                        value={testimonialForm.year}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, year: e.target.value })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                        placeholder="2nd Year"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Testimonial Text *
                    </label>
                    <textarea
                      value={testimonialForm.testimonial_text}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, testimonial_text: e.target.value })}
                      className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      rows="3"
                      placeholder="Student's testimonial..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Avatar URL
                      </label>
                      <input
                        type="text"
                        value={testimonialForm.avatar_url}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, avatar_url: e.target.value })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={testimonialForm.rating}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={testimonialForm.display_order}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, display_order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-border_gray rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={testimonialForm.is_featured}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, is_featured: e.target.checked })}
                        className="w-4 h-4 text-crimson focus:ring-crimson"
                      />
                      <span className="text-sm font-medium text-gray-700">Feature this testimonial</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveTestimonial}
                      disabled={loading}
                      className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-red-800 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                    </button>
                    {editingTestimonial && (
                      <button
                        onClick={resetTestimonialForm}
                        className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Testimonials List */}
              <div>
                <h3 className="text-xl font-bold text-slate mb-4">Existing Testimonials</h3>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <div className="space-y-4">
                    {testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="bg-white p-4 rounded-lg border border-border_gray">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                {testimonial.avatar_url ? (
                                  <img src={testimonial.avatar_url} alt={testimonial.student_name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <i className="fas fa-user text-gray-400"></i>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate">{testimonial.student_name}</h4>
                                <p className="text-xs text-gray-500">{testimonial.course}, {testimonial.year}</p>
                              </div>
                              {testimonial.is_featured && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Featured</span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm italic">"{testimonial.testimonial_text}"</p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="text-yellow-500">
                                {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                              </div>
                              <span className="text-xs text-gray-500">Order: {testimonial.display_order}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditTestimonial(testimonial)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(testimonial.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageLifeAtFITPage;
