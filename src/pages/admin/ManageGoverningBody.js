import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api.config';

const API_URL = API_CONFIG.API_URL;

const ManageGoverningBody = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    role_in_gb: '',
    display_order: 0
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/governing-body`);
      const data = await response.json();

      if (data.success) {
        setMembers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading governing body members:', error);
      alert('Error loading data from backend');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.designation || !formData.role_in_gb) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const url = editingMember
        ? `${API_URL}/governing-body/${editingMember.id}`
        : `${API_URL}/governing-body`;

      const method = editingMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert(editingMember ? '✅ Member updated successfully!' : '✅ Member added successfully!');
        resetForm();
        loadMembers();
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving member:', error);
      alert('❌ Error saving member. Please try again.');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      designation: member.designation,
      role_in_gb: member.role_in_gb,
      display_order: member.display_order || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/governing-body/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Member deleted successfully!');
        loadMembers();
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('❌ Error deleting member. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      designation: '',
      role_in_gb: '',
      display_order: 0
    });
    setEditingMember(null);
    setShowForm(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate mb-2">Manage Governing Body</h1>
        <p className="text-gray-600">Add, edit, or remove governing body members</p>
      </div>

      {/* Add New Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-crimson text-white rounded-lg hover:bg-red-800 transition font-semibold"
        >
          {showForm ? (
            <>
              <i className="fas fa-times mr-2"></i>
              Cancel
            </>
          ) : (
            <>
              <i className="fas fa-plus mr-2"></i>
              Add New Member
            </>
          )}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate mb-4">
            {editingMember ? 'Edit Member' : 'Add New Member'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                  placeholder="e.g., Dr. Rajesh Kumar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                  placeholder="e.g., Principal, FIT"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role in Governing Body <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.role_in_gb}
                onChange={(e) => handleChange('role_in_gb', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                placeholder="e.g., Chairman, Member, Secretary"
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
                onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-transparent"
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first in the table
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-crimson text-white rounded-lg hover:bg-red-800 transition font-semibold"
              >
                <i className="fas fa-save mr-2"></i>
                {editingMember ? 'Update Member' : 'Add Member'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-slate">
            Governing Body Members ({members.length})
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <i className="fas fa-users text-4xl mb-4"></i>
            <p>No governing body members added yet</p>
            <p className="text-sm mt-2">Click "Add New Member" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate">S.No.</th>
                  <th className="text-left p-4 font-semibold text-slate">Name</th>
                  <th className="text-left p-4 font-semibold text-slate">Designation</th>
                  <th className="text-left p-4 font-semibold text-slate">Role in GB</th>
                  <th className="text-left p-4 font-semibold text-slate">Display Order</th>
                  <th className="text-center p-4 font-semibold text-slate">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member, index) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-700">{index + 1}</td>
                    <td className="p-4">
                      <span className="font-semibold text-slate">{member.name}</span>
                    </td>
                    <td className="p-4 text-gray-700">{member.designation}</td>
                    <td className="p-4 text-gray-700">{member.role_in_gb}</td>
                    <td className="p-4 text-gray-700">{member.display_order}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-semibold"
                          title="Edit"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-semibold"
                          title="Delete"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Delete
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

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          <i className="fas fa-info-circle mr-2"></i>
          How to use
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><i className="fas fa-check mr-2"></i>Click "Add New Member" to add governing body members</li>
          <li><i className="fas fa-check mr-2"></i>Use "Display Order" to control the order members appear in the table (lower numbers first)</li>
          <li><i className="fas fa-check mr-2"></i>Click "Edit" to modify member details</li>
          <li><i className="fas fa-check mr-2"></i>Click "Delete" to remove a member from the governing body</li>
          <li><i className="fas fa-check mr-2"></i>Changes are reflected immediately on the Management page</li>
        </ul>
      </div>
    </div>
  );
};

export default ManageGoverningBody;
