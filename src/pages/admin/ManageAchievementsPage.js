import React, { useState, useEffect } from 'react';
import { achievementsAPI } from '../../services/api';

const ManageAchievementsPage = () => {
  const [activeTab, setActiveTab] = useState('institutional');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState([]);

  // Data states
  const [institutionalAwards, setInstitutionalAwards] = useState([]);
  const [studentAchievements, setStudentAchievements] = useState([]);
  const [facultyAchievements, setFacultyAchievements] = useState([]);
  const [placementHighlights, setPlacementHighlights] = useState([]);
  const [recognitions, setRecognitions] = useState([]);

  // Form states
  const [editingItem, setEditingItem] = useState(null);
  const [institutionalForm, setInstitutionalForm] = useState({
    year: new Date().getFullYear().toString(),
    title: '',
    organization: '',
    icon: 'fas fa-trophy',
    description: '',
    display_order: 0
  });

  const [studentForm, setStudentForm] = useState({
    category_id: '',
    title: '',
    event_name: '',
    participants: '',
    prize: '',
    achievement_date: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true
  });

  const [facultyForm, setFacultyForm] = useState({
    faculty_name: '',
    department: '',
    achievement_text: '',
    achievement_type: 'other',
    achievement_date: '',
    image_url: '',
    display_order: 0,
    is_active: true
  });

  const [placementForm, setPlacementForm] = useState({
    company_name: '',
    package: '',
    students_placed: 0,
    year: new Date().getFullYear().toString(),
    display_order: 0
  });

  const [recognitionForm, setRecognitionForm] = useState({
    short_name: '',
    full_name: '',
    description: '',
    badge_color: '#dc2626',
    display_order: 0
  });

  useEffect(() => {
    fetchStatistics();
    fetchCategories();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'institutional':
        fetchInstitutionalAwards();
        break;
      case 'student':
        fetchStudentAchievements();
        break;
      case 'faculty':
        fetchFacultyAchievements();
        break;
      case 'placements':
        fetchPlacementHighlights();
        break;
      case 'recognitions':
        fetchRecognitions();
        break;
      default:
        break;
    }
  }, [activeTab]);

  const fetchStatistics = async () => {
    try {
      const response = await achievementsAPI.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await achievementsAPI.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchInstitutionalAwards = async () => {
    setLoading(true);
    try {
      const response = await achievementsAPI.getInstitutionalAwards();
      if (response.success) {
        setInstitutionalAwards(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAchievements = async () => {
    setLoading(true);
    try {
      const response = await achievementsAPI.getStudentAchievementsList();
      if (response.success) {
        setStudentAchievements(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyAchievements = async () => {
    setLoading(true);
    try {
      const response = await achievementsAPI.getFacultyAchievements();
      if (response.success) {
        setFacultyAchievements(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacementHighlights = async () => {
    setLoading(true);
    try {
      const response = await achievementsAPI.getPlacementHighlights();
      if (response.success) {
        setPlacementHighlights(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecognitions = async () => {
    setLoading(true);
    try {
      const response = await achievementsAPI.getRecognitions();
      if (response.success) {
        setRecognitions(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Institutional Awards CRUD
  const handleSaveInstitutional = async () => {
    if (!institutionalForm.title || !institutionalForm.organization || !institutionalForm.year) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        await achievementsAPI.updateInstitutionalAward(editingItem.id, institutionalForm);
        alert('Award updated successfully!');
      } else {
        await achievementsAPI.createInstitutionalAward(institutionalForm);
        alert('Award created successfully!');
      }
      resetInstitutionalForm();
      fetchInstitutionalAwards();
      fetchStatistics();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save award');
    } finally {
      setLoading(false);
    }
  };

  const handleEditInstitutional = (item) => {
    setEditingItem(item);
    setInstitutionalForm({
      year: item.year,
      title: item.title,
      organization: item.organization,
      icon: item.icon,
      description: item.description || '',
      display_order: item.display_order
    });
  };

  const handleDeleteInstitutional = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    setLoading(true);
    try {
      await achievementsAPI.deleteInstitutionalAward(id);
      alert('Award deleted!');
      fetchInstitutionalAwards();
      fetchStatistics();
    } catch (error) {
      alert('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const resetInstitutionalForm = () => {
    setEditingItem(null);
    setInstitutionalForm({
      year: new Date().getFullYear().toString(),
      title: '',
      organization: '',
      icon: 'fas fa-trophy',
      description: '',
      display_order: 0
    });
  };

  // Student Achievements CRUD
  const handleSaveStudent = async () => {
    if (!studentForm.category_id || !studentForm.title || !studentForm.event_name) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        await achievementsAPI.updateStudentAchievement(editingItem.id, studentForm);
        alert('Achievement updated!');
      } else {
        await achievementsAPI.createStudentAchievement(studentForm);
        alert('Achievement created!');
      }
      resetStudentForm();
      fetchStudentAchievements();
      fetchStatistics();
    } catch (error) {
      alert('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (item) => {
    setEditingItem(item);

    // Format date for HTML input (yyyy-MM-dd)
    let formattedDate = '';
    if (item.achievement_date) {
      const date = new Date(item.achievement_date);
      formattedDate = date.toISOString().split('T')[0];
    }

    setStudentForm({
      category_id: item.category_id,
      title: item.title,
      event_name: item.event_name,
      participants: item.participants,
      prize: item.prize,
      achievement_date: formattedDate,
      description: item.description || '',
      image_url: item.image_url || '',
      display_order: item.display_order,
      is_active: item.is_active !== undefined ? item.is_active : true
    });
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    setLoading(true);
    try {
      await achievementsAPI.deleteStudentAchievement(id);
      alert('Deleted!');
      fetchStudentAchievements();
      fetchStatistics();
    } catch (error) {
      alert('Failed');
    } finally {
      setLoading(false);
    }
  };

  const resetStudentForm = () => {
    setEditingItem(null);
    setStudentForm({
      category_id: '',
      title: '',
      event_name: '',
      participants: '',
      prize: '',
      achievement_date: '',
      description: '',
      image_url: '',
      display_order: 0,
      is_active: true
    });
  };

  // Faculty Achievements CRUD
  const handleSaveFaculty = async () => {
    if (!facultyForm.faculty_name || !facultyForm.department || !facultyForm.achievement_text) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        await achievementsAPI.updateFacultyAchievement(editingItem.id, facultyForm);
        alert('Updated!');
      } else {
        await achievementsAPI.createFacultyAchievement(facultyForm);
        alert('Created!');
      }
      resetFacultyForm();
      fetchFacultyAchievements();
      fetchStatistics();
    } catch (error) {
      alert('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFaculty = (item) => {
    setEditingItem(item);

    // Format date for HTML input (yyyy-MM-dd)
    let formattedDate = '';
    if (item.achievement_date) {
      const date = new Date(item.achievement_date);
      formattedDate = date.toISOString().split('T')[0];
    }

    setFacultyForm({
      faculty_name: item.faculty_name,
      department: item.department,
      achievement_text: item.achievement_text,
      achievement_type: item.achievement_type,
      achievement_date: formattedDate,
      image_url: item.image_url || '',
      display_order: item.display_order,
      is_active: item.is_active !== undefined ? item.is_active : true
    });
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    setLoading(true);
    try {
      await achievementsAPI.deleteFacultyAchievement(id);
      alert('Deleted!');
      fetchFacultyAchievements();
      fetchStatistics();
    } catch (error) {
      alert('Failed');
    } finally {
      setLoading(false);
    }
  };

  const resetFacultyForm = () => {
    setEditingItem(null);
    setFacultyForm({
      faculty_name: '',
      department: '',
      achievement_text: '',
      achievement_type: 'other',
      achievement_date: '',
      image_url: '',
      display_order: 0,
      is_active: true
    });
  };

  // Placement Highlights CRUD
  const handleSavePlacement = async () => {
    if (!placementForm.company_name || !placementForm.package || !placementForm.year) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        await achievementsAPI.updatePlacementHighlight(editingItem.id, placementForm);
        alert('Updated!');
      } else {
        await achievementsAPI.createPlacementHighlight(placementForm);
        alert('Created!');
      }
      resetPlacementForm();
      fetchPlacementHighlights();
      fetchStatistics();
    } catch (error) {
      alert('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlacement = (item) => {
    setEditingItem(item);
    setPlacementForm({
      company_name: item.company_name,
      package: item.package,
      students_placed: item.students_placed,
      year: item.year,
      display_order: item.display_order
    });
  };

  const handleDeletePlacement = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    setLoading(true);
    try {
      await achievementsAPI.deletePlacementHighlight(id);
      alert('Deleted!');
      fetchPlacementHighlights();
      fetchStatistics();
    } catch (error) {
      alert('Failed');
    } finally {
      setLoading(false);
    }
  };

  const resetPlacementForm = () => {
    setEditingItem(null);
    setPlacementForm({
      company_name: '',
      package: '',
      students_placed: 0,
      year: new Date().getFullYear().toString(),
      display_order: 0
    });
  };

  // Recognitions CRUD
  const handleSaveRecognition = async () => {
    if (!recognitionForm.short_name || !recognitionForm.full_name) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        await achievementsAPI.updateRecognition(editingItem.id, recognitionForm);
        alert('Updated!');
      } else {
        await achievementsAPI.createRecognition(recognitionForm);
        alert('Created!');
      }
      resetRecognitionForm();
      fetchRecognitions();
      fetchStatistics();
    } catch (error) {
      alert('Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecognition = (item) => {
    setEditingItem(item);
    setRecognitionForm({
      short_name: item.short_name,
      full_name: item.full_name,
      description: item.description || '',
      badge_color: item.badge_color,
      display_order: item.display_order
    });
  };

  const handleDeleteRecognition = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    setLoading(true);
    try {
      await achievementsAPI.deleteRecognition(id);
      alert('Deleted!');
      fetchRecognitions();
      fetchStatistics();
    } catch (error) {
      alert('Failed');
    } finally {
      setLoading(false);
    }
  };

  const resetRecognitionForm = () => {
    setEditingItem(null);
    setRecognitionForm({
      short_name: '',
      full_name: '',
      description: '',
      badge_color: '#dc2626',
      display_order: 0
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate mb-2">Manage Achievements & Awards</h1>
        <p className="text-gray-600">Manage institutional awards, student/faculty achievements, placements, and recognitions</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-gray-500 text-sm">Institutional Awards</p>
            <p className="text-2xl font-bold text-slate">{statistics.institutional_awards}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-gray-500 text-sm">Student Achievements</p>
            <p className="text-2xl font-bold text-slate">{statistics.student_achievements}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-gray-500 text-sm">Faculty Achievements</p>
            <p className="text-2xl font-bold text-slate">{statistics.faculty_achievements}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-gray-500 text-sm">Placement Highlights</p>
            <p className="text-2xl font-bold text-slate">{statistics.placement_highlights}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-gray-500 text-sm">Recognitions</p>
            <p className="text-2xl font-bold text-slate">{statistics.recognitions}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b">
          <div className="flex flex-wrap">
            {[
              { id: 'institutional', label: 'Institutional Awards', icon: 'fa-trophy' },
              { id: 'student', label: 'Student Achievements', icon: 'fa-graduation-cap' },
              { id: 'faculty', label: 'Faculty Achievements', icon: 'fa-user-tie' },
              { id: 'placements', label: 'Placement Highlights', icon: 'fa-briefcase' },
              { id: 'recognitions', label: 'Recognitions', icon: 'fa-certificate' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === tab.id
                    ? 'text-crimson border-b-2 border-crimson'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>{tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* INSTITUTIONAL AWARDS TAB */}
          {activeTab === 'institutional' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-xl font-bold text-slate mb-4">
                  {editingItem ? 'Edit Award' : 'Add New Award'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Year *"
                    value={institutionalForm.year}
                    onChange={(e) => setInstitutionalForm({ ...institutionalForm, year: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Icon Class"
                    value={institutionalForm.icon}
                    onChange={(e) => setInstitutionalForm({ ...institutionalForm, icon: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Award Title *"
                    value={institutionalForm.title}
                    onChange={(e) => setInstitutionalForm({ ...institutionalForm, title: e.target.value })}
                    className="px-4 py-2 border rounded-lg md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Organization *"
                    value={institutionalForm.organization}
                    onChange={(e) => setInstitutionalForm({ ...institutionalForm, organization: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Display Order"
                    value={institutionalForm.display_order}
                    onChange={(e) => setInstitutionalForm({ ...institutionalForm, display_order: parseInt(e.target.value) })}
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleSaveInstitutional} disabled={loading} className="px-6 py-2 bg-crimson text-white rounded-lg hover:bg-red-800">
                    {loading ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                  </button>
                  {editingItem && (
                    <button onClick={resetInstitutionalForm} className="px-6 py-2 bg-gray-400 text-white rounded-lg">
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate mb-4">Existing Awards</h3>
                {loading ? <p>Loading...</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {institutionalAwards.map(award => (
                      <div key={award.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-crimson font-semibold">{award.year}</p>
                            <h4 className="font-bold text-slate">{award.title}</h4>
                            <p className="text-sm text-gray-600">{award.organization}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditInstitutional(award)} className="text-blue-600"><i className="fas fa-edit"></i></button>
                            <button onClick={() => handleDeleteInstitutional(award.id)} className="text-red-600"><i className="fas fa-trash"></i></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STUDENT ACHIEVEMENTS TAB */}
          {activeTab === 'student' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-xl font-bold text-slate mb-4">
                  {editingItem ? 'Edit Achievement' : 'Add New Achievement'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={studentForm.category_id}
                    onChange={(e) => setStudentForm({ ...studentForm, category_id: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select Category *</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Title/Prize *"
                    value={studentForm.title}
                    onChange={(e) => setStudentForm({ ...studentForm, title: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Event Name *"
                    value={studentForm.event_name}
                    onChange={(e) => setStudentForm({ ...studentForm, event_name: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Participants *"
                    value={studentForm.participants}
                    onChange={(e) => setStudentForm({ ...studentForm, participants: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Prize *"
                    value={studentForm.prize}
                    onChange={(e) => setStudentForm({ ...studentForm, prize: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="date"
                    value={studentForm.achievement_date}
                    onChange={(e) => setStudentForm({ ...studentForm, achievement_date: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleSaveStudent} disabled={loading} className="px-6 py-2 bg-crimson text-white rounded-lg">
                    {loading ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                  </button>
                  {editingItem && (
                    <button onClick={resetStudentForm} className="px-6 py-2 bg-gray-400 text-white rounded-lg">Cancel</button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate mb-4">Existing Achievements</h3>
                {loading ? <p>Loading...</p> : (
                  <div className="space-y-4">
                    {studentAchievements.map(achievement => (
                      <div key={achievement.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-crimson font-semibold">{achievement.category_name}</p>
                            <h4 className="font-bold">{achievement.event_name}</h4>
                            <p className="text-sm text-gray-600">{achievement.participants} - {achievement.prize}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditStudent(achievement)} className="text-blue-600"><i className="fas fa-edit"></i></button>
                            <button onClick={() => handleDeleteStudent(achievement.id)} className="text-red-600"><i className="fas fa-trash"></i></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FACULTY ACHIEVEMENTS TAB */}
          {activeTab === 'faculty' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-xl font-bold text-slate mb-4">
                  {editingItem ? 'Edit Achievement' : 'Add New Achievement'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Faculty Name *"
                    value={facultyForm.faculty_name}
                    onChange={(e) => setFacultyForm({ ...facultyForm, faculty_name: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Department *"
                    value={facultyForm.department}
                    onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <select
                    value={facultyForm.achievement_type}
                    onChange={(e) => setFacultyForm({ ...facultyForm, achievement_type: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="other">Other</option>
                    <option value="publication">Publication</option>
                    <option value="award">Award</option>
                    <option value="research">Research</option>
                    <option value="teaching">Teaching</option>
                    <option value="conference">Conference</option>
                  </select>
                  <input
                    type="date"
                    value={facultyForm.achievement_date}
                    onChange={(e) => setFacultyForm({ ...facultyForm, achievement_date: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <textarea
                    placeholder="Achievement Text *"
                    value={facultyForm.achievement_text}
                    onChange={(e) => setFacultyForm({ ...facultyForm, achievement_text: e.target.value })}
                    className="px-4 py-2 border rounded-lg md:col-span-2"
                    rows="3"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleSaveFaculty} disabled={loading} className="px-6 py-2 bg-crimson text-white rounded-lg">
                    {loading ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                  </button>
                  {editingItem && (
                    <button onClick={resetFacultyForm} className="px-6 py-2 bg-gray-400 text-white rounded-lg">Cancel</button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate mb-4">Existing Achievements</h3>
                {loading ? <p>Loading...</p> : (
                  <div className="space-y-4">
                    {facultyAchievements.map(achievement => (
                      <div key={achievement.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold">{achievement.faculty_name}</h4>
                            <p className="text-sm text-crimson">{achievement.department}</p>
                            <p className="text-sm text-gray-600 mt-1">{achievement.achievement_text}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditFaculty(achievement)} className="text-blue-600"><i className="fas fa-edit"></i></button>
                            <button onClick={() => handleDeleteFaculty(achievement.id)} className="text-red-600"><i className="fas fa-trash"></i></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PLACEMENT HIGHLIGHTS TAB */}
          {activeTab === 'placements' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-xl font-bold text-slate mb-4">
                  {editingItem ? 'Edit Placement' : 'Add New Placement'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company Name *"
                    value={placementForm.company_name}
                    onChange={(e) => setPlacementForm({ ...placementForm, company_name: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Package (e.g., 4.5 LPA) *"
                    value={placementForm.package}
                    onChange={(e) => setPlacementForm({ ...placementForm, package: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Students Placed *"
                    value={placementForm.students_placed}
                    onChange={(e) => setPlacementForm({ ...placementForm, students_placed: parseInt(e.target.value) })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Year *"
                    value={placementForm.year}
                    onChange={(e) => setPlacementForm({ ...placementForm, year: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleSavePlacement} disabled={loading} className="px-6 py-2 bg-crimson text-white rounded-lg">
                    {loading ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                  </button>
                  {editingItem && (
                    <button onClick={resetPlacementForm} className="px-6 py-2 bg-gray-400 text-white rounded-lg">Cancel</button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate mb-4">Existing Placements</h3>
                {loading ? <p>Loading...</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {placementHighlights.map(placement => (
                      <div key={placement.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate">{placement.company_name}</h4>
                            <p className="text-crimson">{placement.package}</p>
                            <p className="text-sm text-gray-600">{placement.students_placed} students ({placement.year})</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditPlacement(placement)} className="text-blue-600"><i className="fas fa-edit"></i></button>
                            <button onClick={() => handleDeletePlacement(placement.id)} className="text-red-600"><i className="fas fa-trash"></i></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RECOGNITIONS TAB */}
          {activeTab === 'recognitions' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-xl font-bold text-slate mb-4">
                  {editingItem ? 'Edit Recognition' : 'Add New Recognition'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Short Name (e.g., UGC) *"
                    value={recognitionForm.short_name}
                    onChange={(e) => setRecognitionForm({ ...recognitionForm, short_name: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={recognitionForm.full_name}
                    onChange={(e) => setRecognitionForm({ ...recognitionForm, full_name: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="color"
                    value={recognitionForm.badge_color}
                    onChange={(e) => setRecognitionForm({ ...recognitionForm, badge_color: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Display Order"
                    value={recognitionForm.display_order}
                    onChange={(e) => setRecognitionForm({ ...recognitionForm, display_order: parseInt(e.target.value) })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <textarea
                    placeholder="Description"
                    value={recognitionForm.description}
                    onChange={(e) => setRecognitionForm({ ...recognitionForm, description: e.target.value })}
                    className="px-4 py-2 border rounded-lg md:col-span-2"
                    rows="2"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleSaveRecognition} disabled={loading} className="px-6 py-2 bg-crimson text-white rounded-lg">
                    {loading ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                  </button>
                  {editingItem && (
                    <button onClick={resetRecognitionForm} className="px-6 py-2 bg-gray-400 text-white rounded-lg">Cancel</button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate mb-4">Existing Recognitions</h3>
                {loading ? <p>Loading...</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recognitions.map(recognition => (
                      <div key={recognition.id} className="bg-white p-4 rounded-lg border text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: recognition.badge_color }}>
                          <span className="text-white font-bold text-lg">{recognition.short_name}</span>
                        </div>
                        <h4 className="font-bold text-sm">{recognition.full_name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{recognition.description}</p>
                        <div className="flex justify-center gap-2 mt-3">
                          <button onClick={() => handleEditRecognition(recognition)} className="text-blue-600"><i className="fas fa-edit"></i></button>
                          <button onClick={() => handleDeleteRecognition(recognition.id)} className="text-red-600"><i className="fas fa-trash"></i></button>
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

export default ManageAchievementsPage;
