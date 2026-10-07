import React, { useState, useEffect } from 'react';
import { academicsAPI } from '../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import API_CONFIG from '../../config/api.config';

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
  'header'
];

const ManageAcademicsPage = () => {
  const [activeTab, setActiveTab] = useState('programs');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Department Form State
  const [departmentForm, setDepartmentForm] = useState({
    id: null,
    department_name: '',
    department_code: '',
    description: '',
    head_of_department: ''
  });

  // Course Form State
  const [courseForm, setCourseForm] = useState({
    id: null,
    course_name: '',
    course_code: '',
    department_id: '',
    duration_years: '',
    total_seats: '',
    eligibility: '',
    fee_per_year: '',
    description: ''
  });

  const [departmentEditMode, setDepartmentEditMode] = useState(false);
  const [courseEditMode, setCourseEditMode] = useState(false);

  // Anti-Ragging State
  const [antiRaggingPolicy, setAntiRaggingPolicy] = useState('');

  // Grievances State
  const [grievances, setGrievances] = useState([]);

  // Faculty State
  const [faculty, setFaculty] = useState([]);
  const [facultyForm, setFacultyForm] = useState({
    id: null,
    full_name: '',
    designation: '',
    department_id: '',
    qualification: '',
    specialization: '',
    email: '',
    phone: '',
    experience_years: '',
    photo_url: '',
    bio: ''
  });
  const [facultyPhotoUploading, setFacultyPhotoUploading] = useState(false);
  const [facultyPhotoPreview, setFacultyPhotoPreview] = useState('');

  // Load departments and courses on mount
  useEffect(() => {
    loadDepartments();
    loadCourses();
    if (activeTab === 'anti-ragging') loadAntiRaggingPolicy();
    if (activeTab === 'grievance') loadGrievances();
    if (activeTab === 'faculty') loadFaculty();
  }, [activeTab]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await academicsAPI.getDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      setError('Failed to load departments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await academicsAPI.getCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      setError('Failed to load courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Department Handlers
  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('🔍 Department Submit Debug:');
      console.log('departmentEditMode:', departmentEditMode);
      console.log('departmentForm.id:', departmentForm.id);
      console.log('departmentForm:', departmentForm);

      if (departmentEditMode && departmentForm.id) {
        console.log('✅ Updating department with ID:', departmentForm.id);
        await academicsAPI.updateDepartment(departmentForm.id, departmentForm);
        setSuccess('Department updated successfully!');
      } else {
        console.log('➕ Adding new department');
        await academicsAPI.addDepartment(departmentForm);
        setSuccess('Department added successfully!');
      }

      resetDepartmentForm();
      loadDepartments();
    } catch (error) {
      console.error('❌ Department submit error:', error);
      setError(error.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = (dept) => {
    console.log('📝 Editing department - FULL OBJECT:', JSON.stringify(dept, null, 2));
    console.log('📝 Department keys:', Object.keys(dept));
    console.log('📝 ALL VALUES:');
    Object.keys(dept).forEach(key => {
      console.log(`   ${key}: ${dept[key]}`);
    });

    // Use department_id or id based on what's available
    const departmentId = dept.department_id || dept.id || dept.dept_id;
    console.log('📝 Selected Department ID:', departmentId);

    const formData = {
      id: departmentId,
      department_name: dept.department_name || '',
      department_code: dept.department_code || '',
      description: dept.description || '',
      head_of_department: dept.head_of_department || ''
    };
    console.log('📝 Final Form Data:', JSON.stringify(formData, null, 2));
    setDepartmentForm(formData);
    setDepartmentEditMode(true);
    console.log('Department edit mode set to TRUE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      setLoading(true);
      await academicsAPI.deleteDepartment(id);
      setSuccess('Department deleted successfully!');
      loadDepartments();
    } catch (error) {
      setError('Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  const resetDepartmentForm = () => {
    setDepartmentForm({
      id: null,
      department_name: '',
      department_code: '',
      description: '',
      head_of_department: ''
    });
    setDepartmentEditMode(false);
  };

  // Course Handlers
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('Course Form Data:', courseForm);

      if (courseEditMode && courseForm.id) {
        console.log('Updating course ID:', courseForm.id);

        // Clean up form data - convert empty strings to null for numeric fields
        const cleanedData = {
          course_name: courseForm.course_name,
          course_code: courseForm.course_code,
          department_id: courseForm.department_id || null,
          duration_years: courseForm.duration_years ? parseInt(courseForm.duration_years) : null,
          total_seats: courseForm.total_seats ? parseInt(courseForm.total_seats) : null,
          eligibility: courseForm.eligibility || null,
          fee_per_year: courseForm.fee_per_year ? parseFloat(courseForm.fee_per_year) : null,
          description: courseForm.description || null,
          is_active: true
        };

        console.log('Cleaned data:', cleanedData);
        const result = await academicsAPI.updateCourse(courseForm.id, cleanedData);
        console.log('Update result:', result);
        setSuccess('Course updated successfully!');
      } else {
        console.log('Adding new course');

        // Clean up form data for new course
        const cleanedData = {
          course_name: courseForm.course_name,
          course_code: courseForm.course_code,
          department_id: courseForm.department_id || null,
          duration_years: courseForm.duration_years ? parseInt(courseForm.duration_years) : null,
          total_seats: courseForm.total_seats ? parseInt(courseForm.total_seats) : null,
          eligibility: courseForm.eligibility || null,
          fee_per_year: courseForm.fee_per_year ? parseFloat(courseForm.fee_per_year) : null,
          description: courseForm.description || null
        };

        console.log('Cleaned data:', cleanedData);
        const result = await academicsAPI.addCourse(cleanedData);
        console.log('Add result:', result);
        setSuccess('Course added successfully!');
      }

      resetCourseForm();
      loadCourses();
    } catch (error) {
      console.error('Course submit error:', error);
      setError(error.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setCourseForm({
      id: course.id,
      course_name: course.course_name,
      course_code: course.course_code,
      department_id: course.department_id || '',
      duration_years: course.duration_years || '',
      total_seats: course.total_seats || '',
      eligibility: course.eligibility || '',
      fee_per_year: course.fee_per_year || '',
      description: course.description || ''
    });
    setCourseEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      setLoading(true);
      await academicsAPI.deleteCourse(id);
      setSuccess('Course deleted successfully!');
      loadCourses();
    } catch (error) {
      setError('Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      id: null,
      course_name: '',
      course_code: '',
      department_id: '',
      duration_years: '',
      total_seats: '',
      eligibility: '',
      fee_per_year: '',
      description: ''
    });
    setCourseEditMode(false);
  };

  // Anti-Ragging Functions
  const loadAntiRaggingPolicy = async () => {
    try {
      setLoading(true);
      const response = await academicsAPI.getAntiRaggingPolicy();
      if (response.success && response.data) {
        setAntiRaggingPolicy(response.data.policy_content || '');
      }
    } catch (error) {
      console.error('Error loading anti-ragging policy:', error);
      setError('Failed to load anti-ragging policy');
    } finally {
      setLoading(false);
    }
  };

  const saveAntiRaggingPolicy = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await academicsAPI.updateAntiRaggingPolicy({
        policy_content: antiRaggingPolicy,
        acts_list: [],
        helpline_number: '1800-XXX-XXXX',
        helpline_email: 'antiragging@forte.edu.in'
      });

      setSuccess('Anti-ragging policy updated successfully!');
    } catch (error) {
      console.error('Error saving anti-ragging policy:', error);
      setError(error.message || 'Failed to save anti-ragging policy');
    } finally {
      setLoading(false);
    }
  };

  // Grievance Functions
  const loadGrievances = async () => {
    try {
      setLoading(true);
      const response = await academicsAPI.getGrievances();
      if (response.success) {
        setGrievances(response.data || []);
      }
    } catch (error) {
      console.error('Error loading grievances:', error);
      setError('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGrievanceStatus = async (id, status) => {
    try {
      await academicsAPI.updateGrievance(id, { status });
      setSuccess(`Grievance marked as ${status}`);
      loadGrievances();
    } catch (error) {
      setError('Failed to update grievance status');
    }
  };

  const handleDeleteGrievance = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grievance?')) return;

    try {
      await academicsAPI.deleteGrievance(id);
      setSuccess('Grievance deleted successfully!');
      loadGrievances();
    } catch (error) {
      setError('Failed to delete grievance');
    }
  };

  // Faculty Functions
  const loadFaculty = async () => {
    try {
      setLoading(true);
      const response = await academicsAPI.getFaculty();
      if (response.success) {
        setFaculty(response.data || []);
      }
    } catch (error) {
      console.error('Error loading faculty:', error);
      setError('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const cleanedData = {
        full_name: facultyForm.full_name,
        designation: facultyForm.designation || null,
        department_id: facultyForm.department_id || null,
        qualification: facultyForm.qualification || null,
        specialization: facultyForm.specialization || null,
        email: facultyForm.email || null,
        phone: facultyForm.phone || null,
        experience_years: facultyForm.experience_years ? parseInt(facultyForm.experience_years) : null,
        photo_url: facultyForm.photo_url || null,
        bio: facultyForm.bio || null
      };

      if (facultyForm.id) {
        await academicsAPI.updateFaculty(facultyForm.id, cleanedData);
        setSuccess('Faculty member updated successfully!');
      } else {
        await academicsAPI.addFaculty(cleanedData);
        setSuccess('Faculty member added successfully!');
      }

      resetFacultyForm();
      loadFaculty();
    } catch (error) {
      console.error('Faculty submit error:', error);
      setError(error.message || 'Failed to save faculty member');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFaculty = (member) => {
    setFacultyForm({
      id: member.id,
      full_name: member.full_name || '',
      designation: member.designation || '',
      department_id: member.department_id || '',
      qualification: member.qualification || '',
      specialization: member.specialization || '',
      email: member.email || '',
      phone: member.phone || '',
      experience_years: member.experience_years || '',
      photo_url: member.photo_url || '',
      bio: member.bio || ''
    });
    // Set photo preview if exists
    if (member.photo_url) {
      const fullUrl = member.photo_url.startsWith('http')
        ? member.photo_url
        : `${API_CONFIG.API_URL.replace('/api', '')}/${member.photo_url.replace(/^\//, '')}`;
      setFacultyPhotoPreview(fullUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      setLoading(true);
      await academicsAPI.deleteFaculty(id);
      setSuccess('Faculty member deleted successfully!');
      loadFaculty();
    } catch (error) {
      setError('Failed to delete faculty member');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should not exceed 5MB');
      return;
    }

    try {
      setFacultyPhotoUploading(true);
      setError('');

      // Create form data
      const formData = new FormData();
      formData.append('image', file);

      // Upload faculty photo (fallback to general image endpoint)
      const response = await fetch(`${API_CONFIG.API_URL}/upload/image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      const data = await response.json();

      console.log('✅ Upload response:', data);

      if (data.success) {
        // Handle different possible response formats
        const uploadedUrl = data.imageUrl || data.fileUrl || data.file_url || data.url || data.path;

        if (!uploadedUrl) {
          console.error('❌ No file URL in response:', data);
          setError('Upload succeeded but no file URL returned');
          return;
        }

        console.log('📸 Uploaded URL:', uploadedUrl);

        setFacultyForm(prev => ({ ...prev, photo_url: uploadedUrl }));

        // Set preview
        const fullUrl = uploadedUrl.startsWith('http')
          ? uploadedUrl
          : `${API_CONFIG.API_URL.replace('/api', '')}/${uploadedUrl.replace(/^\//, '')}`;

        console.log('🖼️ Preview URL:', fullUrl);

        setFacultyPhotoPreview(fullUrl);
        setSuccess('Photo uploaded successfully!');
      } else {
        setError(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setFacultyPhotoUploading(false);
    }
  };

  const resetFacultyForm = () => {
    setFacultyForm({
      id: null,
      full_name: '',
      designation: '',
      department_id: '',
      qualification: '',
      specialization: '',
      email: '',
      phone: '',
      experience_years: '',
      photo_url: '',
      bio: ''
    });
    setFacultyPhotoPreview('');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-slate mb-2">Manage Academics</h1>
        <p className="text-sm text-gray-600">Manage programs, departments, courses, anti-ragging policy, grievances, and faculty</p>
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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('programs')}
            className={`pb-3 px-1 font-semibold border-b-2 transition ${
              activeTab === 'programs'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-graduation-cap mr-2"></i>
            Programs Offered
          </button>
          <button
            onClick={() => {
              setActiveTab('departments');
              resetDepartmentForm();
              resetCourseForm();
            }}
            className={`pb-3 px-1 font-semibold border-b-2 transition ${
              activeTab === 'departments'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-building mr-2"></i>
            Departments
          </button>
          <button
            onClick={() => {
              setActiveTab('courses');
              resetDepartmentForm();
              resetCourseForm();
            }}
            className={`pb-3 px-1 font-semibold border-b-2 transition ${
              activeTab === 'courses'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-book mr-2"></i>
            Courses
          </button>
          <button
            onClick={() => setActiveTab('anti-ragging')}
            className={`pb-3 px-1 font-semibold border-b-2 transition ${
              activeTab === 'anti-ragging'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-shield-alt mr-2"></i>
            Anti-Ragging
          </button>
          <button
            onClick={() => setActiveTab('grievance')}
            className={`pb-3 px-1 font-semibold border-b-2 transition ${
              activeTab === 'grievance'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-comment-dots mr-2"></i>
            Grievances
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`pb-3 px-1 font-semibold border-b-2 transition ${
              activeTab === 'faculty'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-user-tie mr-2"></i>
            Faculty & Staff
          </button>
        </div>
      </div>

      {/* Programs Offered Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-6">
          {/* Programs List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-slate mb-4">All Programs by Department</h3>

            {departments.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-info-circle text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">No departments found. Add departments first to see programs.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {departments.map((dept) => {
                  const deptCourses = courses.filter(c => c.department_id === dept.id);
                  return (
                    <div key={dept.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-crimson/10 rounded-lg flex items-center justify-center">
                            <i className="fas fa-building text-crimson"></i>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate">{dept.department_name}</h3>
                            <p className="text-xs text-gray-500">{dept.department_code}</p>
                          </div>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {deptCourses.length} Programs
                        </span>
                      </div>

                      {deptCourses.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No courses added for this department yet.</p>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                          {deptCourses.map((course) => (
                            <div key={course.id} className="bg-gray-50 p-3 rounded border border-gray-200 hover:shadow-md transition group relative">
                              {/* Edit/Delete buttons - shown on hover */}
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    handleEditCourse(course);
                                    setActiveTab('courses');
                                  }}
                                  className="bg-white hover:bg-blue-50 text-blue-600 p-1.5 rounded shadow-sm border border-blue-200"
                                  title="Edit Course"
                                >
                                  <i className="fas fa-edit text-xs"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="bg-white hover:bg-red-50 text-red-600 p-1.5 rounded shadow-sm border border-red-200"
                                  title="Delete Course"
                                >
                                  <i className="fas fa-trash text-xs"></i>
                                </button>
                              </div>

                              <div className="flex justify-between items-start mb-1 pr-12">
                                <span className="bg-crimson/10 text-crimson px-2 py-0.5 text-xs font-bold rounded">
                                  {course.course_code}
                                </span>
                                {course.duration_years && (
                                  <span className="text-xs text-gray-500">{course.duration_years} Years</span>
                                )}
                              </div>
                              <h4 className="font-semibold text-sm text-slate mt-2">{course.course_name}</h4>
                              {course.description && (
                                <div
                                  className="text-xs text-gray-600 mt-1 line-clamp-2 prose prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{ __html: course.description }}
                                />
                              )}

                              {/* Additional Info */}
                              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                                {course.total_seats && (
                                  <div className="flex items-center gap-1">
                                    <i className="fas fa-users text-blue-500 w-3"></i>
                                    <span>{course.total_seats} Seats</span>
                                  </div>
                                )}
                                {course.fee_per_year && (
                                  <div className="flex items-center gap-1">
                                    <i className="fas fa-rupee-sign text-green-500 w-3"></i>
                                    <span>₹{parseFloat(course.fee_per_year).toLocaleString()}/year</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">How it works:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Add departments in the <strong>Departments</strong> tab</li>
                    <li>• Add courses in the <strong>Courses</strong> tab and assign them to departments</li>
                    <li>• Programs will automatically appear grouped by departments on the frontend</li>
                    <li>• <strong>Quick Edit:</strong> Hover over any program card to edit or delete it directly</li>
                    <li>• Frontend "Programs Offered" tab shows this same organization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {/* Add/Edit Department Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {departmentEditMode ? 'Edit Department' : 'Add New Department'}
            </h2>

            <form onSubmit={handleDepartmentSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={departmentForm.department_name}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, department_name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={departmentForm.department_code}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, department_code: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., CS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Head of Department
                  </label>
                  <input
                    type="text"
                    value={departmentForm.head_of_department}
                    onChange={(e) => setDepartmentForm(prev => ({ ...prev, head_of_department: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Dr. John Doe"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={departmentForm.description}
                    onChange={(value) => setDepartmentForm(prev => ({ ...prev, description: value }))}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Brief description of the department..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                  {departmentEditMode ? 'Update Department' : 'Add Department'}
                </button>

                {departmentEditMode && (
                  <button
                    type="button"
                    onClick={resetDepartmentForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Departments List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">All Departments ({departments.length})</h2>

            {loading && departments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Loading departments...</p>
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-folder-open text-4xl mb-2"></i>
                <p>No departments found. Add your first department above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate">{dept.department_name}</h3>
                        <p className="text-sm text-gray-600">Code: {dept.department_code}</p>
                        {dept.head_of_department && (
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-user mr-1"></i>
                            HOD: {dept.head_of_department}
                          </p>
                        )}
                        {dept.description && (
                          <div
                            className="text-sm text-gray-500 mt-2 prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: dept.description }}
                          />
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDepartment(dept)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
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
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Add/Edit Course Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {courseEditMode ? 'Edit Course' : 'Add New Course'}
            </h2>

            <form onSubmit={handleCourseSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.course_name}
                    onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Bachelor of Computer Applications"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.course_code}
                    onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., BCA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={courseForm.department_id}
                    onChange={(e) => setCourseForm({ ...courseForm, department_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    value={courseForm.duration_years}
                    onChange={(e) => setCourseForm({ ...courseForm, duration_years: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Seats
                  </label>
                  <input
                    type="number"
                    value={courseForm.total_seats}
                    onChange={(e) => setCourseForm({ ...courseForm, total_seats: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., 120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fee Per Year (₹)
                  </label>
                  <input
                    type="number"
                    value={courseForm.fee_per_year}
                    onChange={(e) => setCourseForm({ ...courseForm, fee_per_year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., 50000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Eligibility
                  </label>
                  <input
                    type="text"
                    value={courseForm.eligibility}
                    onChange={(e) => setCourseForm({ ...courseForm, eligibility: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., 10+2 with Mathematics"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={courseForm.description}
                    onChange={(value) => setCourseForm({ ...courseForm, description: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Brief description of the course..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                  {courseEditMode ? 'Update Course' : 'Add Course'}
                </button>

                {courseEditMode && (
                  <button
                    type="button"
                    onClick={resetCourseForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Courses List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">All Courses ({courses.length})</h2>

            {loading && courses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-book-open text-4xl mb-2"></i>
                <p>No courses found. Add your first course above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate">{course.course_name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-600">
                          <div>
                            <i className="fas fa-tag mr-1"></i>
                            Code: {course.course_code}
                          </div>
                          {course.department_name && (
                            <div>
                              <i className="fas fa-building mr-1"></i>
                              {course.department_name}
                            </div>
                          )}
                          {course.duration_years && (
                            <div>
                              <i className="fas fa-clock mr-1"></i>
                              {course.duration_years} Years
                            </div>
                          )}
                          {course.total_seats && (
                            <div>
                              <i className="fas fa-users mr-1"></i>
                              {course.total_seats} Seats
                            </div>
                          )}
                        </div>
                        {course.eligibility && (
                          <p className="text-sm text-gray-600 mt-2">
                            <i className="fas fa-check-circle mr-1"></i>
                            Eligibility: {course.eligibility}
                          </p>
                        )}
                        {course.fee_per_year && (
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-rupee-sign mr-1"></i>
                            Fee: ₹{parseFloat(course.fee_per_year).toLocaleString()} per year
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
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
        </div>
      )}

      {/* Anti-Ragging Tab */}
      {activeTab === 'anti-ragging' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-slate mb-4">Manage Anti-Ragging Policy</h2>
          <p className="text-sm text-gray-600 mb-4">
            Update the anti-ragging policy content displayed on the Academics page.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Policy Content
            </label>
            <ReactQuill
              theme="snow"
              value={antiRaggingPolicy}
              onChange={(value) => setAntiRaggingPolicy(value)}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Enter anti-ragging policy content..."
              style={{ minHeight: '300px' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              This content will be displayed in the Anti-Ragging section of the Academics page.
            </p>
          </div>

          <button
            onClick={saveAntiRaggingPolicy}
            className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition"
          >
            <i className="fas fa-save mr-2"></i>
            Save Policy
          </button>
        </div>
      )}

      {/* Grievance Tab */}
      {activeTab === 'grievance' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-slate mb-4">Student Grievances ({grievances.length})</h2>
          <p className="text-sm text-gray-600 mb-6">
            View and manage student grievances submitted through the website.
          </p>

          {grievances.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No grievances submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grievances.map((grievance) => (
                <div key={grievance.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate">{grievance.student_name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          ID: {grievance.student_id}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span><i className="fas fa-envelope mr-1"></i>{grievance.email}</span>
                        {grievance.phone && <span><i className="fas fa-phone mr-1"></i>{grievance.phone}</span>}
                        {grievance.department_name && (
                          <span><i className="fas fa-building mr-1"></i>{grievance.department_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {new Date(grievance.created_at).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        grievance.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        grievance.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {grievance.status || 'pending'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{grievance.grievance_description}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleUpdateGrievanceStatus(grievance.id, 'in_progress')}
                      className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded transition"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateGrievanceStatus(grievance.id, 'resolved')}
                      className="text-xs px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded transition"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleDeleteGrievance(grievance.id)}
                      className="text-xs px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded transition ml-auto"
                    >
                      <i className="fas fa-trash mr-1"></i>Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Faculty & Staff Tab */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {facultyForm.id ? 'Edit Faculty Member' : 'Add New Faculty Member'}
            </h2>

            <form onSubmit={handleFacultySubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyForm.full_name}
                    onChange={(e) => setFacultyForm({ ...facultyForm, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Dr. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={facultyForm.designation}
                    onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Professor / Associate Professor / Assistant Professor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={facultyForm.department_id}
                    onChange={(e) => setFacultyForm({ ...facultyForm, department_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={facultyForm.qualification}
                    onChange={(e) => setFacultyForm({ ...facultyForm, qualification: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Ph.D., M.Tech, B.Tech"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={facultyForm.specialization}
                    onChange={(e) => setFacultyForm({ ...facultyForm, specialization: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Machine Learning, Data Science, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={facultyForm.experience_years}
                    onChange={(e) => setFacultyForm({ ...facultyForm, experience_years: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="john.doe@forte.ac.in"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={facultyForm.phone}
                    onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="+91 98765-43210"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Faculty Photo
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFacultyPhotoUpload}
                        disabled={facultyPhotoUploading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-crimson file:text-white hover:file:bg-red-800 file:cursor-pointer disabled:opacity-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload faculty photo (JPG, PNG, GIF, WebP - Max 5MB)
                      </p>
                      {facultyPhotoUploading && (
                        <p className="text-sm text-blue-600 mt-2">
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Uploading photo...
                        </p>
                      )}
                    </div>
                    {facultyPhotoPreview && (
                      <div className="flex-shrink-0">
                        <img
                          src={facultyPhotoPreview}
                          alt="Faculty preview"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio / About
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={facultyForm.bio}
                    onChange={(value) => setFacultyForm({ ...facultyForm, bio: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Brief bio and achievements..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-50"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                  {facultyForm.id ? 'Update Faculty Member' : 'Add Faculty Member'}
                </button>

                {facultyForm.id && (
                  <button
                    type="button"
                    onClick={resetFacultyForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">All Faculty Members ({faculty.length})</h2>

            {loading && faculty.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Loading faculty...</p>
              </div>
            ) : faculty.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-user-tie text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">No faculty members added yet. Add your first faculty member above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {faculty.map((member) => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start gap-4">
                      {/* Faculty Photo Thumbnail */}
                      {member.photo_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={member.photo_url.startsWith('http')
                              ? member.photo_url
                              : `${API_CONFIG.API_URL.replace('/api', '')}/${member.photo_url.replace(/^\//, '')}`}
                            alt={member.full_name}
                            className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-slate text-lg">{member.full_name}</h3>
                        {member.designation && (
                          <p className="text-sm text-crimson font-semibold">{member.designation}</p>
                        )}
                        {member.department_name && (
                          <p className="text-xs text-gray-500">
                            <i className="fas fa-building mr-1"></i>
                            {member.department_name}
                          </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
                          {member.qualification && (
                            <div>
                              <i className="fas fa-graduation-cap mr-1"></i>
                              {member.qualification}
                            </div>
                          )}
                          {member.experience_years && (
                            <div>
                              <i className="fas fa-briefcase mr-1"></i>
                              {member.experience_years}+ Years
                            </div>
                          )}
                          {member.email && (
                            <div>
                              <i className="fas fa-envelope mr-1"></i>
                              {member.email}
                            </div>
                          )}
                        </div>
                        {member.specialization && (
                          <p className="text-xs text-gray-600 mt-2">
                            <i className="fas fa-star mr-1 text-orange-500"></i>
                            <strong>Specialization:</strong> {member.specialization}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditFaculty(member)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteFaculty(member.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
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
        </div>
      )}
    </div>
  );
};

export default ManageAcademicsPage;
