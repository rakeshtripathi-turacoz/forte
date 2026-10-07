import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import API_CONFIG from '../../config/api.config';
import './ManageHomePage.css';

const ManageAdministrationPage = () => {
  const [activeTab, setActiveTab] = useState('header');
  const [loading, setLoading] = useState(true);

  // Header State
  const [header, setHeader] = useState(null);
  const [headerForm, setHeaderForm] = useState({ title: '', subtitle: '', description: '' });

  // Director State
  const [director, setDirector] = useState(null);
  const [directorForm, setDirectorForm] = useState({
    name: '', designation: '', photo_url: '', office_description: '', message_link: ''
  });

  // Team State
  const [team, setTeam] = useState([]);
  const [teamForm, setTeamForm] = useState({
    name: '', designation: '', department: '', photo_url: '', responsibilities: '', display_order: 0
  });
  const [editingTeam, setEditingTeam] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Offices State
  const [offices, setOffices] = useState([]);
  const [officeForm, setOfficeForm] = useState({
    office_name: '', location: '', floor: '', building: '', display_order: 0
  });
  const [editingOffice, setEditingOffice] = useState(null);
  const [showOfficeModal, setShowOfficeModal] = useState(false);

  // Contacts State
  const [contacts, setContacts] = useState([]);
  const [contactForm, setContactForm] = useState({
    contact_type: '', contact_person: '', email: '', phone: '', display_order: 0
  });
  const [editingContact, setEditingContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Departments State
  const [departments, setDepartments] = useState([]);
  const [departmentForm, setDepartmentForm] = useState({
    department_name: '', department_code: '', head_of_department: '', faculty_strength: '', programs: '', description: '', display_order: 0
  });
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

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

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const data = await api.administrationContent.getComplete();

      // Set Header
      if (data.header) {
        setHeader(data.header);
        setHeaderForm({
          title: data.header.title || '',
          subtitle: data.header.subtitle || '',
          description: data.header.description || ''
        });
      }

      // Set Director
      if (data.director) {
        setDirector(data.director);
        setDirectorForm({
          name: data.director.name || '',
          designation: data.director.designation || '',
          photo_url: data.director.photo_url || '',
          office_description: data.director.office_description || '',
          message_link: data.director.message_link || ''
        });
      }

      setTeam(data.team || []);
      setDepartments(data.departments || []);
      setOffices(data.offices || []);
      setContacts(data.contacts || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load administration data');
    } finally {
      setLoading(false);
    }
  };

  // Image upload handler
  const handleImageUpload = async (file, fieldSetter, fieldName) => {
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/upload/banner-image`, {
        method: 'POST',
        body: uploadData
      });
      const result = await response.json();

      if (result.success) {
        fieldSetter(prev => ({ ...prev, [fieldName]: result.imageUrl }));
        alert('Image uploaded successfully!');
      } else {
        alert('Failed to upload image: ' + result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image. Please try again.');
    }
  };

  // ===== HEADER FUNCTIONS =====
  const handleHeaderSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.administrationContent.updateHeader(header.id, headerForm);
      alert('Header updated successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error updating header:', error);
      alert('Failed to update header');
    }
  };

  // ===== DIRECTOR FUNCTIONS =====
  const handleDirectorSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.administrationContent.updateDirector(director.id, directorForm);
      alert('Director info updated successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error updating director:', error);
      alert('Failed to update director info');
    }
  };

  // ===== TEAM FUNCTIONS =====
  const openTeamModal = (member = null) => {
    if (member) {
      setEditingTeam(member);
      setTeamForm({
        name: member.name,
        designation: member.designation,
        department: member.department || '',
        photo_url: member.photo_url || '',
        responsibilities: member.responsibilities || '',
        display_order: member.display_order
      });
    } else {
      setEditingTeam(null);
      setTeamForm({
        name: '', designation: '', department: '', photo_url: '', responsibilities: '', display_order: team.length + 1
      });
    }
    setShowTeamModal(true);
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure display_order is a valid number
      const dataToSend = {
        ...teamForm,
        display_order: parseInt(teamForm.display_order) || 0
      };

      if (editingTeam) {
        await api.administrationContent.updateTeamMember(editingTeam.id, dataToSend);
        alert('Team member updated successfully!');
      } else {
        await api.administrationContent.createTeamMember(dataToSend);
        alert('Team member added successfully!');
      }
      setShowTeamModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Failed to save team member: ' + (error.message || 'Unknown error'));
    }
  };

  const handleTeamDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    try {
      await api.administrationContent.deleteTeamMember(id);
      alert('Team member deleted successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Failed to delete team member');
    }
  };

  // ===== OFFICE FUNCTIONS =====
  const openOfficeModal = (office = null) => {
    if (office) {
      setEditingOffice(office);
      setOfficeForm({
        office_name: office.office_name,
        location: office.location || '',
        floor: office.floor || '',
        building: office.building || '',
        display_order: office.display_order
      });
    } else {
      setEditingOffice(null);
      setOfficeForm({
        office_name: '', location: '', floor: '', building: '', display_order: offices.length + 1
      });
    }
    setShowOfficeModal(true);
  };

  const handleOfficeSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure display_order is a valid number
      const dataToSend = {
        ...officeForm,
        display_order: parseInt(officeForm.display_order) || 0
      };

      if (editingOffice) {
        await api.administrationContent.updateOffice(editingOffice.id, dataToSend);
        alert('Office updated successfully!');
      } else {
        await api.administrationContent.createOffice(dataToSend);
        alert('Office added successfully!');
      }
      setShowOfficeModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error saving office:', error);
      alert('Failed to save office: ' + (error.message || 'Unknown error'));
    }
  };

  const handleOfficeDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this office?')) return;
    try {
      await api.administrationContent.deleteOffice(id);
      alert('Office deleted successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting office:', error);
      alert('Failed to delete office');
    }
  };

  // ===== CONTACT FUNCTIONS =====
  const openContactModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        contact_type: contact.contact_type,
        contact_person: contact.contact_person || '',
        email: contact.email,
        phone: contact.phone || '',
        display_order: contact.display_order
      });
    } else {
      setEditingContact(null);
      setContactForm({
        contact_type: '', contact_person: '', email: '', phone: '', display_order: contacts.length + 1
      });
    }
    setShowContactModal(true);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure display_order is a valid number
      const dataToSend = {
        ...contactForm,
        display_order: parseInt(contactForm.display_order) || 0
      };

      if (editingContact) {
        await api.administrationContent.updateContact(editingContact.id, dataToSend);
        alert('Contact updated successfully!');
      } else {
        await api.administrationContent.createContact(dataToSend);
        alert('Contact added successfully!');
      }
      setShowContactModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Failed to save contact: ' + (error.message || 'Unknown error'));
    }
  };

  const handleContactDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.administrationContent.deleteContact(id);
      alert('Contact deleted successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  // ===== DEPARTMENT FUNCTIONS =====
  const openDepartmentModal = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setDepartmentForm({
        department_name: department.department_name,
        department_code: department.department_code || '',
        head_of_department: department.head_of_department || '',
        faculty_strength: department.faculty_strength || '',
        programs: department.programs || '',
        description: department.description || '',
        display_order: department.display_order || 0
      });
    } else {
      setEditingDepartment(null);
      setDepartmentForm({
        department_name: '', department_code: '', head_of_department: '', faculty_strength: '', programs: '', description: '', display_order: departments.length + 1
      });
    }
    setShowDepartmentModal(true);
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...departmentForm,
        display_order: parseInt(departmentForm.display_order) || 0
      };

      if (editingDepartment) {
        await api.administrationContent.updateDepartment(editingDepartment.id, dataToSend);
        alert('Department updated successfully!');
      } else {
        await api.administrationContent.createDepartment(dataToSend);
        alert('Department added successfully!');
      }
      setShowDepartmentModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Failed to save department: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDepartmentDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.administrationContent.deleteDepartment(id);
      alert('Department deleted successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Failed to delete department');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-crimson mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Administration page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Administration Page</h1>
        <p className="text-gray-600">Manage administrative team, offices, and contact information</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('header')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'header'
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Page Header
            </button>
            <button
              onClick={() => setActiveTab('director')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'director'
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Director Info
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'team'
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Administrative Team ({team.length})
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'departments'
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Departments ({departments.length})
            </button>
            <button
              onClick={() => setActiveTab('offices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'offices'
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Offices ({offices.length})
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contacts'
                  ? 'border-crimson text-crimson'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contacts ({contacts.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* HEADER TAB */}
        {activeTab === 'header' && (
          <form onSubmit={handleHeaderSubmit}>
            <h2 className="text-xl font-bold mb-4">Page Header</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={headerForm.title}
                  onChange={(e) => setHeaderForm({ ...headerForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crimson focus:border-crimson"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={headerForm.subtitle}
                  onChange={(e) => setHeaderForm({ ...headerForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crimson focus:border-crimson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <ReactQuill
                  theme="snow"
                  value={headerForm.description}
                  onChange={(value) => setHeaderForm({ ...headerForm, description: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  style={{ minHeight: '200px' }}
                />
              </div>
              <button
                type="submit"
                className="bg-crimson text-white px-6 py-2 rounded-md hover:bg-red-800 transition-colors mt-4"
              >
                Update Header
              </button>
            </div>
          </form>
        )}

        {/* DIRECTOR TAB */}
        {activeTab === 'director' && (
          <form onSubmit={handleDirectorSubmit}>
            <h2 className="text-xl font-bold mb-4">Director Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={directorForm.name}
                    onChange={(e) => setDirectorForm({ ...directorForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crimson focus:border-crimson"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={directorForm.designation}
                    onChange={(e) => setDirectorForm({ ...directorForm, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crimson focus:border-crimson"
                    required
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Director Photo</label>

                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-2">Upload Image:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], setDirectorForm, 'photo_url')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Or Enter Image URL:</label>
                  <input
                    type="text"
                    value={directorForm.photo_url}
                    onChange={(e) => setDirectorForm({ ...directorForm, photo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crimson focus:border-crimson"
                    placeholder="/uploads/director.jpg"
                  />
                </div>

                {directorForm.photo_url && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                    <img
                      src={directorForm.photo_url}
                      alt="Director"
                      className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office Description</label>
                <ReactQuill
                  theme="snow"
                  value={directorForm.office_description}
                  onChange={(value) => setDirectorForm({ ...directorForm, office_description: value })}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  style={{ minHeight: '200px' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Link</label>
                <input
                  type="text"
                  value={directorForm.message_link}
                  onChange={(e) => setDirectorForm({ ...directorForm, message_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-crimson focus:border-crimson"
                  placeholder="/about/director-message"
                />
              </div>
              <button
                type="submit"
                className="bg-crimson text-white px-6 py-2 rounded-md hover:bg-red-800 transition-colors mt-4"
              >
                Update Director Info
              </button>
            </div>
          </form>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Administrative Team</h2>
              <button
                onClick={() => openTeamModal()}
                className="bg-crimson text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors"
              >
                + Add Team Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {team.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.display_order}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.designation}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openTeamModal(member)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleTeamDelete(member.id)}
                          className="text-red-600 hover:text-red-900"
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

        {/* DEPARTMENTS TAB */}
        {activeTab === 'departments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Academic Departments</h2>
              <button
                onClick={() => openDepartmentModal()}
                className="bg-crimson text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors"
              >
                + Add Department
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty Strength</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Head</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map((dept) => (
                    <tr key={dept.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.display_order || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept.department_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.department_code || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{dept.programs || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.faculty_strength ? `${dept.faculty_strength}+` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.head_of_department || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openDepartmentModal(dept)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDepartmentDelete(dept.id)}
                          className="text-red-600 hover:text-red-900"
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

        {/* OFFICES TAB */}
        {activeTab === 'offices' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Administrative Offices</h2>
              <button
                onClick={() => openOfficeModal()}
                className="bg-crimson text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors"
              >
                + Add Office
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offices.map((office) => (
                <div key={office.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{office.office_name}</h3>
                      <p className="text-sm text-gray-600">{office.floor}, {office.building}</p>
                      <p className="text-sm text-gray-500">{office.location}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openOfficeModal(office)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOfficeDelete(office.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTACTS TAB */}
        {activeTab === 'contacts' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Administration Contacts</h2>
              <button
                onClick={() => openContactModal()}
                className="bg-crimson text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors"
              >
                + Add Contact
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{contact.contact_type}</h3>
                      <p className="text-sm text-gray-600">{contact.contact_person}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openContactModal(contact)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleContactDelete(contact.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TEAM MODAL */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingTeam ? 'Edit' : 'Add'} Team Member</h3>
            <form onSubmit={handleTeamSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                    <input
                      type="text"
                      value={teamForm.designation}
                      onChange={(e) => setTeamForm({ ...teamForm, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={teamForm.department}
                    onChange={(e) => setTeamForm({ ...teamForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>

                  <div className="mb-3">
                    <label className="block text-sm text-gray-600 mb-2">Upload Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], setTeamForm, 'photo_url')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Or Enter Image URL:</label>
                    <input
                      type="text"
                      value={teamForm.photo_url}
                      onChange={(e) => setTeamForm({ ...teamForm, photo_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="/uploads/team/photo.jpg"
                    />
                  </div>

                  {teamForm.photo_url && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                      <img
                        src={teamForm.photo_url}
                        alt="Team member"
                        className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                  <ReactQuill
                    theme="snow"
                    value={teamForm.responsibilities}
                    onChange={(value) => setTeamForm({ ...teamForm, responsibilities: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-white"
                    style={{ minHeight: '150px' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Describe the team member's responsibilities</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={teamForm.display_order}
                    onChange={(e) => setTeamForm({ ...teamForm, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crimson text-white rounded-md hover:bg-red-800"
                >
                  {editingTeam ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICE MODAL */}
      {showOfficeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{editingOffice ? 'Edit' : 'Add'} Office</h3>
            <form onSubmit={handleOfficeSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Office Name *</label>
                  <input
                    type="text"
                    value={officeForm.office_name}
                    onChange={(e) => setOfficeForm({ ...officeForm, office_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                    <input
                      type="text"
                      value={officeForm.floor}
                      onChange={(e) => setOfficeForm({ ...officeForm, floor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Ground Floor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                    <input
                      type="text"
                      value={officeForm.building}
                      onChange={(e) => setOfficeForm({ ...officeForm, building: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Admin Block"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={officeForm.location}
                    onChange={(e) => setOfficeForm({ ...officeForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ground Floor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={officeForm.display_order}
                    onChange={(e) => setOfficeForm({ ...officeForm, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowOfficeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crimson text-white rounded-md hover:bg-red-800"
                >
                  {editingOffice ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTACT MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{editingContact ? 'Edit' : 'Add'} Contact</h3>
            <form onSubmit={handleContactSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Type *</label>
                  <input
                    type="text"
                    value={contactForm.contact_type}
                    onChange={(e) => setContactForm({ ...contactForm, contact_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Director's Office"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactForm.contact_person}
                    onChange={(e) => setContactForm({ ...contactForm, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Director"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="director@forte.ac.in"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="+91 98765-43200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={contactForm.display_order}
                    onChange={(e) => setContactForm({ ...contactForm, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crimson text-white rounded-md hover:bg-red-800"
                >
                  {editingContact ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPARTMENT MODAL */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingDepartment ? 'Edit' : 'Add'} Department</h3>
            <form onSubmit={handleDepartmentSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                    <input
                      type="text"
                      value={departmentForm.department_name}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, department_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Computer Science & Engineering"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
                    <input
                      type="text"
                      value={departmentForm.department_code}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, department_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="CSE"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Head of Department</label>
                    <input
                      type="text"
                      value={departmentForm.head_of_department}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, head_of_department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Dr. Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Strength</label>
                    <input
                      type="number"
                      value={departmentForm.faculty_strength}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, faculty_strength: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="30"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">e.g., 30 for 30+ faculty</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Programs Offered</label>
                  <input
                    type="text"
                    value={departmentForm.programs}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, programs: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="B.Tech, M.Tech, PhD"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated list of programs</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <ReactQuill
                    theme="snow"
                    value={departmentForm.description}
                    onChange={(value) => setDepartmentForm({ ...departmentForm, description: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-white"
                    style={{ minHeight: '150px' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Brief description of the department</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={departmentForm.display_order}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDepartmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crimson text-white rounded-md hover:bg-red-800"
                >
                  {editingDepartment ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdministrationPage;
