import React, { useState, useEffect } from 'react';
import { careersAPI } from '../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ManageCareersPage = () => {
  const [activeTab, setActiveTab] = useState('header');
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
  // TAB 1: Page Header State
  // ============================================
  const [header, setHeader] = useState({
    title: 'Career Opportunities',
    subtitle: ''
  });

  // ============================================
  // TAB 2: Benefits State
  // ============================================
  const [benefits, setBenefits] = useState([]);
  const [editingBenefit, setEditingBenefit] = useState(null);
  const [benefitForm, setBenefitForm] = useState({
    title: '',
    description: '',
    icon: 'fas fa-star',
    icon_bg_color: '#B91C1C',
    display_order: 0
  });

  // ============================================
  // TAB 3: Application Steps State
  // ============================================
  const [appSteps, setAppSteps] = useState([]);
  const [editingStep, setEditingStep] = useState(null);
  const [stepForm, setStepForm] = useState({
    step_number: 1,
    step_title: '',
    step_description: '',
    icon: 'fas fa-check',
    display_order: 0
  });

  // ============================================
  // TAB 4: General Application State
  // ============================================
  const [generalApp, setGeneralApp] = useState({
    section_title: '',
    section_description: '',
    contact_email: '',
    contact_phone: '',
    additional_info: '',
    button_text: 'Send Your Resume',
    button_link: ''
  });

  // ============================================
  // TAB 5: HR Contacts State
  // ============================================
  const [hrContacts, setHRContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    contact_type: 'email',
    contact_title: '',
    contact_details: '',
    display_order: 0
  });

  // ============================================
  // Initial Data Load
  // ============================================
  useEffect(() => {
    if (activeTab === 'header') {
      fetchHeader();
    } else if (activeTab === 'benefits') {
      fetchBenefits();
    } else if (activeTab === 'steps') {
      fetchAppSteps();
    } else if (activeTab === 'general') {
      fetchGeneralApp();
    } else if (activeTab === 'contacts') {
      fetchHRContacts();
    }
  }, [activeTab]);

  // ============================================
  // TAB 1: Header Functions
  // ============================================
  const fetchHeader = async () => {
    setLoading(true);
    try {
      const response = await careersAPI.getHeader();
      if (response.success && response.data) {
        setHeader(response.data);
      }
    } catch (error) {
      console.error('Error fetching header:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeader = async () => {
    if (!header.title || !header.subtitle) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await careersAPI.updateHeader(header);
      setSuccess('Page header updated successfully!');
      fetchHeader();
    } catch (error) {
      console.error('Error saving header:', error);
      setError('Failed to save header');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // TAB 2: Benefits Functions
  // ============================================
  const fetchBenefits = async () => {
    setLoading(true);
    try {
      const response = await careersAPI.getBenefits();
      if (response.success) {
        setBenefits(response.data);
      }
    } catch (error) {
      console.error('Error fetching benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBenefit = async () => {
    if (!benefitForm.title) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      if (editingBenefit) {
        await careersAPI.updateBenefit(editingBenefit.id, benefitForm);
        setSuccess('Benefit updated successfully!');
      } else {
        await careersAPI.createBenefit(benefitForm);
        setSuccess('Benefit created successfully!');
      }
      resetBenefitForm();
      fetchBenefits();
    } catch (error) {
      console.error('Error saving benefit:', error);
      setError('Failed to save benefit');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBenefit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this benefit?')) return;
    setLoading(true);
    try {
      await careersAPI.deleteBenefit(id);
      setSuccess('Benefit deleted successfully!');
      fetchBenefits();
    } catch (error) {
      console.error('Error deleting benefit:', error);
      setError('Failed to delete benefit');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBenefit = (benefit) => {
    setBenefitForm({
      title: benefit.title,
      description: benefit.description || '',
      icon: benefit.icon,
      icon_bg_color: benefit.icon_bg_color,
      display_order: benefit.display_order
    });
    setEditingBenefit(benefit);
  };

  const resetBenefitForm = () => {
    setBenefitForm({
      title: '',
      description: '',
      icon: 'fas fa-star',
      icon_bg_color: '#B91C1C',
      display_order: 0
    });
    setEditingBenefit(null);
  };

  // ============================================
  // TAB 3: Application Steps Functions
  // ============================================
  const fetchAppSteps = async () => {
    setLoading(true);
    try {
      const response = await careersAPI.getApplicationSteps();
      if (response.success) {
        setAppSteps(response.data);
      }
    } catch (error) {
      console.error('Error fetching application steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStep = async () => {
    if (!stepForm.step_title || !stepForm.step_description) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      if (editingStep) {
        await careersAPI.updateApplicationStep(editingStep.id, stepForm);
        setSuccess('Application step updated successfully!');
      } else {
        await careersAPI.createApplicationStep(stepForm);
        setSuccess('Application step created successfully!');
      }
      resetStepForm();
      fetchAppSteps();
    } catch (error) {
      console.error('Error saving step:', error);
      setError('Failed to save application step');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStep = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application step?')) return;
    setLoading(true);
    try {
      await careersAPI.deleteApplicationStep(id);
      setSuccess('Application step deleted successfully!');
      fetchAppSteps();
    } catch (error) {
      console.error('Error deleting step:', error);
      setError('Failed to delete application step');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStep = (step) => {
    setStepForm({
      step_number: step.step_number,
      step_title: step.step_title,
      step_description: step.step_description,
      icon: step.icon,
      display_order: step.display_order
    });
    setEditingStep(step);
  };

  const resetStepForm = () => {
    setStepForm({
      step_number: 1,
      step_title: '',
      step_description: '',
      icon: 'fas fa-check',
      display_order: 0
    });
    setEditingStep(null);
  };

  // ============================================
  // TAB 4: General Application Functions
  // ============================================
  const fetchGeneralApp = async () => {
    setLoading(true);
    try {
      const response = await careersAPI.getGeneralApplication();
      if (response.success && response.data) {
        setGeneralApp(response.data);
      }
    } catch (error) {
      console.error('Error fetching general application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneralApp = async () => {
    if (!generalApp.section_title || !generalApp.section_description) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await careersAPI.updateGeneralApplication(generalApp);
      setSuccess('General application section updated successfully!');
      fetchGeneralApp();
    } catch (error) {
      console.error('Error saving general application:', error);
      setError('Failed to save general application');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // TAB 5: HR Contacts Functions
  // ============================================
  const fetchHRContacts = async () => {
    setLoading(true);
    try {
      const response = await careersAPI.getHRContacts();
      if (response.success) {
        setHRContacts(response.data);
      }
    } catch (error) {
      console.error('Error fetching HR contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async () => {
    if (!contactForm.contact_title || !contactForm.contact_details) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      if (editingContact) {
        await careersAPI.updateHRContact(editingContact.id, contactForm);
        setSuccess('HR contact updated successfully!');
      } else {
        await careersAPI.createHRContact(contactForm);
        setSuccess('HR contact created successfully!');
      }
      resetContactForm();
      fetchHRContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      setError('Failed to save HR contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this HR contact?')) return;
    setLoading(true);
    try {
      await careersAPI.deleteHRContact(id);
      setSuccess('HR contact deleted successfully!');
      fetchHRContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      setError('Failed to delete HR contact');
    } finally {
      setLoading(false);
    }
  };

  const handleEditContact = (contact) => {
    setContactForm({
      contact_type: contact.contact_type,
      contact_title: contact.contact_title,
      contact_details: contact.contact_details,
      display_order: contact.display_order
    });
    setEditingContact(contact);
  };

  const resetContactForm = () => {
    setContactForm({
      contact_type: 'email',
      contact_title: '',
      contact_details: '',
      display_order: 0
    });
    setEditingContact(null);
  };

  // ============================================
  // RENDER: Tab Navigation
  // ============================================
  const tabs = [
    { id: 'header', label: 'Page Header', icon: 'fa-heading' },
    { id: 'benefits', label: 'Benefits', icon: 'fa-gift' },
    { id: 'steps', label: 'Application Steps', icon: 'fa-tasks' },
    { id: 'general', label: 'General Application', icon: 'fa-paper-plane' },
    { id: 'contacts', label: 'HR Contacts', icon: 'fa-address-book' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-slate mb-2">Manage Careers Page</h1>
        <p className="text-sm text-gray-600">Manage careers page content</p>
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

      {/* TAB 1: Page Header */}
      {activeTab === 'header' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-slate mb-4">Page Header Content</h2>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={header.title}
                  onChange={(e) => setHeader({ ...header, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  placeholder="Career Opportunities"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle *</label>
                <ReactQuill
                  theme="snow"
                  value={header.subtitle}
                  onChange={(value) => setHeader({ ...header, subtitle: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  placeholder="Introduction paragraph..."
                />
              </div>

              <button
                onClick={handleSaveHeader}
                disabled={loading}
                className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
              >
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                Save Header
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Benefits */}
      {activeTab === 'benefits' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {editingBenefit ? 'Edit Benefit' : 'Add Benefit'}
            </h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={benefitForm.title}
                    onChange={(e) => setBenefitForm({ ...benefitForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Competitive Salary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon Class</label>
                  <input
                    type="text"
                    value={benefitForm.icon}
                    onChange={(e) => setBenefitForm({ ...benefitForm, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="fas fa-money-bill-wave"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <ReactQuill
                  theme="snow"
                  value={benefitForm.description}
                  onChange={(value) => setBenefitForm({ ...benefitForm, description: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  placeholder="Brief description..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon Background Color</label>
                  <input
                    type="color"
                    value={benefitForm.icon_bg_color}
                    onChange={(e) => setBenefitForm({ ...benefitForm, icon_bg_color: e.target.value })}
                    className="w-full h-10 px-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={benefitForm.display_order}
                    onChange={(e) => setBenefitForm({ ...benefitForm, display_order: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveBenefit}
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                  {editingBenefit ? 'Update Benefit' : 'Add Benefit'}
                </button>
                {editingBenefit && (
                  <button
                    onClick={resetBenefitForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">Benefits ({benefits.length})</h2>
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              </div>
            ) : benefits.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No benefits found.</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit.id} className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="flex justify-end gap-2 mb-2">
                      <button
                        onClick={() => handleEditBenefit(benefit)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteBenefit(benefit.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ backgroundColor: benefit.icon_bg_color }}
                    >
                      <i className={`${benefit.icon} text-white text-xl`}></i>
                    </div>
                    <h3 className="font-semibold text-slate text-sm">{benefit.title}</h3>
                    {benefit.description && (
                      <div className="text-xs text-gray-500 mt-1" dangerouslySetInnerHTML={{ __html: benefit.description }}></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 3: Application Steps */}
      {activeTab === 'steps' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {editingStep ? 'Edit Application Step' : 'Add Application Step'}
            </h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Step Number *</label>
                  <input
                    type="number"
                    value={stepForm.step_number}
                    onChange={(e) => setStepForm({ ...stepForm, step_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                  <input
                    type="text"
                    value={stepForm.icon}
                    onChange={(e) => setStepForm({ ...stepForm, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="fas fa-check"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Step Title *</label>
                <input
                  type="text"
                  value={stepForm.step_title}
                  onChange={(e) => setStepForm({ ...stepForm, step_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  placeholder="Submit Application"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Step Description *</label>
                <ReactQuill
                  theme="snow"
                  value={stepForm.step_description}
                  onChange={(value) => setStepForm({ ...stepForm, step_description: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  placeholder="Send your resume and cover letter via email or online form"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                <input
                  type="number"
                  value={stepForm.display_order}
                  onChange={(e) => setStepForm({ ...stepForm, display_order: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveStep}
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                  {editingStep ? 'Update Step' : 'Add Step'}
                </button>
                {editingStep && (
                  <button
                    onClick={resetStepForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">Application Steps ({appSteps.length})</h2>
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              </div>
            ) : appSteps.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No application steps found.</p>
            ) : (
              <div className="grid md:grid-cols-4 gap-4">
                {appSteps.map((step) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="flex justify-end gap-2 mb-2">
                      <button
                        onClick={() => handleEditStep(step)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div className="w-10 h-10 bg-crimson text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                      {step.step_number}
                    </div>
                    <h3 className="font-semibold text-slate text-sm mb-2">{step.step_title}</h3>
                    <div className="text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: step.step_description }}></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 4: General Application */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-slate mb-4">General Application Section</h2>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title *</label>
                <input
                  type="text"
                  value={generalApp.section_title}
                  onChange={(e) => setGeneralApp({ ...generalApp, section_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  placeholder="Don't See a Suitable Position?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Section Description *</label>
                <ReactQuill
                  theme="snow"
                  value={generalApp.section_description}
                  onChange={(value) => setGeneralApp({ ...generalApp, section_description: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  placeholder="We're always looking for talented individuals..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={generalApp.contact_email}
                    onChange={(e) => setGeneralApp({ ...generalApp, contact_email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="careers@forte.ac.in"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={generalApp.contact_phone}
                    onChange={(e) => setGeneralApp({ ...generalApp, contact_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="+91 98765-43220"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Information</label>
                <ReactQuill
                  theme="snow"
                  value={generalApp.additional_info}
                  onChange={(value) => setGeneralApp({ ...generalApp, additional_info: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  placeholder="Optional additional text..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
                  <input
                    type="text"
                    value={generalApp.button_text}
                    onChange={(e) => setGeneralApp({ ...generalApp, button_text: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Send Your Resume"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Button Link</label>
                  <input
                    type="url"
                    value={generalApp.button_link}
                    onChange={(e) => setGeneralApp({ ...generalApp, button_link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="mailto:careers@forte.ac.in"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveGeneralApp}
                disabled={loading}
                className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
              >
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                Save General Application
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: HR Contacts */}
      {activeTab === 'contacts' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {editingContact ? 'Edit HR Contact' : 'Add HR Contact'}
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
                    <option value="address">Address</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="other">Other</option>
                  </select>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Title *</label>
                <input
                  type="text"
                  value={contactForm.contact_title}
                  onChange={(e) => setContactForm({ ...contactForm, contact_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  placeholder="Address / Email / Phone"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Details *</label>
                <textarea
                  rows="4"
                  value={contactForm.contact_details}
                  onChange={(e) => setContactForm({ ...contactForm, contact_details: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  placeholder="Use line breaks for multiple items..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveContact}
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                  {editingContact ? 'Update Contact' : 'Add Contact'}
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
            <h2 className="text-lg font-bold text-slate mb-4">HR Contacts ({hrContacts.length})</h2>
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              </div>
            ) : hrContacts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No HR contacts found.</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {hrContacts.map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-slate">{contact.contact_title}</h3>
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
                    <p className="text-sm text-gray-600 whitespace-pre-line">{contact.contact_details}</p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                      contact.contact_type === 'address' ? 'bg-blue-100 text-blue-700' :
                      contact.contact_type === 'email' ? 'bg-green-100 text-green-700' :
                      contact.contact_type === 'phone' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {contact.contact_type}
                    </span>
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

export default ManageCareersPage;
