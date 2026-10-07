import React, { useState, useEffect } from 'react';
import { admissionAPI } from '../../services/api';
import API_CONFIG from '../../config/api.config';

const API_URL = API_CONFIG.API_URL;

const ManageAdmissionsPage = () => {
  const [activeTab, setActiveTab] = useState('enquiries');
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Content management state
  const [processSteps, setProcessSteps] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [paymentGuidelines, setPaymentGuidelines] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentGuidelines, setDocumentGuidelines] = useState([]);

  // Modal states
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [showPaymentOptionModal, setShowPaymentOptionModal] = useState(false);
  const [editingPaymentOption, setEditingPaymentOption] = useState(null);
  const [showPaymentGuidelineModal, setShowPaymentGuidelineModal] = useState(false);
  const [editingPaymentGuideline, setEditingPaymentGuideline] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [showDocumentGuidelineModal, setShowDocumentGuidelineModal] = useState(false);
  const [editingDocumentGuideline, setEditingDocumentGuideline] = useState(null);
  const [editingPaymentInfo, setEditingPaymentInfo] = useState(false);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'enquiries') {
      loadEnquiries();
    } else if (activeTab === 'steps') {
      loadProcessSteps();
    } else if (activeTab === 'payment') {
      loadPaymentData();
    } else if (activeTab === 'documents') {
      loadDocumentData();
    }
  }, [activeTab, filterStatus, currentPage]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // ============ ENQUIRIES MANAGEMENT ============
  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      };

      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = await admissionAPI.getEnquiries(params);

      if (response.success) {
        setEnquiries(response.data);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      setError('Failed to load enquiries');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus, notes = '') => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await admissionAPI.updateStatus(id, newStatus, notes);
      setSuccess('Status updated successfully!');

      loadEnquiries();
      setSelectedEnquiry(null);
    } catch (error) {
      setError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;

    try {
      setLoading(true);
      await admissionAPI.deleteEnquiry(id);
      setSuccess('Enquiry deleted successfully!');
      loadEnquiries();
    } catch (error) {
      setError('Failed to delete enquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
  };

  // ============ ADMISSION PROCESS STEPS ============
  const loadProcessSteps = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admission/process-steps`);
      const data = await response.json();
      if (data.success) {
        setProcessSteps(data.data);
      }
    } catch (error) {
      console.error('Error loading process steps:', error);
      setError('Failed to load process steps');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStep = async (stepData) => {
    try {
      setLoading(true);
      setError('');

      const url = editingStep
        ? `${API_URL}/admission/process-steps/${editingStep.id}`
        : `${API_URL}/admission/process-steps`;

      const method = editingStep ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingStep ? 'Step updated successfully!' : 'Step created successfully!');
        setShowStepModal(false);
        setEditingStep(null);
        loadProcessSteps();
      } else {
        setError(result.message || 'Failed to save step');
      }
    } catch (error) {
      console.error('Error saving step:', error);
      setError('Failed to save step');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStep = async (id) => {
    if (!window.confirm('Are you sure you want to delete this step?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admission/process-steps/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        setSuccess('Step deleted successfully!');
        loadProcessSteps();
      } else {
        setError('Failed to delete step');
      }
    } catch (error) {
      console.error('Error deleting step:', error);
      setError('Failed to delete step');
    } finally {
      setLoading(false);
    }
  };

  // ============ PAYMENT DATA ============
  const loadPaymentData = async () => {
    try {
      setLoading(true);

      // Load payment info
      const infoResponse = await fetch(`${API_URL}/admission/payment-info`);
      const infoData = await infoResponse.json();
      if (infoData.success) {
        setPaymentInfo(infoData.data);
      }

      // Load payment options
      const optionsResponse = await fetch(`${API_URL}/admission/payment-options`);
      const optionsData = await optionsResponse.json();
      if (optionsData.success) {
        setPaymentOptions(optionsData.data);
      }

      // Load payment guidelines
      const guidelinesResponse = await fetch(`${API_URL}/admission/payment-guidelines`);
      const guidelinesData = await guidelinesResponse.json();
      if (guidelinesData.success) {
        setPaymentGuidelines(guidelinesData.data);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentInfo = async (infoData) => {
    if (!paymentInfo || !paymentInfo.id) {
      setError('Payment info ID not found');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/admission/payment-info/${paymentInfo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(infoData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Payment info updated successfully!');
        setEditingPaymentInfo(false);
        loadPaymentData();
      } else {
        setError(result.message || 'Failed to update payment info');
      }
    } catch (error) {
      console.error('Error saving payment info:', error);
      setError('Failed to save payment info');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentOption = async (optionData) => {
    try {
      setLoading(true);
      setError('');

      const url = editingPaymentOption
        ? `${API_URL}/admission/payment-options/${editingPaymentOption.id}`
        : `${API_URL}/admission/payment-options`;

      const method = editingPaymentOption ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optionData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingPaymentOption ? 'Payment option updated!' : 'Payment option created!');
        setShowPaymentOptionModal(false);
        setEditingPaymentOption(null);
        loadPaymentData();
      } else {
        setError(result.message || 'Failed to save payment option');
      }
    } catch (error) {
      console.error('Error saving payment option:', error);
      setError('Failed to save payment option');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentOption = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment option?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admission/payment-options/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        setSuccess('Payment option deleted!');
        loadPaymentData();
      }
    } catch (error) {
      setError('Failed to delete payment option');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentGuideline = async (guidelineData) => {
    try {
      setLoading(true);
      setError('');

      const url = editingPaymentGuideline
        ? `${API_URL}/admission/payment-guidelines/${editingPaymentGuideline.id}`
        : `${API_URL}/admission/payment-guidelines`;

      const method = editingPaymentGuideline ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guidelineData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingPaymentGuideline ? 'Guideline updated!' : 'Guideline created!');
        setShowPaymentGuidelineModal(false);
        setEditingPaymentGuideline(null);
        loadPaymentData();
      } else {
        setError(result.message || 'Failed to save guideline');
      }
    } catch (error) {
      console.error('Error saving guideline:', error);
      setError('Failed to save guideline');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentGuideline = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guideline?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admission/payment-guidelines/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        setSuccess('Guideline deleted!');
        loadPaymentData();
      }
    } catch (error) {
      setError('Failed to delete guideline');
    } finally {
      setLoading(false);
    }
  };

  // ============ DOCUMENT DATA ============
  const loadDocumentData = async () => {
    try {
      setLoading(true);

      // Load documents
      const docsResponse = await fetch(`${API_URL}/admission/documents`);
      const docsData = await docsResponse.json();
      if (docsData.success) {
        setDocuments(docsData.data);
      }

      // Load document guidelines
      const guidelinesResponse = await fetch(`${API_URL}/admission/document-guidelines`);
      const guidelinesData = await guidelinesResponse.json();
      if (guidelinesData.success) {
        setDocumentGuidelines(guidelinesData.data);
      }
    } catch (error) {
      console.error('Error loading document data:', error);
      setError('Failed to load document data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocument = async (documentData) => {
    try {
      setLoading(true);
      setError('');

      const url = editingDocument
        ? `${API_URL}/admission/documents/${editingDocument.id}`
        : `${API_URL}/admission/documents`;

      const method = editingDocument ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingDocument ? 'Document updated!' : 'Document created!');
        setShowDocumentModal(false);
        setEditingDocument(null);
        loadDocumentData();
      } else {
        setError(result.message || 'Failed to save document');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setError('Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admission/documents/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        setSuccess('Document deleted!');
        loadDocumentData();
      }
    } catch (error) {
      setError('Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocumentGuideline = async (guidelineData) => {
    try {
      setLoading(true);
      setError('');

      const url = editingDocumentGuideline
        ? `${API_URL}/admission/document-guidelines/${editingDocumentGuideline.id}`
        : `${API_URL}/admission/document-guidelines`;

      const method = editingDocumentGuideline ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guidelineData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingDocumentGuideline ? 'Guideline updated!' : 'Guideline created!');
        setShowDocumentGuidelineModal(false);
        setEditingDocumentGuideline(null);
        loadDocumentData();
      } else {
        setError(result.message || 'Failed to save guideline');
      }
    } catch (error) {
      console.error('Error saving guideline:', error);
      setError('Failed to save guideline');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocumentGuideline = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guideline?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admission/document-guidelines/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        setSuccess('Guideline deleted!');
        loadDocumentData();
      }
    } catch (error) {
      setError('Failed to delete guideline');
    } finally {
      setLoading(false);
    }
  };

  // ============ HELPER FUNCTIONS ============
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      followup: 'bg-purple-100 text-purple-800',
      enrolled: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'New',
      contacted: 'Contacted',
      followup: 'Follow Up',
      enrolled: 'Enrolled',
      rejected: 'Rejected'
    };
    return labels[status] || status;
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      enquiry.full_name?.toLowerCase().includes(search) ||
      enquiry.email?.toLowerCase().includes(search) ||
      enquiry.mobile_number?.includes(search) ||
      enquiry.program_interested?.toLowerCase().includes(search)
    );
  });

  // ============ RENDER TABS ============
  const renderEnquiriesTab = () => (
    <div>
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-search mr-2"></i>
              Search
            </label>
            <input
              type="text"
              placeholder="Name, email, phone, program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-filter mr-2"></i>
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="followup">Follow Up</option>
              <option value="enrolled">Enrolled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-end">
            <div className="w-full bg-crimson bg-opacity-10 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Total Enquiries</div>
              <div className="text-2xl font-bold text-crimson">{enquiries.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-slate mb-4">
          Admission Enquiries ({filteredEnquiries.length})
        </h2>

        {loading && enquiries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p>Loading enquiries...</p>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-inbox text-4xl mb-2"></i>
            <p>No enquiries found</p>
            {searchTerm && <p className="text-sm mt-2">Try adjusting your search filters</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEnquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate">{enquiry.full_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(enquiry.status)}`}>
                        {getStatusLabel(enquiry.status)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <i className="fas fa-envelope mr-2 text-gray-400"></i>
                        {enquiry.email}
                      </div>
                      <div>
                        <i className="fas fa-phone mr-2 text-gray-400"></i>
                        {enquiry.mobile_number}
                      </div>
                      <div>
                        <i className="fas fa-graduation-cap mr-2 text-gray-400"></i>
                        Program: <span className="font-semibold">{enquiry.program_interested?.toUpperCase()}</span>
                      </div>
                      <div>
                        <i className="fas fa-calendar mr-2 text-gray-400"></i>
                        DOB: {new Date(enquiry.date_of_birth).toLocaleDateString()}
                      </div>
                    </div>

                    {enquiry.notes && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <i className="fas fa-sticky-note mr-2 text-yellow-600"></i>
                        <strong>Notes:</strong> {enquiry.notes}
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-400">
                      <i className="fas fa-clock mr-1"></i>
                      Submitted: {new Date(enquiry.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(enquiry)}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition text-sm"
                      title="View Details"
                    >
                      <i className="fas fa-eye mr-1"></i>
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteEnquiry(enquiry.id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition text-sm"
                      title="Delete"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-chevron-left"></i> Previous
            </button>

            <span className="px-4 py-2 bg-gray-100 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate mb-2">Enquiry Details</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedEnquiry.status)}`}>
                    {getStatusLabel(selectedEnquiry.status)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate mb-3 border-b pb-2">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Full Name</label>
                    <p className="text-gray-900">{selectedEnquiry.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Father's Name</label>
                    <p className="text-gray-900">{selectedEnquiry.father_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Date of Birth</label>
                    <p className="text-gray-900">{new Date(selectedEnquiry.date_of_birth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Category</label>
                    <p className="text-gray-900">{selectedEnquiry.category?.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate mb-3 border-b pb-2">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Mobile Number</label>
                    <p className="text-gray-900">{selectedEnquiry.mobile_number}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600">Address</label>
                    <p className="text-gray-900">{selectedEnquiry.address}</p>
                  </div>
                </div>
              </div>

              {/* Program Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate mb-3 border-b pb-2">Program Information</h3>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Program Interested</label>
                  <p className="text-gray-900 text-lg font-semibold">{selectedEnquiry.program_interested?.toUpperCase()}</p>
                </div>
              </div>

              {/* Update Status */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate mb-3 border-b pb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['new', 'contacted', 'followup', 'enrolled', 'rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedEnquiry.id, status)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        selectedEnquiry.status === status
                          ? 'bg-crimson text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      disabled={loading}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate mb-3 border-b pb-2">Notes</h3>
                <textarea
                  defaultValue={selectedEnquiry.notes || ''}
                  onBlur={(e) => {
                    if (e.target.value !== selectedEnquiry.notes) {
                      handleUpdateStatus(selectedEnquiry.id, selectedEnquiry.status, e.target.value);
                    }
                  }}
                  placeholder="Add notes about this enquiry..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  rows="4"
                />
              </div>

              {/* Metadata */}
              <div className="text-xs text-gray-500 border-t pt-3">
                <div>Enquiry ID: #{selectedEnquiry.id}</div>
                <div>Submitted: {new Date(selectedEnquiry.created_at).toLocaleString()}</div>
                {selectedEnquiry.updated_at && (
                  <div>Last Updated: {new Date(selectedEnquiry.updated_at).toLocaleString()}</div>
                )}
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAdmissionProcessTab = () => (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate">Admission Process Steps</h2>
            <p className="text-gray-600 text-sm mt-1">Manage step-by-step admission process</p>
          </div>
          <button
            onClick={() => {
              setEditingStep(null);
              setShowStepModal(true);
            }}
            className="bg-crimson text-white px-4 py-2 rounded-lg hover:bg-crimson-dark transition flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Step
          </button>
        </div>

        {loading && processSteps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p>Loading steps...</p>
          </div>
        ) : processSteps.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-list-ol text-6xl text-gray-300 mb-4"></i>
            <p className="text-lg">No admission process steps found</p>
            <p className="text-sm mt-2">Click "Add Step" to create your first step</p>
          </div>
        ) : (
          <div className="space-y-4">
            {['All', 'UG', 'PG'].map(level => {
              const levelSteps = processSteps.filter(step => step.program_level === level).sort((a, b) => a.step_number - b.step_number);
              if (levelSteps.length === 0) return null;

              return (
                <div key={level} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate mb-3 flex items-center gap-2">
                    <i className="fas fa-layer-group text-crimson"></i>
                    {level === 'All' ? 'Common Steps (All Programs)' : `${level} Program Steps`}
                  </h4>
                  <div className="space-y-2">
                    {levelSteps.map((step) => (
                      <div key={step.id} className="p-3 bg-gray-50 rounded border border-gray-200 hover:shadow-sm transition">
                        <div className="flex items-start gap-3">
                          <span className="bg-crimson text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                            {step.step_number}
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold text-slate">{step.step_title}</div>
                            {step.step_description && (
                              <div className="text-sm text-gray-600 mt-1">{step.step_description}</div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${step.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {step.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingStep(step);
                                setShowStepModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition text-sm"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteStep(step.id)}
                              className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition text-sm"
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step Modal */}
      {showStepModal && <StepModal />}
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-6">
      {/* Payment Bank Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate">Bank Account Details</h2>
            <p className="text-gray-600 text-sm mt-1">Payment information for admissions</p>
          </div>
          <button
            onClick={() => setEditingPaymentInfo(!editingPaymentInfo)}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              editingPaymentInfo
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-crimson text-white hover:bg-crimson-dark'
            }`}
          >
            <i className={`fas ${editingPaymentInfo ? 'fa-times' : 'fa-edit'}`}></i>
            {editingPaymentInfo ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {paymentInfo ? (
          editingPaymentInfo ? (
            <PaymentInfoForm
              paymentInfo={paymentInfo}
              onSave={handleSavePaymentInfo}
              onCancel={() => setEditingPaymentInfo(false)}
            />
          ) : (
            <div className="bg-slate-50 p-6 rounded-lg border border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Account Name:</span>
                  <p className="font-semibold">{paymentInfo.account_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Bank Name:</span>
                  <p className="font-semibold">{paymentInfo.bank_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Account Number:</span>
                  <p className="font-semibold">{paymentInfo.account_number}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">IFSC Code:</span>
                  <p className="font-semibold">{paymentInfo.ifsc_code}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Branch:</span>
                  <p className="font-semibold">{paymentInfo.branch_name}</p>
                </div>
                {paymentInfo.branch_address && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">Branch Address:</span>
                    <p className="font-semibold">{paymentInfo.branch_address}</p>
                  </div>
                )}
                {paymentInfo.upi_id && (
                  <div>
                    <span className="font-medium text-gray-600">UPI ID:</span>
                    <p className="font-semibold">{paymentInfo.upi_id}</p>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-credit-card text-4xl text-gray-300 mb-4"></i>
            <p>No payment information found</p>
          </div>
        )}
      </div>

      {/* Payment Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate">Payment Options</h2>
            <p className="text-gray-600 text-sm mt-1">Available payment methods</p>
          </div>
          <button
            onClick={() => {
              setEditingPaymentOption(null);
              setShowPaymentOptionModal(true);
            }}
            className="bg-crimson text-white px-4 py-2 rounded-lg hover:bg-crimson-dark transition flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Option
          </button>
        </div>

        {paymentOptions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-money-check text-6xl text-gray-300 mb-4"></i>
            <p className="text-lg">No payment options found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paymentOptions.map((option) => (
              <div key={option.id} className="p-4 bg-gray-50 rounded border border-gray-200 hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-crimson text-white text-xs rounded font-semibold">
                        {option.option_type}
                      </span>
                      <h4 className="font-semibold text-slate">{option.option_title}</h4>
                    </div>
                    {option.option_description && (
                      <p className="text-sm text-gray-600 mt-2">{option.option_description}</p>
                    )}
                    <div className="text-xs text-gray-400 mt-1">Order: {option.display_order}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingPaymentOption(option);
                        setShowPaymentOptionModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition text-sm"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeletePaymentOption(option.id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition text-sm"
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

      {/* Payment Guidelines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate">Payment Guidelines</h2>
            <p className="text-gray-600 text-sm mt-1">Important payment instructions</p>
          </div>
          <button
            onClick={() => {
              setEditingPaymentGuideline(null);
              setShowPaymentGuidelineModal(true);
            }}
            className="bg-crimson text-white px-4 py-2 rounded-lg hover:bg-crimson-dark transition flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Guideline
          </button>
        </div>

        {paymentGuidelines.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-clipboard-list text-6xl text-gray-300 mb-4"></i>
            <p className="text-lg">No payment guidelines found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paymentGuidelines.map((guideline) => (
              <div key={guideline.id} className="p-4 bg-gray-50 rounded border border-gray-200 hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-3">
                    <i className="fas fa-check-circle text-crimson mt-1"></i>
                    <div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-semibold mr-2">
                        {guideline.guideline_type}
                      </span>
                      <p className="text-gray-700 mt-1">{guideline.guideline_text}</p>
                      <div className="text-xs text-gray-400 mt-1">Order: {guideline.display_order}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingPaymentGuideline(guideline);
                        setShowPaymentGuidelineModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition text-sm"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeletePaymentGuideline(guideline.id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition text-sm"
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

      {/* Modals */}
      {showPaymentOptionModal && <PaymentOptionModal />}
      {showPaymentGuidelineModal && <PaymentGuidelineModal />}
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      {/* Required Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate">Required Documents</h2>
            <p className="text-gray-600 text-sm mt-1">Manage admission document checklist</p>
          </div>
          <button
            onClick={() => {
              setEditingDocument(null);
              setShowDocumentModal(true);
            }}
            className="bg-crimson text-white px-4 py-2 rounded-lg hover:bg-crimson-dark transition flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Document
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-file-alt text-6xl text-gray-300 mb-4"></i>
            <p className="text-lg">No documents found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-gray-50 rounded border border-gray-200 hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate">{doc.document_name}</h4>
                      <span className={`px-2 py-1 text-xs rounded font-semibold ${
                        doc.is_mandatory
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {doc.is_mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-semibold">
                        {doc.applicable_for}
                      </span>
                    </div>
                    {doc.document_description && (
                      <p className="text-sm text-gray-600 mt-2">{doc.document_description}</p>
                    )}
                    <div className="text-xs text-gray-400 mt-1">Order: {doc.display_order}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingDocument(doc);
                        setShowDocumentModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition text-sm"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition text-sm"
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

      {/* Document Guidelines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate">Document Guidelines</h2>
            <p className="text-gray-600 text-sm mt-1">Important document submission instructions</p>
          </div>
          <button
            onClick={() => {
              setEditingDocumentGuideline(null);
              setShowDocumentGuidelineModal(true);
            }}
            className="bg-crimson text-white px-4 py-2 rounded-lg hover:bg-crimson-dark transition flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Guideline
          </button>
        </div>

        {documentGuidelines.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-clipboard-check text-6xl text-gray-300 mb-4"></i>
            <p className="text-lg">No document guidelines found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documentGuidelines.map((guideline) => (
              <div key={guideline.id} className="p-4 bg-gray-50 rounded border border-gray-200 hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-3">
                    <i className="fas fa-info-circle text-blue-600 mt-1"></i>
                    <div>
                      <p className="text-gray-700">{guideline.guideline_text}</p>
                      <div className="text-xs text-gray-400 mt-1">Order: {guideline.display_order}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingDocumentGuideline(guideline);
                        setShowDocumentGuidelineModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition text-sm"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteDocumentGuideline(guideline.id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition text-sm"
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

      {/* Modals */}
      {showDocumentModal && <DocumentModal />}
      {showDocumentGuidelineModal && <DocumentGuidelineModal />}
    </div>
  );

  // ============ MODAL COMPONENTS ============
  const StepModal = () => {
    const [formData, setFormData] = useState(editingStep || {
      program_level: 'All',
      step_number: '',
      step_title: '',
      step_description: '',
      is_active: true
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate">
                {editingStep ? 'Edit Step' : 'Add New Step'}
              </h2>
              <button
                onClick={() => setShowStepModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveStep(formData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Program Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.program_level}
                    onChange={(e) => setFormData({ ...formData, program_level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    required
                  >
                    <option value="All">All Programs</option>
                    <option value="UG">UG Programs</option>
                    <option value="PG">PG Programs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Step Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.step_number}
                    onChange={(e) => setFormData({ ...formData, step_number: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Step Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.step_title}
                    onChange={(e) => setFormData({ ...formData, step_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    required
                    placeholder="e.g., Fill application form"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.step_description || ''}
                    onChange={(e) => setFormData({ ...formData, step_description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    rows="3"
                    placeholder="Detailed description of this step..."
                  />
                </div>

                {editingStep && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                      Active
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowStepModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-crimson-dark transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Step'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const PaymentInfoForm = ({ paymentInfo, onSave, onCancel }) => {
    const [formData, setFormData] = useState(paymentInfo);

    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.account_name || ''}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.bank_name || ''}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.account_number || ''}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ifsc_code || ''}
              onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.branch_name || ''}
              onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              UPI ID
            </label>
            <input
              type="text"
              value={formData.upi_id || ''}
              onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Branch Address
            </label>
            <textarea
              value={formData.branch_address || ''}
              onChange={(e) => setFormData({ ...formData, branch_address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
              rows="2"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-crimson-dark transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    );
  };

  const PaymentOptionModal = () => {
    const [formData, setFormData] = useState(editingPaymentOption || {
      option_type: 'Online',
      option_title: '',
      option_description: '',
      display_order: 0,
      is_active: true
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate">
                {editingPaymentOption ? 'Edit Payment Option' : 'Add Payment Option'}
              </h2>
              <button
                onClick={() => setShowPaymentOptionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSavePaymentOption(formData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.option_type}
                    onChange={(e) => setFormData({ ...formData, option_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    required
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="DD">DD (Demand Draft)</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.option_title}
                    onChange={(e) => setFormData({ ...formData, option_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.option_description || ''}
                    onChange={(e) => setFormData({ ...formData, option_description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    min="0"
                  />
                </div>

                {editingPaymentOption && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="option_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="option_active" className="text-sm font-semibold text-gray-700">
                      Active
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPaymentOptionModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-crimson-dark transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const PaymentGuidelineModal = () => {
    const [formData, setFormData] = useState(editingPaymentGuideline || {
      guideline_type: 'General',
      guideline_text: '',
      display_order: 0,
      is_active: true
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate">
                {editingPaymentGuideline ? 'Edit Guideline' : 'Add Guideline'}
              </h2>
              <button
                onClick={() => setShowPaymentGuidelineModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSavePaymentGuideline(formData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Guideline Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.guideline_type}
                    onChange={(e) => setFormData({ ...formData, guideline_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    required
                  >
                    <option value="General">General</option>
                    <option value="Important">Important</option>
                    <option value="Refund">Refund</option>
                    <option value="Late Fee">Late Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Guideline Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.guideline_text}
                    onChange={(e) => setFormData({ ...formData, guideline_text: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    min="0"
                  />
                </div>

                {editingPaymentGuideline && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="guideline_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="guideline_active" className="text-sm font-semibold text-gray-700">
                      Active
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPaymentGuidelineModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-crimson-dark transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const DocumentModal = () => {
    const [formData, setFormData] = useState(editingDocument || {
      document_name: '',
      document_description: '',
      is_mandatory: true,
      applicable_for: 'All',
      program_specific: '',
      display_order: 0,
      is_active: true
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate">
                {editingDocument ? 'Edit Document' : 'Add Document'}
              </h2>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveDocument(formData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Document Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.document_name}
                    onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.document_description || ''}
                    onChange={(e) => setFormData({ ...formData, document_description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Applicable For <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.applicable_for}
                    onChange={(e) => setFormData({ ...formData, applicable_for: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    required
                  >
                    <option value="All">All Programs</option>
                    <option value="UG">UG Programs</option>
                    <option value="PG">PG Programs</option>
                    <option value="Specific">Specific Programs</option>
                  </select>
                </div>

                {formData.applicable_for === 'Specific' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Program Codes (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.program_specific || ''}
                      onChange={(e) => setFormData({ ...formData, program_specific: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                      placeholder="e.g., BCA, MCA, MBA"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_mandatory"
                    checked={formData.is_mandatory}
                    onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_mandatory" className="text-sm font-semibold text-gray-700">
                    Mandatory Document
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    min="0"
                  />
                </div>

                {editingDocument && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="doc_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="doc_active" className="text-sm font-semibold text-gray-700">
                      Active
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDocumentModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-crimson-dark transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const DocumentGuidelineModal = () => {
    const [formData, setFormData] = useState(editingDocumentGuideline || {
      guideline_text: '',
      display_order: 0,
      is_active: true
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate">
                {editingDocumentGuideline ? 'Edit Guideline' : 'Add Guideline'}
              </h2>
              <button
                onClick={() => setShowDocumentGuidelineModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveDocumentGuideline(formData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Guideline Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.guideline_text}
                    onChange={(e) => setFormData({ ...formData, guideline_text: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    rows="3"
                    required
                    placeholder="e.g., All documents should be self-attested"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    min="0"
                  />
                </div>

                {editingDocumentGuideline && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="doc_guideline_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="doc_guideline_active" className="text-sm font-semibold text-gray-700">
                      Active
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDocumentGuidelineModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-crimson-dark transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-slate mb-2">Manage Admissions</h1>
        <p className="text-sm text-gray-600">Manage enquiries and admission page content</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div>
            <i className="fas fa-check-circle mr-2"></i>
            {success}
          </div>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div>
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`pb-3 px-2 sm:px-4 font-semibold border-b-2 transition whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'enquiries'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-inbox mr-2"></i>
            Enquiries
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`pb-3 px-2 sm:px-4 font-semibold border-b-2 transition whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'steps'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-list-ol mr-2"></i>
            Admission Process
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`pb-3 px-2 sm:px-4 font-semibold border-b-2 transition whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'payment'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-credit-card mr-2"></i>
            Payment Procedure
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-2 sm:px-4 font-semibold border-b-2 transition whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'documents'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-file-alt mr-2"></i>
            Document Checklist
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'enquiries' && renderEnquiriesTab()}
      {activeTab === 'steps' && renderAdmissionProcessTab()}
      {activeTab === 'payment' && renderPaymentTab()}
      {activeTab === 'documents' && renderDocumentsTab()}
    </div>
  );
};

export default ManageAdmissionsPage;
