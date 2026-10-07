import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { homeAPI, admissionAPI, contactAPI, academicsAPI, placementsAPI } from '../../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Updated
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    // Home Page Data
    hero: null,
    statistics: [],
    featuredPrograms: [],
    announcements: [],
    testimonials: [],

    // Enquiries & Contacts
    admissionEnquiries: [],
    contactSubmissions: [],

    // Academics Data
    departments: [],
    courses: [],

    // Placements Data
    placements: [],
    placementStats: null,

    // Counts
    totalAnnouncements: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    totalContacts: 0,
    totalDepartments: 0,
    totalCourses: 0,
    totalPlacements: 0,
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    // Check if user is admin
    if (parsedUser.role !== 'admin') {
      alert('Access Denied! This dashboard is only for administrators.');
      localStorage.removeItem('user');
      localStorage.removeItem('session_token');
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    loadAllDashboardData();
  }, [navigate]);

  const loadAllDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        homeData,
        admissionData,
        contactData,
        academicsData,
        placementsData,
        placementStatsData
      ] = await Promise.all([
        homeAPI.getComplete().catch(() => ({
          hero: null,
          stats: [],
          programs: [],
          announcements: [],
          testimonials: []
        })),
        admissionAPI.getEnquiries().catch(() => ({ data: [] })),
        contactAPI.getSubmissions().catch(() => ({ data: [] })),
        academicsAPI.getCourses().catch(() => ({ data: [] })),
        placementsAPI.getPlacements().catch(() => ({ data: [] })),
        placementsAPI.getStats().catch(() => null)
      ]);

      // Get departments
      const departmentsData = await academicsAPI.getDepartments().catch(() => ({ data: [] }));

      // Count new enquiries
      const newEnquiries = admissionData.data?.filter(e => e.status === 'new').length || 0;

      setDashboardData({
        // Home Page Data
        hero: homeData.hero,
        statistics: homeData.stats || [],
        featuredPrograms: homeData.programs || [],
        announcements: homeData.announcements || [],
        testimonials: homeData.testimonials || [],

        // Enquiries & Contacts
        admissionEnquiries: admissionData.data || [],
        contactSubmissions: contactData.data || [],

        // Academics Data
        departments: departmentsData.data || [],
        courses: academicsData.data || [],

        // Placements Data
        placements: placementsData.data || [],
        placementStats: placementStatsData,

        // Counts
        totalAnnouncements: homeData.announcements?.length || 0,
        totalEnquiries: admissionData.data?.length || 0,
        newEnquiries: newEnquiries,
        totalContacts: contactData.data?.length || 0,
        totalDepartments: departmentsData.data?.length || 0,
        totalCourses: academicsData.data?.length || 0,
        totalPlacements: placementsData.data?.length || 0,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-crimson to-slate rounded-2xl shadow-lg p-8 text-white">
        <h1 className="text-4xl font-serif font-bold mb-2">
          Welcome, {user.full_name || 'Admin'}!
        </h1>
        <p className="text-white/90 text-lg">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-white/80 mt-2">Manage your website content from this dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => navigate('/dashboard/admissions')}
          className="bg-white rounded-xl shadow-md border-l-4 border-red-500 p-6 hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Admission Enquiries</p>
              <p className="text-4xl font-bold text-slate mt-2">{loading ? '...' : dashboardData.totalEnquiries}</p>
              {dashboardData.newEnquiries > 0 && (
                <p className="text-sm text-red-600 font-semibold mt-1">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {dashboardData.newEnquiries} New
                </p>
              )}
            </div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-user-plus text-3xl text-red-600"></i>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/dashboard/contact')}
          className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 p-6 hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Contact Messages</p>
              <p className="text-4xl font-bold text-slate mt-2">{loading ? '...' : dashboardData.totalContacts}</p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-envelope text-3xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/dashboard/academics')}
          className="bg-white rounded-xl shadow-md border-l-4 border-green-500 p-6 hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Total Courses</p>
              <p className="text-4xl font-bold text-slate mt-2">{loading ? '...' : dashboardData.totalCourses}</p>
              <p className="text-sm text-gray-500 mt-1">{dashboardData.totalDepartments} Departments</p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-graduation-cap text-3xl text-green-600"></i>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/dashboard/placements')}
          className="bg-white rounded-xl shadow-md border-l-4 border-purple-500 p-6 hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Placements</p>
              <p className="text-4xl font-bold text-slate mt-2">{loading ? '...' : dashboardData.totalPlacements}</p>
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-briefcase text-3xl text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* HOME PAGE SECTION */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
              <i className="fas fa-home text-crimson"></i>
              Home Page Content
            </h2>
            <button
              onClick={() => navigate('/dashboard/home')}
              className="px-4 py-2 bg-crimson text-white rounded-lg hover:bg-slate transition-colors font-semibold text-sm"
            >
              <i className="fas fa-edit mr-2"></i>Edit Home
            </button>
          </div>

          <div className="space-y-4">
            {/* Hero Section */}
            <div className="border-l-4 border-crimson pl-4 py-2 bg-gray-50 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate">Hero Section</h3>
                  {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : dashboardData.hero ? (
                    <p className="text-sm text-gray-600 mt-1">{dashboardData.hero.title}</p>
                  ) : (
                    <p className="text-sm text-red-500">Not configured</p>
                  )}
                </div>
                <button
                  onClick={() => navigate('/dashboard/home')}
                  className="text-crimson hover:text-slate"
                >
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate">Statistics</h3>
                  <p className="text-sm text-gray-600 mt-1">{dashboardData.statistics.length} stats configured</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/home')}
                  className="text-blue-600 hover:text-slate"
                >
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Featured Programs */}
            <div className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate">Featured Programs</h3>
                  <p className="text-sm text-gray-600 mt-1">{dashboardData.featuredPrograms.length} programs featured</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/home')}
                  className="text-green-600 hover:text-slate"
                >
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Announcements */}
            <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate">Announcements</h3>
                  <p className="text-sm text-gray-600 mt-1">{dashboardData.totalAnnouncements} active announcements</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/announcements')}
                  className="text-yellow-600 hover:text-slate"
                >
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Testimonials */}
            <div className="border-l-4 border-purple-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate">Testimonials</h3>
                  <p className="text-sm text-gray-600 mt-1">{dashboardData.testimonials.length} testimonials</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/home')}
                  className="text-purple-600 hover:text-slate"
                >
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ADMISSION ENQUIRIES */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
              <i className="fas fa-user-plus text-red-600"></i>
              Recent Admission Enquiries
            </h2>
            <button
              onClick={() => navigate('/dashboard/admissions')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-slate transition-colors font-semibold text-sm"
            >
              <i className="fas fa-list mr-2"></i>View All
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
            </div>
          ) : dashboardData.admissionEnquiries.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardData.admissionEnquiries.slice(0, 5).map((enquiry, index) => (
                <div
                  key={index}
                  onClick={() => navigate('/dashboard/admissions')}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate">{enquiry.full_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <i className="fas fa-graduation-cap mr-1"></i>
                        {enquiry.program_interested}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <i className="fas fa-envelope mr-1"></i>
                        {enquiry.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        <i className="fas fa-phone mr-1"></i>
                        {enquiry.mobile_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        enquiry.status === 'new' ? 'bg-red-100 text-red-700' :
                        enquiry.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                        enquiry.status === 'enrolled' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {enquiry.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(enquiry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-inbox text-4xl mb-2"></i>
              <p>No admission enquiries yet</p>
            </div>
          )}
        </div>

        {/* ACADEMICS SECTION */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
              <i className="fas fa-graduation-cap text-green-600"></i>
              Academic Programs
            </h2>
            <button
              onClick={() => navigate('/dashboard/academics')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-slate transition-colors font-semibold text-sm"
            >
              <i className="fas fa-edit mr-2"></i>Manage
            </button>
          </div>

          <div className="space-y-4">
            {/* Departments */}
            <div>
              <h3 className="font-semibold text-slate mb-3">Departments ({dashboardData.totalDepartments})</h3>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : dashboardData.departments.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {dashboardData.departments.map((dept, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="font-semibold text-sm text-green-900">{dept.department_code}</p>
                      <p className="text-xs text-green-700">{dept.department_name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No departments added</p>
              )}
            </div>

            {/* Recent Courses */}
            <div>
              <h3 className="font-semibold text-slate mb-3">Recent Courses ({dashboardData.totalCourses})</h3>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : dashboardData.courses.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dashboardData.courses.slice(0, 4).map((course, index) => (
                    <div key={index} className="border-l-4 border-green-500 bg-gray-50 p-3 rounded-r-lg">
                      <p className="font-semibold text-sm text-slate">{course.course_name}</p>
                      <p className="text-xs text-gray-600">
                        {course.duration_years} Years | {course.total_seats} Seats
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No courses added</p>
              )}
            </div>
          </div>
        </div>

        {/* CONTACT MESSAGES */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
              <i className="fas fa-envelope text-blue-600"></i>
              Recent Contact Messages
            </h2>
            <button
              onClick={() => navigate('/dashboard/contact')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-slate transition-colors font-semibold text-sm"
            >
              <i className="fas fa-list mr-2"></i>View All
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
            </div>
          ) : dashboardData.contactSubmissions.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardData.contactSubmissions.slice(0, 5).map((contact, index) => (
                <div
                  key={index}
                  onClick={() => navigate('/dashboard/contact')}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      contact.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      contact.status === 'replied' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-semibold">{contact.subject}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{contact.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-inbox text-4xl mb-2"></i>
              <p>No contact messages yet</p>
            </div>
          )}
        </div>

        {/* PLACEMENTS */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
              <i className="fas fa-briefcase text-purple-600"></i>
              Placement Records
            </h2>
            <button
              onClick={() => navigate('/dashboard/placements')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-slate transition-colors font-semibold text-sm"
            >
              <i className="fas fa-plus mr-2"></i>Add New
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
            </div>
          ) : dashboardData.placements.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardData.placements.slice(0, 5).map((placement, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate">{placement.student_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <i className="fas fa-building mr-1"></i>
                        {placement.company_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-user-tie mr-1"></i>
                        {placement.job_role}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        ₹{placement.package_lpa} LPA
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Batch {placement.batch_year}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-briefcase text-4xl mb-2"></i>
              <p>No placement records yet</p>
            </div>
          )}
        </div>

        {/* ABOUT US PAGES */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
              <i className="fas fa-info-circle text-indigo-600"></i>
              About Us Pages
            </h2>
          </div>

          <div className="space-y-3">
            <div
              onClick={() => navigate('/dashboard/vision-mission')}
              className="border-l-4 border-indigo-500 pl-4 py-3 bg-gray-50 rounded-r-lg hover:bg-indigo-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate">Vision & Mission</h3>
                  <p className="text-sm text-gray-600">Institute's vision and mission statement</p>
                </div>
                <i className="fas fa-arrow-right text-indigo-600"></i>
              </div>
            </div>

            <div
              onClick={() => navigate('/dashboard/chairman-message')}
              className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate">Chairman Message</h3>
                  <p className="text-sm text-gray-600">Message from the Chairman</p>
                </div>
                <i className="fas fa-arrow-right text-blue-600"></i>
              </div>
            </div>

            <div
              onClick={() => navigate('/dashboard/secretary-message')}
              className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50 rounded-r-lg hover:bg-green-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate">Secretary Message</h3>
                  <p className="text-sm text-gray-600">Message from the Secretary</p>
                </div>
                <i className="fas fa-arrow-right text-green-600"></i>
              </div>
            </div>

            <div
              onClick={() => navigate('/dashboard/joint-secretary-message')}
              className="border-l-4 border-yellow-500 pl-4 py-3 bg-gray-50 rounded-r-lg hover:bg-yellow-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate">Joint Secretary Message</h3>
                  <p className="text-sm text-gray-600">Message from the Joint Secretary</p>
                </div>
                <i className="fas fa-arrow-right text-yellow-600"></i>
              </div>
            </div>

            <div
              onClick={() => navigate('/dashboard/director-message')}
              className="border-l-4 border-purple-500 pl-4 py-3 bg-gray-50 rounded-r-lg hover:bg-purple-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate">Director Message</h3>
                  <p className="text-sm text-gray-600">Message from the Director</p>
                </div>
                <i className="fas fa-arrow-right text-purple-600"></i>
              </div>
            </div>

            <div
              onClick={() => navigate('/dashboard/approvals-affiliations')}
              className="border-l-4 border-red-500 pl-4 py-3 bg-gray-50 rounded-r-lg hover:bg-red-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate">Approvals & Affiliations</h3>
                  <p className="text-sm text-gray-600">Manage approvals and affiliations</p>
                </div>
                <i className="fas fa-arrow-right text-red-600"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-gradient-to-r from-slate to-crimson rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-serif font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => navigate('/dashboard/home')}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white hover:bg-white/20 transition-all text-center"
          >
            <i className="fas fa-home text-2xl mb-2"></i>
            <p className="text-sm font-semibold">Home</p>
          </button>
          <button
            onClick={() => navigate('/dashboard/academics')}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white hover:bg-white/20 transition-all text-center"
          >
            <i className="fas fa-graduation-cap text-2xl mb-2"></i>
            <p className="text-sm font-semibold">Academics</p>
          </button>
          <button
            onClick={() => navigate('/dashboard/admissions')}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white hover:bg-white/20 transition-all text-center"
          >
            <i className="fas fa-user-plus text-2xl mb-2"></i>
            <p className="text-sm font-semibold">Admissions</p>
          </button>
          <button
            onClick={() => navigate('/dashboard/placements')}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white hover:bg-white/20 transition-all text-center"
          >
            <i className="fas fa-briefcase text-2xl mb-2"></i>
            <p className="text-sm font-semibold">Placements</p>
          </button>
          <button
            onClick={() => navigate('/dashboard/announcements')}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white hover:bg-white/20 transition-all text-center"
          >
            <i className="fas fa-bullhorn text-2xl mb-2"></i>
            <p className="text-sm font-semibold">Announce</p>
          </button>
          <button
            onClick={() => navigate('/dashboard/contact')}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white hover:bg-white/20 transition-all text-center"
          >
            <i className="fas fa-envelope text-2xl mb-2"></i>
            <p className="text-sm font-semibold">Contact</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
