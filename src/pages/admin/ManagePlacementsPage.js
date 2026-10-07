import React, { useState, useEffect } from 'react';
import { placementsAPI, academicsAPI } from '../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ManagePlacementsPage = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // ============================================
  // TAB 1: Student Placement Records State
  // ============================================
  const [placements, setPlacements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [placementForm, setPlacementForm] = useState({
    id: null,
    student_name: '',
    course_id: '',
    batch_year: new Date().getFullYear().toString(),
    company_name: '',
    package_lpa: '',
    job_role: '',
    placement_date: new Date().toISOString().split('T')[0],
    student_photo_url: '',
    is_featured: false
  });
  const [filterBatch, setFilterBatch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [stats, setStats] = useState([]);

  // ============================================
  // TAB 2: Coordinator State
  // ============================================
  const [coordinator, setCoordinator] = useState({
    name: '',
    title: 'Placement Coordinator',
    message_title: '',
    message_paragraph_1: '',
    message_paragraph_2: '',
    email: '',
    phone: '',
    photo_url: ''
  });

  // ============================================
  // TAB 3: Training Programs State
  // ============================================
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programForm, setProgramForm] = useState({
    program_name: '',
    icon: 'fas fa-graduation-cap',
    icon_bg_color: 'bg-crimson',
    description: '',
    features: [],
    display_order: 0,
    is_active: true
  });
  const [currentFeature, setCurrentFeature] = useState('');

  // ============================================
  // TAB 4: Recruiters State
  // ============================================
  const [recruiters, setRecruiters] = useState([]);
  const [editingRecruiter, setEditingRecruiter] = useState(null);
  const [recruiterForm, setRecruiterForm] = useState({
    company_name: '',
    logo_icon: 'fas fa-building',
    website_url: '',
    sector: '',
    display_order: 0,
    is_active: true
  });

  // ============================================
  // TAB 5: Page Statistics State
  // ============================================
  const [pageStatistics, setPageStatistics] = useState([]);
  const [editingStatistic, setEditingStatistic] = useState(null);
  const [statisticForm, setStatisticForm] = useState({
    stat_label: '',
    stat_value: '',
    icon: 'fas fa-chart-line',
    description: '',
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(-2),
    display_order: 0,
    is_active: true
  });

  // ============================================
  // TAB 6: Contact Info State
  // ============================================
  const [contactInfo, setContactInfo] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    contact_type: 'students',
    title: '',
    email: '',
    phone: '',
    office_hours: '',
    additional_info: '',
    button_text: '',
    button_link: '',
    is_active: true,
    display_order: 0
  });

  // ============================================
  // Initial Data Load
  // ============================================
  useEffect(() => {
    if (activeTab === 'records') {
      loadPlacements();
      loadCourses();
      loadStats();
    } else if (activeTab === 'coordinator') {
      fetchCoordinator();
    } else if (activeTab === 'programs') {
      fetchTrainingPrograms();
    } else if (activeTab === 'recruiters') {
      fetchRecruiters();
    } else if (activeTab === 'statistics') {
      fetchPageStatistics();
    } else if (activeTab === 'contact') {
      fetchContactInfo();
    }
  }, [activeTab, filterBatch, filterCompany]);

  // ============================================
  // TAB 1: Student Records Functions
  // ============================================
  const loadPlacements = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filterBatch) params.batch_year = filterBatch;
      if (filterCompany) params.company = filterCompany;
      const response = await placementsAPI.getPlacements(params);
      if (response.success) {
        setPlacements(response.data);
      }
    } catch (error) {
      setError('Failed to load placements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await academicsAPI.getCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await placementsAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      if (editMode && placementForm.id) {
        await placementsAPI.updatePlacement(placementForm.id, placementForm);
        setSuccess('Placement record updated successfully!');
      } else {
        await placementsAPI.addPlacement(placementForm);
        setSuccess('Placement record added successfully!');
      }
      resetForm();
      loadPlacements();
      loadStats();
    } catch (error) {
      setError(error.message || 'Failed to save placement record');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (placement) => {
    setPlacementForm({
      id: placement.id,
      student_name: placement.student_name,
      course_id: placement.course_id || '',
      batch_year: placement.batch_year || '',
      company_name: placement.company_name,
      package_lpa: placement.package_lpa || '',
      job_role: placement.job_role || '',
      placement_date: placement.placement_date ? placement.placement_date.split('T')[0] : '',
      student_photo_url: placement.student_photo_url || '',
      is_featured: placement.is_featured || false
    });
    setEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this placement record?')) return;
    try {
      setLoading(true);
      await placementsAPI.deletePlacement(id);
      setSuccess('Placement record deleted successfully!');
      loadPlacements();
      loadStats();
    } catch (error) {
      setError('Failed to delete placement record');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPlacementForm({
      id: null,
      student_name: '',
      course_id: '',
      batch_year: new Date().getFullYear().toString(),
      company_name: '',
      package_lpa: '',
      job_role: '',
      placement_date: new Date().toISOString().split('T')[0],
      student_photo_url: '',
      is_featured: false
    });
    setEditMode(false);
  };

  const batchYears = [...new Set(placements.map(p => p.batch_year))].sort((a, b) => b - a);
  const companies = [...new Set(placements.map(p => p.company_name))].sort();

  // ============================================
  // TAB 2: Coordinator Functions
  // ============================================
  const fetchCoordinator = async () => {
    setLoading(true);
    try {
      const response = await placementsAPI.getCoordinator();
      if (response.success && response.data) {
        setCoordinator(response.data);
      }
    } catch (error) {
      console.error('Error fetching coordinator:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCoordinator = async () => {
    if (!coordinator.name || !coordinator.message_title || !coordinator.message_paragraph_1) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await placementsAPI.updateCoordinator(coordinator);
      setSuccess('Coordinator information updated successfully!');
      fetchCoordinator();
    } catch (error) {
      console.error('Error saving coordinator:', error);
      setError('Failed to save coordinator information');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // TAB 3: Training Programs Functions
  // ============================================
  const fetchTrainingPrograms = async () => {
    setLoading(true);
    try {
      const response = await placementsAPI.getTrainingPrograms();
      if (response.success) {
        setTrainingPrograms(response.data);
      }
    } catch (error) {
      console.error('Error fetching training programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgram = async () => {
    if (!programForm.program_name) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      // Convert features array to JSON string for backend
      const dataToSend = {
        ...programForm,
        features: JSON.stringify(programForm.features)
      };

      if (editingProgram) {
        await placementsAPI.updateTrainingProgram(editingProgram.id, dataToSend);
        setSuccess('Training program updated successfully!');
      } else {
        await placementsAPI.createTrainingProgram(dataToSend);
        setSuccess('Training program created successfully!');
      }
      resetProgramForm();
      fetchTrainingPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
      setError('Failed to save training program');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training program?')) return;
    setLoading(true);
    try {
      await placementsAPI.deleteTrainingProgram(id);
      setSuccess('Training program deleted successfully!');
      fetchTrainingPrograms();
    } catch (error) {
      console.error('Error deleting program:', error);
      setError('Failed to delete training program');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProgram = (program) => {
    setProgramForm({
      program_name: program.program_name,
      icon: program.icon,
      icon_bg_color: program.icon_bg_color,
      description: program.description || '',
      features: typeof program.features === 'string' ? JSON.parse(program.features) : (program.features || []),
      display_order: program.display_order,
      is_active: program.is_active !== undefined ? program.is_active : true
    });
    setEditingProgram(program);
  };

  const resetProgramForm = () => {
    setProgramForm({
      program_name: '',
      icon: 'fas fa-graduation-cap',
      icon_bg_color: 'bg-crimson',
      description: '',
      features: [],
      display_order: 0,
      is_active: true
    });
    setEditingProgram(null);
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      setProgramForm({
        ...programForm,
        features: [...programForm.features, currentFeature.trim()]
      });
      setCurrentFeature('');
    }
  };

  const removeFeature = (index) => {
    setProgramForm({
      ...programForm,
      features: programForm.features.filter((_, i) => i !== index)
    });
  };

  // ============================================
  // TAB 4: Recruiters Functions
  // ============================================
  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const response = await placementsAPI.getRecruiters();
      if (response.success) {
        setRecruiters(response.data);
      }
    } catch (error) {
      console.error('Error fetching recruiters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecruiter = async () => {
    if (!recruiterForm.company_name) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create recruiter data object
      const recruiterData = {
        company_name: recruiterForm.company_name,
        logo_icon: recruiterForm.logo_icon,
        website_url: recruiterForm.website_url || '',
        sector: recruiterForm.sector || '',
        display_order: recruiterForm.display_order || 0,
        logo_url: ''
      };

      // Add is_active if editing
      if (editingRecruiter) {
        recruiterData.is_active = true;
      }

      console.log('Saving recruiter with data:', recruiterData);

      const response = editingRecruiter
        ? await placementsAPI.updateRecruiter(editingRecruiter.id, recruiterData)
        : await placementsAPI.createRecruiter(recruiterData);

      console.log('Save response:', response);

      if (response.success) {
        setSuccess(editingRecruiter ? 'Recruiter updated successfully!' : 'Recruiter created successfully!');
        resetRecruiterForm();
        fetchRecruiters();
      } else {
        console.error('Save failed with response:', response);
        setError(response.message || 'Failed to save recruiter');
      }
    } catch (error) {
      console.error('Error saving recruiter - Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      setError(error.response?.message || error.message || 'Failed to save recruiter');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecruiter = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recruiter?')) return;
    setLoading(true);
    try {
      await placementsAPI.deleteRecruiter(id);
      setSuccess('Recruiter deleted successfully!');
      fetchRecruiters();
    } catch (error) {
      console.error('Error deleting recruiter:', error);
      setError('Failed to delete recruiter');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecruiter = (recruiter) => {
    setRecruiterForm({
      company_name: recruiter.company_name,
      logo_icon: recruiter.logo_icon,
      website_url: recruiter.website_url || '',
      sector: recruiter.sector || '',
      display_order: recruiter.display_order,
      is_active: recruiter.is_active !== undefined ? recruiter.is_active : true
    });
    setEditingRecruiter(recruiter);
  };

  const resetRecruiterForm = () => {
    setRecruiterForm({
      company_name: '',
      logo_icon: 'fas fa-building',
      website_url: '',
      sector: '',
      display_order: 0,
      is_active: true
    });
    setEditingRecruiter(null);
  };

  // ============================================
  // TAB 5: Page Statistics Functions
  // ============================================
  const fetchPageStatistics = async () => {
    setLoading(true);
    try {
      const response = await placementsAPI.getPageStatistics();
      if (response.success) {
        setPageStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching page statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStatistic = async () => {
    if (!statisticForm.stat_label || !statisticForm.stat_value) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      if (editingStatistic) {
        await placementsAPI.updatePageStatistic(editingStatistic.id, statisticForm);
        setSuccess('Statistic updated successfully!');
      } else {
        await placementsAPI.createPageStatistic(statisticForm);
        setSuccess('Statistic created successfully!');
      }
      resetStatisticForm();
      fetchPageStatistics();
    } catch (error) {
      console.error('Error saving statistic:', error);
      setError('Failed to save statistic');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStatistic = async (id) => {
    if (!window.confirm('Are you sure you want to delete this statistic?')) return;
    setLoading(true);
    try {
      await placementsAPI.deletePageStatistic(id);
      setSuccess('Statistic deleted successfully!');
      fetchPageStatistics();
    } catch (error) {
      console.error('Error deleting statistic:', error);
      setError('Failed to delete statistic');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatistic = (statistic) => {
    setStatisticForm({
      stat_label: statistic.stat_label,
      stat_value: statistic.stat_value,
      icon: statistic.icon,
      description: statistic.description || '',
      academic_year: statistic.academic_year || '',
      display_order: statistic.display_order,
      is_active: statistic.is_active !== undefined ? statistic.is_active : true
    });
    setEditingStatistic(statistic);
  };

  const resetStatisticForm = () => {
    setStatisticForm({
      stat_label: '',
      stat_value: '',
      icon: 'fas fa-chart-line',
      description: '',
      academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(-2),
      display_order: 0,
      is_active: true
    });
    setEditingStatistic(null);
  };

  // ============================================
  // TAB 6: Contact Info Functions
  // ============================================
  const fetchContactInfo = async () => {
    setLoading(true);
    try {
      const response = await placementsAPI.getContactInfo();
      if (response.success) {
        setContactInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async () => {
    if (!contactForm.title || !contactForm.contact_type) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      if (editingContact) {
        await placementsAPI.updateContactInfo(editingContact.id, contactForm);
        setSuccess('Contact info updated successfully!');
      } else {
        await placementsAPI.createContactInfo(contactForm);
        setSuccess('Contact info created successfully!');
      }
      resetContactForm();
      fetchContactInfo();
    } catch (error) {
      console.error('Error saving contact info:', error);
      setError('Failed to save contact info');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact info?')) return;
    setLoading(true);
    try {
      await placementsAPI.deleteContactInfo(id);
      setSuccess('Contact info deleted successfully!');
      fetchContactInfo();
    } catch (error) {
      console.error('Error deleting contact info:', error);
      setError('Failed to delete contact info');
    } finally {
      setLoading(false);
    }
  };

  const handleEditContact = (contact) => {
    setContactForm({
      contact_type: contact.contact_type,
      title: contact.title,
      email: contact.email || '',
      phone: contact.phone || '',
      office_hours: contact.office_hours || '',
      additional_info: contact.additional_info || '',
      button_text: contact.button_text || '',
      button_link: contact.button_link || '',
      display_order: contact.display_order,
      is_active: contact.is_active !== undefined ? contact.is_active : true
    });
    setEditingContact(contact);
  };

  const resetContactForm = () => {
    setContactForm({
      contact_type: 'students',
      title: '',
      email: '',
      phone: '',
      office_hours: '',
      additional_info: '',
      button_text: '',
      button_link: '',
      is_active: true,
      display_order: 0
    });
    setEditingContact(null);
  };

  // ============================================
  // RENDER: Tab Navigation
  // ============================================
  const tabs = [
    { id: 'records', label: 'Student Records', icon: 'fa-users' },
    { id: 'coordinator', label: 'Coordinator Message', icon: 'fa-user-tie' },
    { id: 'programs', label: 'Training Programs', icon: 'fa-chalkboard-teacher' },
    { id: 'recruiters', label: 'Recruiters', icon: 'fa-building' },
    { id: 'statistics', label: 'Page Statistics', icon: 'fa-chart-bar' },
    { id: 'contact', label: 'Contact Info', icon: 'fa-address-book' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-slate mb-2">Manage Placements</h1>
        <p className="text-sm text-gray-600">Manage placement records and page content</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 min-w-[150px] px-4 py-3 rounded-lg font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-crimson text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className={`fas ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <i className="fas fa-check-circle mr-2"></i>
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* TAB 1: Student Records */}
      {activeTab === 'records' && (
        <>
          {/* Statistics Cards */}
          {stats.length > 0 && (
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {stats.slice(0, 1).map((stat) => (
                <React.Fragment key={stat.batch_year}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Placements</div>
                    <div className="text-2xl font-bold text-crimson">{stat.total_placements}</div>
                    <div className="text-xs text-gray-500">Batch {stat.batch_year}</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Average Package</div>
                    <div className="text-2xl font-bold text-green-600">₹{stat.avg_package} LPA</div>
                    <div className="text-xs text-gray-500">Batch {stat.batch_year}</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Highest Package</div>
                    <div className="text-2xl font-bold text-blue-600">₹{stat.highest_package} LPA</div>
                    <div className="text-xs text-gray-500">Batch {stat.batch_year}</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Lowest Package</div>
                    <div className="text-2xl font-bold text-purple-600">₹{stat.lowest_package} LPA</div>
                    <div className="text-xs text-gray-500">Batch {stat.batch_year}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Add/Edit Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {editMode ? 'Edit Placement Record' : 'Add New Placement Record'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={placementForm.student_name}
                    onChange={(e) => setPlacementForm({ ...placementForm, student_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Rahul Kumar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course
                  </label>
                  <select
                    value={placementForm.course_id}
                    onChange={(e) => setPlacementForm({ ...placementForm, course_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={placementForm.company_name}
                    onChange={(e) => setPlacementForm({ ...placementForm, company_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., TCS, Infosys, Wipro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Role
                  </label>
                  <input
                    type="text"
                    value={placementForm.job_role}
                    onChange={(e) => setPlacementForm({ ...placementForm, job_role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Package (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={placementForm.package_lpa}
                    onChange={(e) => setPlacementForm({ ...placementForm, package_lpa: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., 4.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Batch Year
                  </label>
                  <input
                    type="number"
                    value={placementForm.batch_year}
                    onChange={(e) => setPlacementForm({ ...placementForm, batch_year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Placement Date
                  </label>
                  <input
                    type="date"
                    value={placementForm.placement_date}
                    onChange={(e) => setPlacementForm({ ...placementForm, placement_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Photo URL
                  </label>
                  <input
                    type="url"
                    value={placementForm.student_photo_url}
                    onChange={(e) => setPlacementForm({ ...placementForm, student_photo_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={placementForm.is_featured}
                      onChange={(e) => setPlacementForm({ ...placementForm, is_featured: e.target.checked })}
                      className="w-4 h-4 text-crimson border-gray-300 rounded focus:ring-crimson"
                    />
                    <span className="ml-2 text-sm font-semibold text-gray-700">
                      Featured Placement (Display prominently on website)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                  {editMode ? 'Update Record' : 'Add Record'}
                </button>

                {editMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-calendar mr-2"></i>
                  Filter by Batch Year
                </label>
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                >
                  <option value="">All Batches</option>
                  {batchYears.map((year) => (
                    <option key={year} value={year}>
                      Batch {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-building mr-2"></i>
                  Filter by Company
                </label>
                <select
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <div className="w-full bg-crimson bg-opacity-10 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Total Records</div>
                  <div className="text-2xl font-bold text-crimson">{placements.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Placements List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              Placement Records ({placements.length})
            </h2>

            {loading && placements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Loading placement records...</p>
              </div>
            ) : placements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-briefcase text-4xl mb-2"></i>
                <p>No placement records found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {placements.map((placement) => (
                  <div
                    key={placement.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition ${
                      placement.is_featured ? 'border-gold bg-yellow-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate">{placement.student_name}</h3>
                          {placement.is_featured && (
                            <span className="px-2 py-1 bg-gold text-white text-xs font-semibold rounded">
                              <i className="fas fa-star mr-1"></i>
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <i className="fas fa-building mr-2 text-gray-400"></i>
                            <span className="font-semibold">{placement.company_name}</span>
                          </div>
                          <div>
                            <i className="fas fa-briefcase mr-2 text-gray-400"></i>
                            {placement.job_role || 'Not specified'}
                          </div>
                          {placement.package_lpa && (
                            <div>
                              <i className="fas fa-rupee-sign mr-2 text-gray-400"></i>
                              Package: <span className="font-semibold text-green-600">₹{parseFloat(placement.package_lpa).toFixed(2)} LPA</span>
                            </div>
                          )}
                          {placement.course_name && (
                            <div>
                              <i className="fas fa-graduation-cap mr-2 text-gray-400"></i>
                              {placement.course_name}
                            </div>
                          )}
                          <div>
                            <i className="fas fa-calendar mr-2 text-gray-400"></i>
                            Batch: {placement.batch_year}
                          </div>
                          {placement.placement_date && (
                            <div>
                              <i className="fas fa-clock mr-2 text-gray-400"></i>
                              Placed: {new Date(placement.placement_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(placement)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(placement.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition"
                          title="Delete"
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
        </>
      )}

      {/* TAB 2: Coordinator Message */}
      {activeTab === 'coordinator' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-slate mb-4">Placement Coordinator Information</h2>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={coordinator.name}
                    onChange={(e) => setCoordinator({ ...coordinator, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Dr. [Name]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={coordinator.title}
                    onChange={(e) => setCoordinator({ ...coordinator, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Placement Coordinator"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={coordinator.email}
                    onChange={(e) => setCoordinator({ ...coordinator, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="placements@fit.ac.in"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={coordinator.phone}
                    onChange={(e) => setCoordinator({ ...coordinator, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="+91 98765-43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo URL</label>
                <input
                  type="url"
                  value={coordinator.photo_url}
                  onChange={(e) => setCoordinator({ ...coordinator, photo_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message Title *</label>
                <input
                  type="text"
                  value={coordinator.message_title}
                  onChange={(e) => setCoordinator({ ...coordinator, message_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  placeholder="Message from Placement Coordinator"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message Paragraph 1 *</label>
                <ReactQuill
                  theme="snow"
                  value={coordinator.message_paragraph_1}
                  onChange={(value) => setCoordinator({ ...coordinator, message_paragraph_1: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  placeholder="First paragraph of the coordinator's message..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message Paragraph 2</label>
                <ReactQuill
                  theme="snow"
                  value={coordinator.message_paragraph_2}
                  onChange={(value) => setCoordinator({ ...coordinator, message_paragraph_2: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  placeholder="Second paragraph of the coordinator's message (optional)..."
                />
              </div>

              <button
                onClick={handleSaveCoordinator}
                disabled={loading}
                className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
              >
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                Save Coordinator Info
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Training Programs */}
      {activeTab === 'programs' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {editingProgram ? 'Edit Training Program' : 'Add Training Program'}
            </h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Program Name *</label>
                  <input
                    type="text"
                    value={programForm.program_name}
                    onChange={(e) => setProgramForm({ ...programForm, program_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Soft Skills Development"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon Class</label>
                  <input
                    type="text"
                    value={programForm.icon}
                    onChange={(e) => setProgramForm({ ...programForm, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="fas fa-brain"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon Background Color</label>
                  <select
                    value={programForm.icon_bg_color}
                    onChange={(e) => setProgramForm({ ...programForm, icon_bg_color: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  >
                    <option value="bg-crimson">Crimson</option>
                    <option value="bg-gold">Gold</option>
                    <option value="bg-slate">Slate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={programForm.display_order}
                    onChange={(e) => setProgramForm({ ...programForm, display_order: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <ReactQuill
                  theme="snow"
                  value={programForm.description}
                  onChange={(value) => setProgramForm({ ...programForm, description: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  placeholder="Brief description of the training program..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Features</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Type a feature and click Add..."
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {programForm.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <i className="fas fa-check text-green-600"></i>
                      <span className="flex-1">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveProgram}
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                  {editingProgram ? 'Update Program' : 'Add Program'}
                </button>
                {editingProgram && (
                  <button
                    onClick={resetProgramForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">Training Programs ({trainingPrograms.length})</h2>
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              </div>
            ) : trainingPrograms.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No training programs found.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {trainingPrograms.map((program) => (
                  <div key={program.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${program.icon_bg_color} rounded-lg flex items-center justify-center`}>
                          <i className={`${program.icon} text-white text-xl`}></i>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate">{program.program_name}</h3>
                          <p className="text-xs text-gray-500">Order: {program.display_order}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProgram(program)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(program.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    {program.description && (
                      <div className="text-sm text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: program.description }}></div>
                    )}
                    {program.features && (
                      <div className="text-xs text-gray-500">
                        {(typeof program.features === 'string' ? JSON.parse(program.features) : program.features).slice(0, 2).map((feat, i) => (
                          <div key={i}><i className="fas fa-check text-green-600 mr-1"></i>{feat}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 4: Recruiters */}
      {activeTab === 'recruiters' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {editingRecruiter ? 'Edit Recruiter' : 'Add Recruiter'}
            </h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={recruiterForm.company_name}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, company_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Microsoft"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Logo Icon</label>
                  <input
                    type="text"
                    value={recruiterForm.logo_icon}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, logo_icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="fab fa-microsoft"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
                  <input
                    type="url"
                    value={recruiterForm.website_url}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, website_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="https://www.company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sector</label>
                  <input
                    type="text"
                    value={recruiterForm.sector}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, sector: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="IT, Manufacturing, Finance, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={recruiterForm.display_order}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, display_order: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveRecruiter}
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                  {editingRecruiter ? 'Update Recruiter' : 'Add Recruiter'}
                </button>
                {editingRecruiter && (
                  <button
                    onClick={resetRecruiterForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">Recruiters ({recruiters.length})</h2>
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              </div>
            ) : recruiters.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recruiters found.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recruiters.map((recruiter) => (
                  <div key={recruiter.id} className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="flex justify-end gap-2 mb-2">
                      <button
                        onClick={() => handleEditRecruiter(recruiter)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteRecruiter(recruiter.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className={`${recruiter.logo_icon} text-slate text-xl`}></i>
                    </div>
                    <h3 className="font-semibold text-sm text-slate">{recruiter.company_name}</h3>
                    {recruiter.sector && (
                      <p className="text-xs text-gray-500">{recruiter.sector}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 5: Page Statistics */}
      {activeTab === 'statistics' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {editingStatistic ? 'Edit Statistic' : 'Add Statistic'}
            </h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Statistic Label *</label>
                  <input
                    type="text"
                    value={statisticForm.stat_label}
                    onChange={(e) => setStatisticForm({ ...statisticForm, stat_label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Placement Rate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Statistic Value *</label>
                  <input
                    type="text"
                    value={statisticForm.stat_value}
                    onChange={(e) => setStatisticForm({ ...statisticForm, stat_value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., 90%+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon Class</label>
                  <input
                    type="text"
                    value={statisticForm.icon}
                    onChange={(e) => setStatisticForm({ ...statisticForm, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="fas fa-chart-line"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year</label>
                  <input
                    type="text"
                    value={statisticForm.academic_year}
                    onChange={(e) => setStatisticForm({ ...statisticForm, academic_year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="2023-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={statisticForm.display_order}
                    onChange={(e) => setStatisticForm({ ...statisticForm, display_order: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <ReactQuill
                  theme="snow"
                  value={statisticForm.description}
                  onChange={(value) => setStatisticForm({ ...statisticForm, description: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  placeholder="Additional description..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveStatistic}
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                  {editingStatistic ? 'Update Statistic' : 'Add Statistic'}
                </button>
                {editingStatistic && (
                  <button
                    onClick={resetStatisticForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">Page Statistics ({pageStatistics.length})</h2>
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              </div>
            ) : pageStatistics.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No statistics found.</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {pageStatistics.map((stat) => (
                  <div key={stat.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-10 h-10 bg-crimson rounded-full flex items-center justify-center">
                        <i className={`${stat.icon} text-white`}></i>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStatistic(stat)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteStatistic(stat.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-crimson mb-1">{stat.stat_value}</div>
                    <div className="text-sm font-semibold text-slate">{stat.stat_label}</div>
                    {stat.academic_year && (
                      <div className="text-xs text-gray-500 mt-1">Year: {stat.academic_year}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 6: Contact Information */}
      {activeTab === 'contact' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {editingContact ? 'Edit Contact Info' : 'Add Contact Info'}
            </h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Type *</label>
                  <select
                    value={contactForm.contact_type}
                    onChange={(e) => setContactForm({ ...contactForm, contact_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  >
                    <option value="students">For Students</option>
                    <option value="recruiters">For Recruiters</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={contactForm.title}
                    onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., For Students"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="placements@fit.ac.in"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="+91 98765-43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Office Hours</label>
                  <input
                    type="text"
                    value={contactForm.office_hours}
                    onChange={(e) => setContactForm({ ...contactForm, office_hours: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Monday - Friday, 9:00 AM - 6:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={contactForm.display_order}
                    onChange={(e) => setContactForm({ ...contactForm, display_order: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Information</label>
                <ReactQuill
                  theme="snow"
                  value={contactForm.additional_info}
                  onChange={(value) => setContactForm({ ...contactForm, additional_info: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  placeholder="Any additional information..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
                  <input
                    type="text"
                    value={contactForm.button_text}
                    onChange={(e) => setContactForm({ ...contactForm, button_text: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Contact Us"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Button Link</label>
                  <input
                    type="url"
                    value={contactForm.button_link}
                    onChange={(e) => setContactForm({ ...contactForm, button_link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="/contact"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveContact}
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                  {editingContact ? 'Update Contact Info' : 'Add Contact Info'}
                </button>
                {editingContact && (
                  <button
                    onClick={resetContactForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">Contact Information ({contactInfo.length})</h2>
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              </div>
            ) : contactInfo.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No contact information found.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {contactInfo.map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate">{contact.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          contact.contact_type === 'students' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {contact.contact_type === 'students' ? 'Students' : 'Recruiters'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditContact(contact)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {contact.email && (
                        <div><i className="fas fa-envelope mr-2"></i>{contact.email}</div>
                      )}
                      {contact.phone && (
                        <div><i className="fas fa-phone mr-2"></i>{contact.phone}</div>
                      )}
                      {contact.office_hours && (
                        <div><i className="fas fa-clock mr-2"></i>{contact.office_hours}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ManagePlacementsPage;
