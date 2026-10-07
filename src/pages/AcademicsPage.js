import React, { useState, useEffect } from 'react';
import Banner from '../components/common/Banner';
import API_CONFIG from '../config/api.config';

const API_URL = API_CONFIG.API_URL;

const AcademicsPage = () => {
  const [activeSection, setActiveSection] = useState('courses');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [antiRaggingPolicy, setAntiRaggingPolicy] = useState(null);
  const [antiRaggingLoading, setAntiRaggingLoading] = useState(false);

  // Grievance Form State
  const [grievanceForm, setGrievanceForm] = useState({
    student_name: '',
    student_id: '',
    email: '',
    phone: '',
    department_id: '',
    grievance_description: ''
  });
  const [grievanceSubmitting, setGrievanceSubmitting] = useState(false);
  const [grievanceSuccess, setGrievanceSuccess] = useState('');
  const [grievanceError, setGrievanceError] = useState('');

  useEffect(() => {
    loadAcademicsData();
  }, []);

  useEffect(() => {
    if (activeSection === 'faculty-staff') {
      loadFacultyData();
    } else if (activeSection === 'anti-ragging') {
      loadAntiRaggingPolicy();
    }
  }, [activeSection]);

  const loadAcademicsData = async () => {
    try {
      setLoading(true);

      // Fetch departments and courses from backend
      const [deptResponse, coursesResponse] = await Promise.all([
        fetch(`${API_URL}/academics/departments`),
        fetch(`${API_URL}/academics/courses`)
      ]);

      const deptData = await deptResponse.json();
      const coursesData = await coursesResponse.json();

      if (deptData.success && coursesData.success) {
        // Transform backend data to frontend format
        const transformedDepartments = deptData.data.map((dept, index) => {
          // Get courses for this department
          const deptCourses = coursesData.data
            .filter(course => course.department_id === dept.id)
            .map(course => ({
              code: course.course_code,
              name: course.course_name,
              duration: course.duration_years ? `${course.duration_years} Years` : 'N/A',
              description: course.description || '',
              eligibility: course.eligibility,
              fee: course.fee_per_year,
              seats: course.total_seats
            }));

          // Assign icon and color based on department name or use defaults
          const iconColorMap = getDepartmentStyle(dept.department_name, index);

          return {
            id: dept.id,
            name: dept.department_name,
            code: dept.department_code,
            icon: iconColorMap.icon,
            color: iconColorMap.color,
            affiliation: dept.affiliation || null,
            programs: deptCourses,
            description: dept.description || null,
            facilities: dept.facilities || [],
            headOfDepartment: dept.head_of_department
          };
        });

        setDepartments(transformedDepartments);
      }
    } catch (error) {
      console.error('Error loading academics data:', error);
      // Keep empty departments array on error
    } finally {
      setLoading(false);
    }
  };

  const loadFacultyData = async () => {
    try {
      setFacultyLoading(true);
      const response = await fetch(`${API_URL}/academics/faculty`);
      const data = await response.json();

      if (data.success) {
        setFaculty(data.data);
      }
    } catch (error) {
      console.error('Error loading faculty data:', error);
      setFaculty([]);
    } finally {
      setFacultyLoading(false);
    }
  };

  const loadAntiRaggingPolicy = async () => {
    try {
      setAntiRaggingLoading(true);
      const response = await fetch(`${API_URL}/academics/anti-ragging`);
      const data = await response.json();

      if (data.success && data.data) {
        setAntiRaggingPolicy(data.data);
      } else {
        setAntiRaggingPolicy(null);
      }
    } catch (error) {
      console.error('Error loading anti-ragging policy:', error);
      setAntiRaggingPolicy(null);
    } finally {
      setAntiRaggingLoading(false);
    }
  };

  // Helper function to construct full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    // If already a full URL (starts with http), return as-is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Otherwise construct full URL
    const baseUrl = API_URL.replace('/api', '');
    // Remove leading slash from imageUrl if present to avoid double slashes
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    return `${baseUrl}/${cleanPath}`;
  };

  // Handle Grievance Form Submission
  const handleGrievanceSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setGrievanceSuccess('');
    setGrievanceError('');

    // Validation
    if (!grievanceForm.student_name || !grievanceForm.student_id || !grievanceForm.email || !grievanceForm.grievance_description) {
      setGrievanceError('Please fill in all required fields (Name, Student ID, Email, and Grievance Description)');
      return;
    }

    try {
      setGrievanceSubmitting(true);

      const response = await fetch(`${API_URL}/academics/grievances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(grievanceForm)
      });

      const data = await response.json();

      if (data.success) {
        setGrievanceSuccess('Your grievance has been submitted successfully. Our team will review it and contact you soon.');
        // Reset form
        setGrievanceForm({
          student_name: '',
          student_id: '',
          email: '',
          phone: '',
          department_id: '',
          grievance_description: ''
        });
      } else {
        setGrievanceError(data.message || 'Failed to submit grievance. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting grievance:', error);
      setGrievanceError('An error occurred while submitting your grievance. Please try again later.');
    } finally {
      setGrievanceSubmitting(false);
    }
  };

  // Helper function to assign icons based on department name
  const getDepartmentStyle = (deptName, index) => {
    const name = deptName.toLowerCase();

    if (name.includes('commerce')) {
      return { icon: 'fas fa-chart-line', color: 'crimson' };
    } else if (name.includes('business') || name.includes('management')) {
      return { icon: 'fas fa-briefcase', color: 'crimson' };
    } else if (name.includes('computer') || name.includes('it') || name.includes('technology')) {
      return { icon: 'fas fa-laptop-code', color: 'crimson' };
    } else if (name.includes('science')) {
      return { icon: 'fas fa-atom', color: 'crimson' };
    } else if (name.includes('arts') || name.includes('humanities')) {
      return { icon: 'fas fa-book-open', color: 'crimson' };
    } else if (name.includes('education') || name.includes('teacher')) {
      return { icon: 'fas fa-chalkboard-teacher', color: 'crimson' };
    } else if (name.includes('engineering')) {
      return { icon: 'fas fa-cogs', color: 'crimson' };
    } else if (name.includes('medical') || name.includes('health')) {
      return { icon: 'fas fa-heartbeat', color: 'crimson' };
    } else {
      // Default icon and color
      return { icon: 'fas fa-graduation-cap', color: 'crimson' };
    }
  };

  const getColorClasses = (color) => {
    // Only use crimson color scheme
    return {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-crimson',
      badge: 'bg-crimson/10 text-crimson'
    };
  };

  const renderCoursesSection = () => (
    <div className="space-y-8">

      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading programs...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-info-circle text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">No programs available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {departments.map((dept) => {
          const colors = getColorClasses(dept.color);
          return (
            <div key={dept.id} className="bg-white rounded-xl border border-border_gray overflow-hidden">
              <div className={`${colors.bg} ${colors.border} border-b p-4 sm:p-6`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${colors.badge} rounded-xl flex items-center justify-center`}>
                    <i className={`${dept.icon} text-lg`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate">{dept.name}</h3>
                    <p className="text-gray-500 text-xs">{dept.programs.length} Program(s)</p>
                    {dept.affiliation && (
                      <p className="text-xs text-gray-400 mt-1"><i className="fas fa-university mr-1"></i>{dept.affiliation}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dept.programs.map((program, index) => (
                    <div key={index} className="p-4 bg-surface rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`${colors.badge} px-2 py-1 text-xs font-bold rounded`}>{program.code}</span>
                        <span className="text-xs text-gray-500">{program.duration}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-slate mb-1">{program.name}</h4>
                      {program.description && (
                        <div
                          className="text-sm text-gray-500 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: program.description }}
                        />
                      )}
                      {program.affiliation && (
                        <p className="text-xs text-crimson mt-2"><i className="fas fa-certificate mr-1"></i>{program.affiliation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );

  const renderDepartmentsSection = () => (
    <div className="space-y-8">

      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading departments...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-info-circle text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">No departments available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {departments.map((dept) => {
          const colors = getColorClasses(dept.color);
          return (
            <div key={dept.id} className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 ${colors.badge} rounded-xl flex items-center justify-center`}>
                  <i className={`${dept.icon} text-lg`}></i>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-crimson">{dept.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {dept.programs.map((program, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs rounded">{program.code}</span>
                    ))}
                  </div>
                </div>
              </div>
              {dept.description && (
                <div
                  className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: dept.description }}
                />
              )}

              {dept.facilities && dept.facilities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate mb-3">Facilities:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    {dept.facilities.map((facility, index) => (
                      <div key={index} className="bg-surface px-3 py-2 rounded border border-gray-200 text-sm text-gray-700">
                        <i className="fas fa-check-circle text-crimson mr-2"></i>
                        {facility}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}
    </div>
  );

  const renderCoursesListSection = () => {
    // Flatten all courses from all departments
    const allCourses = departments.flatMap(dept =>
      dept.programs.map(course => ({
        ...course,
        departmentName: dept.name,
        departmentCode: dept.code,
        departmentColor: dept.color
      }))
    );

    return (
      <div className="space-y-8">

        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : allCourses.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-info-circle text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">No courses available at the moment.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map((course, index) => {
              const colors = getColorClasses(course.departmentColor);
              return (
                <div key={index} className="bg-white rounded-xl border border-border_gray p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`${colors.badge} px-3 py-1 text-xs font-bold rounded-full`}>
                      {course.code}
                    </span>
                    {course.duration && (
                      <span className="text-xs text-gray-500">
                        <i className="fas fa-clock mr-1"></i>
                        {course.duration}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate mb-2">{course.name}</h3>

                  <p className="text-xs text-gray-500 mb-3">
                    <i className="fas fa-building mr-1"></i>
                    {course.departmentName}
                  </p>

                  {course.description && (
                    <div
                      className="text-sm text-gray-600 mb-3 line-clamp-2 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: course.description }}
                    />
                  )}

                  {course.eligibility && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-500">Eligibility:</span> {course.eligibility}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
                    {course.seats && (
                      <div>
                        <i className="fas fa-users mr-1 text-crimson"></i>
                        {course.seats} Seats
                      </div>
                    )}
                    {course.fee && (
                      <div>
                        <i className="fas fa-rupee-sign mr-1 text-crimson"></i>
                        ₹{parseFloat(course.fee).toLocaleString()}/year
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderAntiRaggingSection = () => {
    // Parse acts_list from JSON if it exists
    let actsList = [];
    if (antiRaggingPolicy?.acts_list) {
      try {
        actsList = typeof antiRaggingPolicy.acts_list === 'string'
          ? JSON.parse(antiRaggingPolicy.acts_list)
          : antiRaggingPolicy.acts_list;
      } catch (error) {
        console.error('Error parsing acts_list:', error);
        actsList = [];
      }
    }

    return (
      <div className="space-y-8">

        {/* Loading State */}
        {antiRaggingLoading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
            <p className="text-gray-600">Loading anti-ragging policy...</p>
          </div>
        ) : !antiRaggingPolicy ? (
          /* Empty State */
          <div className="text-center py-12 bg-white rounded-xl border border-border_gray">
            <i className="fas fa-shield-alt text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-600 text-lg font-semibold mb-2">No Anti-Ragging Policy Available</p>
            <p className="text-gray-500 text-sm">Policy content will be displayed here once added.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Policy Content */}
            {antiRaggingPolicy.policy_content && (
              <div className="bg-white p-6 rounded-xl border border-border_gray">
                <h3 className="text-lg font-bold text-crimson mb-4">
                  <i className="fas fa-file-alt mr-2"></i>
                  Policy Statement
                </h3>
                <div
                  className="text-gray-700 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: antiRaggingPolicy.policy_content }}
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Acts that Constitute Ragging */}
              {actsList.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-border_gray">
                  <h3 className="text-base font-bold text-crimson mb-4">Acts that Constitute Ragging</h3>
                  <ul className="space-y-3">
                    {actsList.map((act, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-600 text-sm">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Helpline Information */}
              {(antiRaggingPolicy.helpline_number || antiRaggingPolicy.helpline_email) && (
                <div className="bg-white p-6 rounded-xl border border-border_gray">
                  <h3 className="text-base font-bold text-crimson mb-4">Anti-Ragging Squad</h3>

                  {/* Helpline Box */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center text-slate mb-2">
                      <i className="fas fa-shield-alt text-crimson mr-2"></i>
                      <span className="font-semibold">24/7 Anti-Ragging Helpline</span>
                    </div>

                    {antiRaggingPolicy.helpline_number && (
                      <p className="text-gray-700 text-sm mb-1">
                        <i className="fas fa-phone mr-2"></i>
                        <strong>Phone:</strong> {antiRaggingPolicy.helpline_number}
                      </p>
                    )}

                    {antiRaggingPolicy.helpline_email && (
                      <p className="text-gray-700 text-sm mb-2">
                        <i className="fas fa-envelope mr-2"></i>
                        <strong>Email:</strong> {antiRaggingPolicy.helpline_email}
                      </p>
                    )}

                    <p className="text-gray-700 text-sm mt-2">
                      Students can report any incidents confidentially through our dedicated helpline.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGrievanceSection = () => (
    <div className="space-y-8">

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-border_gray">
        <h3 className="text-lg font-bold text-crimson mb-6">Grievance Registration Form</h3>

        {/* Success Message */}
        {grievanceSuccess && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
            <p className="text-slate">
              <i className="fas fa-check-circle mr-2 text-crimson"></i>
              {grievanceSuccess}
            </p>
          </div>
        )}

        {/* Error Message */}
        {grievanceError && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
            <p className="text-slate">
              <i className="fas fa-exclamation-circle mr-2 text-crimson"></i>
              {grievanceError}
            </p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleGrievanceSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={grievanceForm.student_name}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, student_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID *</label>
              <input
                type="text"
                required
                value={grievanceForm.student_id}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, student_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
                placeholder="Enter student ID"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={grievanceForm.email}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={grievanceForm.phone}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
            <select
              value={grievanceForm.department_id}
              onChange={(e) => setGrievanceForm({ ...grievanceForm, department_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grievance Description * (Max 3000 characters)</label>
            <textarea
              required
              rows="6"
              value={grievanceForm.grievance_description}
              onChange={(e) => setGrievanceForm({ ...grievanceForm, grievance_description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
              placeholder="Please describe your grievance in detail..."
              maxLength="3000"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              {grievanceForm.grievance_description.length}/3000 characters
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={grievanceSubmitting}
              className="bg-crimson hover:bg-red-800 text-white font-bold py-3 px-8 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {grievanceSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Submitting...
                </>
              ) : (
                'Submit Grievance'
              )}
            </button>
            <button
              type="reset"
              onClick={() => setGrievanceForm({
                student_name: '',
                student_id: '',
                email: '',
                phone: '',
                department_id: '',
                grievance_description: ''
              })}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg transition"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFacultyStaffSection = () => {
    // Filter faculty based on search and department
    const filteredFaculty = faculty.filter(member => {
      const matchesSearch = searchQuery === '' ||
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.designation && member.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.specialization && member.specialization.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDepartment = selectedDepartment === 'all' ||
        member.department_id === parseInt(selectedDepartment);

      return matchesSearch && matchesDepartment && member.is_active;
    });

    // Group faculty by department
    const facultyByDepartment = {};
    filteredFaculty.forEach(member => {
      const deptId = member.department_id || 'unassigned';
      if (!facultyByDepartment[deptId]) {
        facultyByDepartment[deptId] = [];
      }
      facultyByDepartment[deptId].push(member);
    });

    return (
      <div className="space-y-8">

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by name, designation, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none"
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <i className="fas fa-filter absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-crimson outline-none appearance-none bg-white"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>

          {/* Results Count */}
          {!facultyLoading && (
            <div className="mt-4 text-sm text-gray-600">
              <i className="fas fa-users mr-2"></i>
              Showing {filteredFaculty.length} faculty member{filteredFaculty.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Loading State */}
        {facultyLoading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
            <p className="text-gray-600">Loading faculty information...</p>
          </div>
        ) : filteredFaculty.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 bg-white rounded-xl border border-border_gray">
            <i className="fas fa-user-slash text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-600 text-lg font-semibold mb-2">No Faculty Members Found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            {/* Faculty by Department */}
            {departments.map((dept) => {
              const deptFaculty = facultyByDepartment[dept.id] || [];
              if (deptFaculty.length === 0) return null;

              const colors = getColorClasses(dept.color);

              return (
                <div key={dept.id} className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray">
                  {/* Department Header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className={`w-10 h-10 ${colors.badge} rounded-lg flex items-center justify-center`}>
                      <i className={`${dept.icon} text-lg`}></i>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate">{dept.name}</h3>
                      <p className="text-xs text-gray-500">{deptFaculty.length} Faculty Member{deptFaculty.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Faculty Cards Grid */}
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deptFaculty.map((member) => (
                      <div key={member.id} className="bg-surface rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        {/* Faculty Photo */}
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-[4/3] flex items-center justify-center relative overflow-hidden">
                          {member.photo_url ? (
                            <img
                              src={getImageUrl(member.photo_url)}
                              alt={member.full_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Failed to load faculty photo:', member.photo_url);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`${member.photo_url ? 'hidden' : 'flex'} flex-col items-center justify-center w-full h-full`}>
                            <i className="fas fa-user-tie text-6xl text-gray-400 mb-2"></i>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">No Photo</p>
                          </div>
                        </div>

                        {/* Faculty Info */}
                        <div className="p-4">
                          {/* Name & Designation */}
                          <h4 className="font-bold text-base text-slate mb-1 line-clamp-2">{member.full_name}</h4>
                          {member.designation && (
                            <p className="text-xs text-crimson font-semibold mb-2">{member.designation}</p>
                          )}

                          {/* Qualification */}
                          {member.qualification && (
                            <div className="flex items-start gap-2 mb-2">
                              <i className="fas fa-graduation-cap text-crimson mt-1 text-xs"></i>
                              <p className="text-xs text-gray-600 line-clamp-2">{member.qualification}</p>
                            </div>
                          )}

                          {/* Specialization */}
                          {member.specialization && (
                            <div className="flex items-start gap-2 mb-3">
                              <i className="fas fa-star text-crimson mt-1 text-xs"></i>
                              <p className="text-xs text-gray-600 line-clamp-2">{member.specialization}</p>
                            </div>
                          )}

                          {/* Experience Badge */}
                          {member.experience_years && (
                            <div className="mb-3">
                              <span className="bg-crimson/10 text-crimson px-3 py-1 text-xs font-semibold rounded-full">
                                <i className="fas fa-briefcase mr-1"></i>
                                {member.experience_years}+ Years Experience
                              </span>
                            </div>
                          )}

                          {/* Contact Info */}
                          <div className="pt-3 border-t border-gray-200 space-y-2">
                            {member.email && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <i className="fas fa-envelope text-gray-400 w-4"></i>
                                <a href={`mailto:${member.email}`} className="hover:text-crimson truncate">
                                  {member.email}
                                </a>
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <i className="fas fa-phone text-gray-400 w-4"></i>
                                <a href={`tel:${member.phone}`} className="hover:text-crimson">
                                  {member.phone}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Bio (if exists) */}
                          {member.bio && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div
                                className="text-xs text-gray-600 line-clamp-3 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: member.bio }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  };

  const sections = [
    { id: 'courses', label: 'Courses', component: renderCoursesListSection },
    // COMMENTED OUT - Grievance section removed temporarily (will be used later)
    // { id: 'grievance', label: 'Grievance', component: renderGrievanceSection },
    { id: 'faculty-staff', label: 'Faculty & Staff', component: renderFacultyStaffSection }
  ];

  return (
    <div className="h-full w-full  fade-in">
      <Banner
        title="Academics"
        subtitle="Quality Education | Diverse Programs | Building Future Leaders"
        imageSrc="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10">

        {/* Section Navigation */}
        <div className="mb-6 sm:mb-8 border-b border-gray-200">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-3 sm:py-4 px-1 sm:px-2 border-b-2 text-sm sm:text-base font-semibold whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'border-crimson text-crimson'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Section Content */}
        {sections.find(section => section.id === activeSection)?.component()}

      </div>
    </div>
  );
};

export default AcademicsPage;
