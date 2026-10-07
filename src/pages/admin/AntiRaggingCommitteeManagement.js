import React, { useState, useEffect } from 'react';
import { antiRaggingCommitteeAPI, academicsAPI } from '../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AntiRaggingCommitteeManagement.css';

const AntiRaggingCommitteeManagement = () => {
  const [activeTab, setActiveTab] = useState('header');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  // State for different sections
  const [header, setHeader] = useState({
    title: '',
    subtitle: '',
    description: ''
  });

  const [antiRaggingPolicy, setAntiRaggingPolicy] = useState({
    policy_content: '',
    acts_list: []
  });

  const [antiRaggingMembers, setAntiRaggingMembers] = useState([]);
  const [grievanceMembers, setGrievanceMembers] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [grievanceSubmissions, setGrievanceSubmissions] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'header':
          const headerRes = await antiRaggingCommitteeAPI.getHeader();
          if (headerRes.success && headerRes.data) {
            setHeader(headerRes.data);
          }
          break;

        case 'policy':
          const policyRes = await academicsAPI.getAntiRaggingPolicy();
          if (policyRes.success && policyRes.data) {
            const data = policyRes.data;
            // Parse acts_list if it's a JSON string
            let actsList = [];
            if (data.acts_list) {
              try {
                actsList = typeof data.acts_list === 'string'
                  ? JSON.parse(data.acts_list)
                  : data.acts_list;
              } catch (e) {
                actsList = [];
              }
            }
            setAntiRaggingPolicy({
              policy_content: data.policy_content || '',
              acts_list: actsList
            });
          }
          break;

        case 'anti-ragging':
          const arcRes = await antiRaggingCommitteeAPI.getAntiRaggingCommittee();
          if (arcRes.success) {
            setAntiRaggingMembers(arcRes.data);
          }
          break;

        case 'grievance':
          const gcRes = await antiRaggingCommitteeAPI.getGrievanceCommittee();
          if (gcRes.success) {
            setGrievanceMembers(gcRes.data);
          }
          break;

        case 'emergency':
          const ecRes = await antiRaggingCommitteeAPI.getEmergencyContacts();
          if (ecRes.success) {
            setEmergencyContacts(ecRes.data);
          }
          break;

        case 'documents':
          const docsRes = await antiRaggingCommitteeAPI.getDocuments();
          if (docsRes.success) {
            setDocuments(docsRes.data);
          }
          break;

        case 'submissions':
          const subsRes = await antiRaggingCommitteeAPI.getGrievanceSubmissions();
          if (subsRes.success) {
            setGrievanceSubmissions(subsRes.data);
          }
          const statsRes = await antiRaggingCommitteeAPI.getStatistics();
          if (statsRes.success) {
            setStatistics(statsRes.data);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      showMessage('error', 'Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Header Management
  const handleHeaderUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await antiRaggingCommitteeAPI.updateHeader(header);
      if (res.success) {
        showMessage('success', 'Header updated successfully');
      }
    } catch (error) {
      showMessage('error', 'Failed to update header');
    } finally {
      setLoading(false);
    }
  };

  // Policy Management
  const handlePolicyUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await academicsAPI.updateAntiRaggingPolicy({
        policy_content: antiRaggingPolicy.policy_content,
        acts_list: JSON.stringify(antiRaggingPolicy.acts_list)
      });
      if (res.success) {
        showMessage('success', 'Anti-Ragging Policy updated successfully');
      }
    } catch (error) {
      showMessage('error', 'Failed to update policy');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAct = () => {
    setAntiRaggingPolicy({
      ...antiRaggingPolicy,
      acts_list: [...antiRaggingPolicy.acts_list, '']
    });
  };

  const handleRemoveAct = (index) => {
    const newActs = antiRaggingPolicy.acts_list.filter((_, i) => i !== index);
    setAntiRaggingPolicy({
      ...antiRaggingPolicy,
      acts_list: newActs
    });
  };

  const handleActChange = (index, value) => {
    const newActs = [...antiRaggingPolicy.acts_list];
    newActs[index] = value;
    setAntiRaggingPolicy({
      ...antiRaggingPolicy,
      acts_list: newActs
    });
  };

  // Generic CRUD handlers
  const handleAdd = (type) => {
    setModalType(type);
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (type, item) => {
    setModalType(type);
    setEditingItem(item);

    // Format dates to yyyy-MM-dd for date input fields
    const formattedItem = { ...item };
    if (formattedItem.uploaded_date) {
      // Convert ISO date to yyyy-MM-dd format
      const date = new Date(formattedItem.uploaded_date);
      formattedItem.uploaded_date = date.toISOString().split('T')[0];
    }

    setFormData(formattedItem);
    setShowModal(true);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      let res;
      switch (type) {
        case 'anti-ragging':
          res = await antiRaggingCommitteeAPI.deleteAntiRaggingMember(id);
          break;
        case 'grievance':
          res = await antiRaggingCommitteeAPI.deleteGrievanceMember(id);
          break;
        case 'emergency':
          res = await antiRaggingCommitteeAPI.deleteEmergencyContact(id);
          break;
        case 'document':
          res = await antiRaggingCommitteeAPI.deleteDocument(id);
          break;
        default:
          break;
      }

      if (res.success) {
        showMessage('success', 'Item deleted successfully');
        loadData();
      }
    } catch (error) {
      showMessage('error', 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      const isEditing = editingItem !== null;

      switch (modalType) {
        case 'anti-ragging':
          res = isEditing
            ? await antiRaggingCommitteeAPI.updateAntiRaggingMember(editingItem.id, formData)
            : await antiRaggingCommitteeAPI.createAntiRaggingMember(formData);
          break;
        case 'grievance':
          res = isEditing
            ? await antiRaggingCommitteeAPI.updateGrievanceMember(editingItem.id, formData)
            : await antiRaggingCommitteeAPI.createGrievanceMember(formData);
          break;
        case 'emergency':
          res = isEditing
            ? await antiRaggingCommitteeAPI.updateEmergencyContact(editingItem.id, formData)
            : await antiRaggingCommitteeAPI.createEmergencyContact(formData);
          break;
        case 'document':
          res = isEditing
            ? await antiRaggingCommitteeAPI.updateDocument(editingItem.id, formData)
            : await antiRaggingCommitteeAPI.createDocument(formData);
          break;
        default:
          break;
      }

      if (res.success) {
        showMessage('success', `Item ${isEditing ? 'updated' : 'added'} successfully`);
        setShowModal(false);
        loadData();
      }
    } catch (error) {
      showMessage('error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleGrievanceStatusUpdate = async (id, status) => {
    setLoading(true);
    try {
      const res = await antiRaggingCommitteeAPI.updateGrievanceSubmission(id, { status });
      if (res.success) {
        showMessage('success', 'Status updated successfully');
        loadData();
      }
    } catch (error) {
      showMessage('error', 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="anti-ragging-page-header">
        <h1>
          Anti-Ragging & Grievance Committee Management
        </h1>
        <p>Manage committee members, emergency contacts, documents, and grievance submissions</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4 overflow-x-auto">
          {[
            { id: 'header', label: 'Page Header' },
            { id: 'policy', label: 'Anti-Ragging Policy' },
            { id: 'anti-ragging', label: 'Anti-Ragging Committee' },
            { id: 'grievance', label: 'Grievance Committee' },
            { id: 'emergency', label: 'Emergency Contacts' },
            { id: 'documents', label: 'Documents' },
            { id: 'submissions', label: 'Grievance Submissions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-crimson border-b-2 border-crimson'
                  : 'text-gray-600 hover:text-slate'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {loading && <div className="text-center py-4">Loading...</div>}

        {/* Header Tab */}
        {activeTab === 'header' && !loading && (
          <form onSubmit={handleHeaderUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={header.title}
                onChange={(e) => setHeader({ ...header, title: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={header.subtitle}
                onChange={(e) => setHeader({ ...header, subtitle: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <ReactQuill
                theme="snow"
                value={header.description}
                onChange={(value) => setHeader({ ...header, description: value })}
                modules={quillModules}
                formats={quillFormats}
                className="bg-white"
                style={{ height: '200px', marginBottom: '50px' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-crimson text-white px-6 py-2 rounded hover:bg-opacity-90"
            >
              Update Header
            </button>
          </form>
        )}

        {/* Anti-Ragging Policy Tab */}
        {activeTab === 'policy' && !loading && (
          <form onSubmit={handlePolicyUpdate} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Anti-Ragging Policy Content</h2>
              <label className="block text-sm font-medium mb-1">Policy Content</label>
              <ReactQuill
                theme="snow"
                value={antiRaggingPolicy.policy_content}
                onChange={(value) => setAntiRaggingPolicy({ ...antiRaggingPolicy, policy_content: value })}
                modules={quillModules}
                formats={quillFormats}
                className="bg-white"
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">What Constitutes Ragging? (Acts List)</h2>
                <button
                  type="button"
                  onClick={handleAddAct}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  + Add Act
                </button>
              </div>
              <div className="space-y-3">
                {antiRaggingPolicy.acts_list.map((act, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={act}
                      onChange={(e) => handleActChange(index, e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder={`Act ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAct(index)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {antiRaggingPolicy.acts_list.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No acts added yet. Click "Add Act" to add items.</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-crimson text-white px-6 py-2 rounded hover:bg-opacity-90"
            >
              Update Policy
            </button>
          </form>
        )}

        {/* Anti-Ragging Committee Tab */}
        {activeTab === 'anti-ragging' && !loading && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Anti-Ragging Committee Members</h2>
              <button
                onClick={() => handleAdd('anti-ragging')}
                className="bg-crimson text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                + Add Member
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Designation</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Department</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {antiRaggingMembers.map(member => (
                    <tr key={member.id} className="border-b">
                      <td className="px-4 py-2">{member.member_name}</td>
                      <td className="px-4 py-2">{member.designation}</td>
                      <td className="px-4 py-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-2">{member.department}</td>
                      <td className="px-4 py-2">{member.phone}</td>
                      <td className="px-4 py-2">{member.email}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEdit('anti-ragging', member)}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete('anti-ragging', member.id)}
                          className="text-red-600 hover:underline"
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

        {/* Grievance Committee Tab */}
        {activeTab === 'grievance' && !loading && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Grievance Committee Members</h2>
              <button
                onClick={() => handleAdd('grievance')}
                className="bg-crimson text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                + Add Member
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Designation</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Department</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grievanceMembers.map(member => (
                    <tr key={member.id} className="border-b">
                      <td className="px-4 py-2">{member.member_name}</td>
                      <td className="px-4 py-2">{member.designation}</td>
                      <td className="px-4 py-2">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-2">{member.department}</td>
                      <td className="px-4 py-2">{member.phone}</td>
                      <td className="px-4 py-2">{member.email}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEdit('grievance', member)}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete('grievance', member.id)}
                          className="text-red-600 hover:underline"
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

        {/* Emergency Contacts Tab */}
        {activeTab === 'emergency' && !loading && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Emergency Contacts</h2>
              <button
                onClick={() => handleAdd('emergency')}
                className="bg-crimson text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                + Add Contact
              </button>
            </div>
            <div className="grid gap-4">
              {emergencyContacts.map(contact => (
                <div key={contact.id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{contact.contact_type}</h3>
                      {contact.contact_name && <p className="text-gray-600">{contact.contact_name}</p>}
                      <p className="text-xl font-bold text-crimson mt-2">{contact.phone}</p>
                      {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                      <p className="text-sm text-gray-500 mt-1">{contact.available_hours}</p>
                      {contact.description && <p className="text-sm mt-2">{contact.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit('emergency', contact)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete('emergency', contact.id)}
                        className="text-red-600 hover:underline"
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

        {/* Documents Tab */}
        {activeTab === 'documents' && !loading && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Committee Documents</h2>
              <button
                onClick={() => handleAdd('document')}
                className="bg-crimson text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                + Add Document
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Size</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id} className="border-b">
                      <td className="px-4 py-2">{doc.document_title}</td>
                      <td className="px-4 py-2">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
                          {doc.document_type}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                          {doc.document_category}
                        </span>
                      </td>
                      <td className="px-4 py-2">{doc.file_size}</td>
                      <td className="px-4 py-2">{doc.uploaded_date}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEdit('document', doc)}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete('document', doc.id)}
                          className="text-red-600 hover:underline"
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

        {/* Grievance Submissions Tab */}
        {activeTab === 'submissions' && !loading && (
          <div>
            <h2 className="text-xl font-bold mb-4">Grievance Submissions</h2>

            {/* Statistics */}
            {statistics && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Grievances</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.total_grievances}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pending_count}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded">
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.in_progress_count}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.resolved_count}</p>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Priority</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grievanceSubmissions.map(sub => (
                    <tr key={sub.id} className="border-b">
                      <td className="px-4 py-2">
                        <div>
                          <p className="font-medium">{sub.student_name}</p>
                          <p className="text-sm text-gray-600">{sub.course} - {sub.year}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                          {sub.grievance_type}
                        </span>
                      </td>
                      <td className="px-4 py-2">{sub.subject}</td>
                      <td className="px-4 py-2">
                        <select
                          value={sub.status}
                          onChange={(e) => handleGrievanceStatusUpdate(sub.id, e.target.value)}
                          className={`px-2 py-1 rounded text-sm ${
                            sub.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                            sub.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          sub.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                          sub.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {sub.priority}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(sub.submitted_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => alert(`Details:\n\n${sub.description}`)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit' : 'Add'} {modalType === 'anti-ragging' ? 'Anti-Ragging Committee Member' :
               modalType === 'grievance' ? 'Grievance Committee Member' :
               modalType === 'emergency' ? 'Emergency Contact' : 'Document'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {(modalType === 'anti-ragging' || modalType === 'grievance') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Member Name *</label>
                    <input
                      type="text"
                      value={formData.member_name || ''}
                      onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Designation *</label>
                    <input
                      type="text"
                      value={formData.designation || ''}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role *</label>
                    <input
                      type="text"
                      value={formData.role || ''}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., Chairman, Member, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Photo URL</label>
                    <input
                      type="text"
                      value={formData.photo_url || ''}
                      onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order || 0}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}

              {modalType === 'emergency' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Type *</label>
                    <input
                      type="text"
                      value={formData.contact_type || ''}
                      onChange={(e) => setFormData({ ...formData, contact_type: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., Anti-Ragging Helpline"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={formData.contact_name || ''}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Available Hours</label>
                    <input
                      type="text"
                      value={formData.available_hours || '24/7'}
                      onChange={(e) => setFormData({ ...formData, available_hours: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2 border rounded"
                      rows="4"
                      placeholder="Enter description here..."
                    />
                  </div>
                </>
              )}

              {modalType === 'document' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Document Title *</label>
                    <input
                      type="text"
                      value={formData.document_title || ''}
                      onChange={(e) => setFormData({ ...formData, document_title: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Document Type *</label>
                    <select
                      value={formData.document_type || 'Guidelines'}
                      onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="Policy">Policy</option>
                      <option value="Guidelines">Guidelines</option>
                      <option value="Affidavit">Affidavit</option>
                      <option value="Report">Report</option>
                      <option value="Notice">Notice</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      value={formData.document_category || 'Both'}
                      onChange={(e) => setFormData({ ...formData, document_category: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="Anti-Ragging">Anti-Ragging</option>
                      <option value="Grievance">Grievance</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">File URL *</label>
                    <input
                      type="text"
                      value={formData.file_url || ''}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="/documents/filename.pdf"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">File Size</label>
                    <input
                      type="text"
                      value={formData.file_size || ''}
                      onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., 2.5 MB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <ReactQuill
                      theme="snow"
                      value={formData.description || ''}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      modules={quillModules}
                      formats={quillFormats}
                      className="bg-white"
                      style={{ height: '150px', marginBottom: '50px' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Date</label>
                    <input
                      type="date"
                      value={formData.uploaded_date || ''}
                      onChange={(e) => setFormData({ ...formData, uploaded_date: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order || 0}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border rounded"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AntiRaggingCommitteeManagement;
