import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api.config';

const API_URL = API_CONFIG.API_URL;

const ManageSMTPSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    setting_name: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: '',
    encryption_type: 'tls',
    is_active: true,
    is_default: false,
    description: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/smtp-settings`);
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
      alert('Error loading SMTP settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.setting_name || !formData.smtp_host || !formData.smtp_username ||
        !formData.smtp_password || !formData.from_email || !formData.from_name) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      const url = editingId
        ? `${API_URL}/smtp-settings/${editingId}`
        : `${API_URL}/smtp-settings`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert(editingId ? 'SMTP setting updated successfully!' : 'SMTP setting created successfully!');
        setShowModal(false);
        resetForm();
        loadSettings();
      } else {
        alert(result.message || 'Error saving SMTP setting');
      }
    } catch (error) {
      console.error('Error saving SMTP setting:', error);
      alert('Error saving SMTP setting');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (setting) => {
    setEditingId(setting.id);
    setFormData({
      setting_name: setting.setting_name,
      smtp_host: setting.smtp_host,
      smtp_port: setting.smtp_port,
      smtp_username: setting.smtp_username,
      smtp_password: setting.smtp_password,
      from_email: setting.from_email,
      from_name: setting.from_name,
      encryption_type: setting.encryption_type,
      is_active: setting.is_active,
      is_default: setting.is_default,
      description: setting.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id, isDefault) => {
    if (isDefault) {
      alert('Cannot delete default SMTP setting. Please set another setting as default first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this SMTP setting?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/smtp-settings/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        alert('SMTP setting deleted successfully!');
        loadSettings();
      } else {
        alert(result.message || 'Error deleting SMTP setting');
      }
    } catch (error) {
      console.error('Error deleting SMTP setting:', error);
      alert('Error deleting SMTP setting');
    }
  };

  const handleSetDefault = async (id) => {
    if (!window.confirm('Set this as the default SMTP configuration?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/smtp-settings/${id}/set-default`, {
        method: 'PUT'
      });

      const result = await response.json();

      if (result.success) {
        alert('Default SMTP setting updated successfully!');
        loadSettings();
      } else {
        alert(result.message || 'Error setting default SMTP');
      }
    } catch (error) {
      console.error('Error setting default SMTP:', error);
      alert('Error setting default SMTP');
    }
  };

  const resetForm = () => {
    setFormData({
      setting_name: '',
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      from_email: '',
      from_name: '',
      encryption_type: 'tls',
      is_active: true,
      is_default: false,
      description: ''
    });
    setEditingId(null);
    setShowPassword(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading SMTP settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate flex items-center gap-3">
              <i className="fas fa-envelope-open-text text-crimson"></i>
              SMTP Settings Management
            </h1>
            <p className="text-gray-600 mt-2">Configure email server settings for sending emails</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-crimson hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add New SMTP Configuration
          </button>
        </div>
      </div>

      {/* SMTP Settings List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-slate mb-4 flex items-center gap-2">
          <i className="fas fa-server text-blue-600"></i>
          SMTP Configurations ({settings.length})
        </h2>

        {settings.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg">No SMTP configurations found</p>
            <button
              onClick={handleAddNew}
              className="mt-4 text-crimson hover:text-red-700 font-semibold"
            >
              <i className="fas fa-plus mr-2"></i>
              Add your first SMTP configuration
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-slate">Configuration Name</th>
                  <th className="text-left p-4 font-semibold text-slate">SMTP Host</th>
                  <th className="text-left p-4 font-semibold text-slate">Port</th>
                  <th className="text-left p-4 font-semibold text-slate">From Email</th>
                  <th className="text-left p-4 font-semibold text-slate">Encryption</th>
                  <th className="text-left p-4 font-semibold text-slate">Status</th>
                  <th className="text-left p-4 font-semibold text-slate">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {settings.map((setting) => (
                  <tr key={setting.id} className={`hover:bg-gray-50 ${setting.is_default ? 'bg-blue-50' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate">{setting.setting_name}</span>
                        {setting.is_default && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      {setting.description && (
                        <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{setting.smtp_host}</td>
                    <td className="p-4 text-gray-600">{setting.smtp_port}</td>
                    <td className="p-4">
                      <div className="text-gray-600 text-sm">
                        <div>{setting.from_email}</div>
                        <div className="text-xs text-gray-500">{setting.from_name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        setting.encryption_type === 'tls' ? 'bg-green-100 text-green-700' :
                        setting.encryption_type === 'ssl' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {setting.encryption_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        setting.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {setting.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {!setting.is_default && (
                          <button
                            onClick={() => handleSetDefault(setting.id)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                            title="Set as Default"
                          >
                            <i className="fas fa-star"></i>
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(setting)}
                          className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50 transition"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(setting.id, setting.is_default)}
                          className={`p-2 rounded transition ${
                            setting.is_default
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          }`}
                          title={setting.is_default ? 'Cannot delete default' : 'Delete'}
                          disabled={setting.is_default}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate flex items-center gap-2">
                <i className="fas fa-envelope text-crimson"></i>
                {editingId ? 'Edit SMTP Configuration' : 'Add New SMTP Configuration'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Configuration Name */}
              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  Configuration Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="setting_name"
                  value={formData.setting_name}
                  onChange={handleInputChange}
                  placeholder="e.g., gmail_smtp, office365_smtp"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier for this configuration</p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SMTP Host */}
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">
                    SMTP Host <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="smtp_host"
                    value={formData.smtp_host}
                    onChange={handleInputChange}
                    placeholder="smtp.gmail.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    required
                  />
                </div>

                {/* SMTP Port */}
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">
                    SMTP Port <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="smtp_port"
                    value={formData.smtp_port}
                    onChange={handleInputChange}
                    placeholder="587"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">587 (TLS), 465 (SSL), 25 (None)</p>
                </div>

                {/* SMTP Username */}
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">
                    SMTP Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="smtp_username"
                    value={formData.smtp_username}
                    onChange={handleInputChange}
                    placeholder="your-email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    required
                  />
                </div>

                {/* SMTP Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">
                    SMTP Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="smtp_password"
                      value={formData.smtp_password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* From Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">
                    From Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="from_email"
                    value={formData.from_email}
                    onChange={handleInputChange}
                    placeholder="noreply@forte.ac.in"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    required
                  />
                </div>

                {/* From Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">
                    From Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="from_name"
                    value={formData.from_name}
                    onChange={handleInputChange}
                    placeholder="Forte Institute"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                    required
                  />
                </div>

                {/* Encryption Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate mb-2">
                    Encryption Type
                  </label>
                  <select
                    name="encryption_type"
                    value={formData.encryption_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                  >
                    <option value="tls">TLS (Recommended)</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Optional description or notes about this configuration"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                ></textarea>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-crimson border-gray-300 rounded focus:ring-2 focus:ring-crimson"
                  />
                  <label className="text-sm font-semibold text-slate">
                    Active (Enable this SMTP configuration)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-crimson border-gray-300 rounded focus:ring-2 focus:ring-crimson"
                  />
                  <label className="text-sm font-semibold text-slate">
                    Set as Default (This will be used for sending emails)
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-crimson hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {editingId ? 'Update Configuration' : 'Create Configuration'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSMTPSettings;
