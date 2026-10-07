import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Import admin pages
import ManageHomePage from './ManageHomePage';
import ManageVisionMission from './ManageVisionMission';
import { ManageChairmanMessage, ManageSecretaryMessage, ManageJointSecretaryMessage, ManageDirectorMessage } from './ManageMessagePage';
import ManageAcademicsPage from './ManageAcademicsPage';
import ManageAdmissionsPage from './ManageAdmissionsPage';
import ManagePlacementsPage from './ManagePlacementsPage';
import ManageResearchPage from './ManageResearchPage';
import ManageContactPage from './ManageContactPage';
import ManageAnnouncementsPage from './ManageAnnouncementsPage';
import ManageGalleryPage from './ManageGalleryPage';
import ManageLifeAtFITPage from './ManageLifeAtFITPage';
import ManageAchievementsPage from './ManageAchievementsPage';
import ManageCareersPage from './ManageCareersPage';
import ManageAdministrationPage from './ManageAdministrationPage';
import AntiRaggingCommitteeManagement from './AntiRaggingCommitteeManagement';
import MandatoryDisclosuresManagement from './MandatoryDisclosuresManagement';
import ManageAboutPage from './ManageAboutPage';
import ManageGoverningBody from './ManageGoverningBody';
import ManageSMTPSettings from './ManageSMTPSettings';
import EmailLogs from './EmailLogs';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedDropdown, setExpandedDropdown] = useState(null);

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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard', hasSubmenu: false, path: '/dashboard' },
    {
      id: 'website',
      icon: 'fa-globe',
      label: 'WEBSITE PAGES',
      isHeader: true,
      submenu: [
        { id: 'home', icon: 'fa-home', label: 'Home Page', path: '/dashboard/home' },
        {
          id: 'about',
          icon: 'fa-info-circle',
          label: 'About Us',
          hasDropdown: true,
          dropdown: [
            { id: 'about-page', label: 'About Forte Institute', path: '/dashboard/about-page' },
            { id: 'vision-mission', label: 'Vision & Mission', path: '/dashboard/vision-mission' },
            { id: 'chairman-message', label: 'Chairman Message', path: '/dashboard/chairman-message' },
            { id: 'secretary-message', label: 'Secretary Message', path: '/dashboard/secretary-message' },
            { id: 'joint-secretary-message', label: 'Joint Secretary Message', path: '/dashboard/joint-secretary-message' },
            { id: 'director-message', label: 'Director Message', path: '/dashboard/director-message' },
            { id: 'administration', label: 'Administration', path: '/dashboard/administration' },
            { id: 'governing-body', label: 'Governing Body', path: '/dashboard/governing-body' },
            { id: 'anti-ragging-committee', label: 'Anti-Ragging & Grievance Committee', path: '/dashboard/anti-ragging-committee' },
            { id: 'mandatory-disclosures', label: 'Mandatory Disclosures', path: '/dashboard/mandatory-disclosures' },
          ]
        },
        { id: 'academics', icon: 'fa-graduation-cap', label: 'Academics', path: '/dashboard/academics' },
        { id: 'admissions', icon: 'fa-user-plus', label: 'Admissions', path: '/dashboard/admissions' },
        { id: 'announcements', icon: 'fa-bullhorn', label: 'Announcements', path: '/dashboard/announcements' },
        { id: 'placements', icon: 'fa-briefcase', label: 'Training & Placements', path: '/dashboard/placements' },
        { id: 'research', icon: 'fa-flask', label: 'Research & Development', path: '/dashboard/research' },
        { id: 'life-at-fit', icon: 'fa-heart', label: 'Life@FIT', path: '/dashboard/life-at-fit' },
        { id: 'achievements', icon: 'fa-trophy', label: 'Achievements & Awards', path: '/dashboard/achievements' },
        { id: 'careers', icon: 'fa-user-tie', label: 'Careers', path: '/dashboard/careers' },
        { id: 'gallery', icon: 'fa-images', label: 'Gallery', path: '/dashboard/gallery' },
        { id: 'contact', icon: 'fa-map-marker-alt', label: 'Contact Page', path: '/dashboard/contact' },
      ]
    },
    {
      id: 'users',
      icon: 'fa-users-cog',
      label: 'USER MANAGEMENT',
      isHeader: true,
      submenu: [
        { id: 'admins', icon: 'fa-user-shield', label: 'Admin Users', path: '/dashboard/admins' },
        { id: 'contacts', icon: 'fa-envelope', label: 'Contact Messages', path: '/dashboard/contacts' },
      ]
    },
    {
      id: 'settings',
      icon: 'fa-cog',
      label: 'SETTINGS',
      isHeader: true,
      submenu: [
        { id: 'smtp', icon: 'fa-envelope-open-text', label: 'SMTP Settings', path: '/dashboard/smtp-settings' },
        { id: 'email-logs', icon: 'fa-envelope-open', label: 'Email Logs', path: '/dashboard/email-logs' },
        { id: 'general', icon: 'fa-sliders-h', label: 'General Settings', path: '/dashboard/general' },
        { id: 'seo', icon: 'fa-search', label: 'SEO Settings', path: '/dashboard/seo' },
      ]
    },
  ];

  const stats = [
    { icon: 'fa-file-alt', label: 'Pages', value: '0', color: 'bg-crimson' },
    { icon: 'fa-bullhorn', label: 'Announcements', value: '0', color: 'bg-slate' },
    { icon: 'fa-envelope', label: 'Contacts', value: '0', color: 'bg-slate' },
  ];

  const quickActions = [
    { icon: 'fa-bullhorn', title: 'Create Announcement', description: 'Add a new announcement', color: 'bg-crimson' },
    { icon: 'fa-edit', title: 'Manage Pages', description: 'Edit website pages', color: 'bg-crimson' },
    { icon: 'fa-inbox', title: 'View Contacts', description: 'Check contact messages', color: 'bg-slate' },
  ];

  const recentActivity = [
    { action: 'Page Updated', details: 'Home Page content modified', time: '2 hours ago', icon: 'fa-edit', color: 'text-blue-600' },
    { action: 'Announcement Created', details: 'Winter Break Schedule Posted', time: '5 hours ago', icon: 'fa-bullhorn', color: 'text-green-600' },
    { action: 'Contact Received', details: 'New admission inquiry', time: '2 days ago', icon: 'fa-envelope', color: 'text-yellow-600' },
  ];

  const toggleSubmenu = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const toggleDropdown = (itemId) => {
    setExpandedDropdown(expandedDropdown === itemId ? null : itemId);
  };

  // Get current active path
  const currentPath = location.pathname;

  // Check if a menu item is active
  const isMenuActive = (path) => {
    return currentPath === path;
  };

  // Import DashboardPage component
  const DashboardHome = () => {
    const [loading, setLoading] = React.useState(true);
    const [dashboardData, setDashboardData] = React.useState({
      totalAnnouncements: 0,
      totalEnquiries: 0,
      newEnquiries: 0,
      totalContacts: 0,
      totalDepartments: 0,
      totalCourses: 0,
      totalPlacements: 0,
      admissionEnquiries: [],
      contactSubmissions: [],
      departments: [],
      courses: [],
      placements: [],
      hero: null,
      statistics: [],
      featuredPrograms: [],
      announcements: [],
      testimonials: [],
    });

    React.useEffect(() => {
      loadAllDashboardData();
    }, []);

    const loadAllDashboardData = async () => {
      try {
        setLoading(true);
        // Import API services dynamically
        const { homeAPI, admissionAPI, contactAPI, academicsAPI, placementsAPI } = await import('../../services/api');

        const [homeData, admissionData, contactData, academicsData, placementsData] = await Promise.all([
          homeAPI.getComplete().catch(() => ({ hero: null, stats: [], programs: [], announcements: [], testimonials: [] })),
          admissionAPI.getEnquiries().catch(() => ({ data: [] })),
          contactAPI.getSubmissions().catch(() => ({ data: [] })),
          academicsAPI.getCourses().catch(() => ({ data: [] })),
          placementsAPI.getPlacements().catch(() => ({ data: [] })),
        ]);

        const departmentsData = await academicsAPI.getDepartments().catch(() => ({ data: [] }));
        const newEnquiries = admissionData.data?.filter(e => e.status === 'new').length || 0;

        setDashboardData({
          hero: homeData.hero,
          statistics: homeData.stats || [],
          featuredPrograms: homeData.programs || [],
          announcements: homeData.announcements || [],
          testimonials: homeData.testimonials || [],
          admissionEnquiries: admissionData.data || [],
          contactSubmissions: contactData.data || [],
          departments: departmentsData.data || [],
          courses: academicsData.data || [],
          placements: placementsData.data || [],
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
          <div onClick={() => navigate('/dashboard/admissions')} className="bg-white rounded-xl shadow-md border-l-4 border-red-500 p-6 hover:shadow-xl transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Admission Enquiries</p>
                <p className="text-4xl font-bold text-slate mt-2">{loading ? '...' : dashboardData.totalEnquiries}</p>
                {dashboardData.newEnquiries > 0 && (
                  <p className="text-sm text-red-600 font-semibold mt-1">
                    <i className="fas fa-exclamation-circle mr-1"></i>{dashboardData.newEnquiries} New
                  </p>
                )}
              </div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="fas fa-user-plus text-3xl text-red-600"></i>
              </div>
            </div>
          </div>

          <div onClick={() => navigate('/dashboard/contact')} className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 p-6 hover:shadow-xl transition-all cursor-pointer group">
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

          <div onClick={() => navigate('/dashboard/academics')} className="bg-white rounded-xl shadow-md border-l-4 border-green-500 p-6 hover:shadow-xl transition-all cursor-pointer group">
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

          <div onClick={() => navigate('/dashboard/placements')} className="bg-white rounded-xl shadow-md border-l-4 border-purple-500 p-6 hover:shadow-xl transition-all cursor-pointer group">
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
                <i className="fas fa-home text-crimson"></i>Home Page Content
              </h2>
              <button onClick={() => navigate('/dashboard/home')} className="px-4 py-2 bg-crimson text-white rounded-lg hover:bg-slate transition-colors font-semibold text-sm">
                <i className="fas fa-edit mr-2"></i>Edit Home
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-crimson pl-4 py-2 bg-gray-50 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate">Hero Section</h3>
                    {loading ? <p className="text-sm text-gray-500">Loading...</p> : dashboardData.hero ? <p className="text-sm text-gray-600 mt-1">{dashboardData.hero.title}</p> : <p className="text-sm text-red-500">Not configured</p>}
                  </div>
                  <button onClick={() => navigate('/dashboard/home')} className="text-crimson hover:text-slate"><i className="fas fa-arrow-right"></i></button>
                </div>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate">Statistics</h3>
                    <p className="text-sm text-gray-600 mt-1">{dashboardData.statistics.length} stats configured</p>
                  </div>
                  <button onClick={() => navigate('/dashboard/home')} className="text-blue-600 hover:text-slate"><i className="fas fa-arrow-right"></i></button>
                </div>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate">Featured Programs</h3>
                    <p className="text-sm text-gray-600 mt-1">{dashboardData.featuredPrograms.length} programs featured</p>
                  </div>
                  <button onClick={() => navigate('/dashboard/home')} className="text-green-600 hover:text-slate"><i className="fas fa-arrow-right"></i></button>
                </div>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate">Announcements</h3>
                    <p className="text-sm text-gray-600 mt-1">{dashboardData.totalAnnouncements} active announcements</p>
                  </div>
                  <button onClick={() => navigate('/dashboard/announcements')} className="text-yellow-600 hover:text-slate"><i className="fas fa-arrow-right"></i></button>
                </div>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate">Testimonials</h3>
                    <p className="text-sm text-gray-600 mt-1">{dashboardData.testimonials.length} testimonials</p>
                  </div>
                  <button onClick={() => navigate('/dashboard/home')} className="text-purple-600 hover:text-slate"><i className="fas fa-arrow-right"></i></button>
                </div>
              </div>
            </div>
          </div>

          {/* ADMISSION ENQUIRIES */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
                <i className="fas fa-user-plus text-red-600"></i>Recent Admission Enquiries
              </h2>
              <button onClick={() => navigate('/dashboard/admissions')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-slate transition-colors font-semibold text-sm">
                <i className="fas fa-list mr-2"></i>View All
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8"><i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i></div>
            ) : dashboardData.admissionEnquiries.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboardData.admissionEnquiries.slice(0, 5).map((enquiry, index) => (
                  <div key={index} onClick={() => navigate('/dashboard/admissions')} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate">{enquiry.full_name}</h3>
                        <p className="text-sm text-gray-600 mt-1"><i className="fas fa-graduation-cap mr-1"></i>{enquiry.program_interested}</p>
                        <p className="text-sm text-gray-500 mt-1"><i className="fas fa-envelope mr-1"></i>{enquiry.email}</p>
                        <p className="text-sm text-gray-500"><i className="fas fa-phone mr-1"></i>{enquiry.mobile_number}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${enquiry.status === 'new' ? 'bg-red-100 text-red-700' : enquiry.status === 'contacted' ? 'bg-blue-100 text-blue-700' : enquiry.status === 'enrolled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {enquiry.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">{new Date(enquiry.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500"><i className="fas fa-inbox text-4xl mb-2"></i><p>No admission enquiries yet</p></div>
            )}
          </div>

          {/* ACADEMICS SECTION */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
                <i className="fas fa-graduation-cap text-green-600"></i>Academic Programs
              </h2>
              <button onClick={() => navigate('/dashboard/academics')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-slate transition-colors font-semibold text-sm">
                <i className="fas fa-edit mr-2"></i>Manage
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate mb-3">Departments ({dashboardData.totalDepartments})</h3>
                {loading ? <p className="text-sm text-gray-500">Loading...</p> : dashboardData.departments.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {dashboardData.departments.map((dept, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="font-semibold text-sm text-green-900">{dept.department_code}</p>
                        <p className="text-xs text-green-700">{dept.department_name}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-500">No departments added</p>}
              </div>
              <div>
                <h3 className="font-semibold text-slate mb-3">Recent Courses ({dashboardData.totalCourses})</h3>
                {loading ? <p className="text-sm text-gray-500">Loading...</p> : dashboardData.courses.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {dashboardData.courses.slice(0, 4).map((course, index) => (
                      <div key={index} className="border-l-4 border-green-500 bg-gray-50 p-3 rounded-r-lg">
                        <p className="font-semibold text-sm text-slate">{course.course_name}</p>
                        <p className="text-xs text-gray-600">{course.duration_years} Years | {course.total_seats} Seats</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-500">No courses added</p>}
              </div>
            </div>
          </div>

          {/* CONTACT MESSAGES */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
                <i className="fas fa-envelope text-blue-600"></i>Recent Contact Messages
              </h2>
              <button onClick={() => navigate('/dashboard/contact')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-slate transition-colors font-semibold text-sm">
                <i className="fas fa-list mr-2"></i>View All
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8"><i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i></div>
            ) : dashboardData.contactSubmissions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboardData.contactSubmissions.slice(0, 5).map((contact, index) => (
                  <div key={index} onClick={() => navigate('/dashboard/contact')} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${contact.status === 'new' ? 'bg-blue-100 text-blue-700' : contact.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{contact.status}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-semibold">{contact.subject}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{contact.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(contact.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500"><i className="fas fa-inbox text-4xl mb-2"></i><p>No contact messages yet</p></div>
            )}
          </div>

          {/* PLACEMENTS */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
                <i className="fas fa-briefcase text-purple-600"></i>Placement Records
              </h2>
              <button onClick={() => navigate('/dashboard/placements')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-slate transition-colors font-semibold text-sm">
                <i className="fas fa-plus mr-2"></i>Add New
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8"><i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i></div>
            ) : dashboardData.placements.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboardData.placements.slice(0, 5).map((placement, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate">{placement.student_name}</h3>
                        <p className="text-sm text-gray-600 mt-1"><i className="fas fa-building mr-1"></i>{placement.company_name}</p>
                        <p className="text-sm text-gray-600"><i className="fas fa-user-tie mr-1"></i>{placement.job_role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">₹{placement.package_lpa} LPA</p>
                        <p className="text-xs text-gray-500 mt-1">Batch {placement.batch_year}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500"><i className="fas fa-briefcase text-4xl mb-2"></i><p>No placement records yet</p></div>
            )}
          </div>

          {/* ABOUT US PAGES */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
                <i className="fas fa-info-circle text-indigo-600"></i>About Us Pages
              </h2>
            </div>
            <div className="space-y-3">
              {[
                { path: '/dashboard/vision-mission', color: 'indigo', title: 'Vision & Mission', desc: "Institute's vision and mission statement" },
                { path: '/dashboard/chairman-message', color: 'blue', title: 'Chairman Message', desc: 'Message from the Chairman' },
                { path: '/dashboard/secretary-message', color: 'green', title: 'Secretary Message', desc: 'Message from the Secretary' },
                { path: '/dashboard/joint-secretary-message', color: 'yellow', title: 'Joint Secretary Message', desc: 'Message from the Joint Secretary' },
                { path: '/dashboard/director-message', color: 'purple', title: 'Director Message', desc: 'Message from the Director' },
                { path: '/dashboard/approvals-affiliations', color: 'red', title: 'Approvals & Affiliations', desc: 'Manage approvals and affiliations' },
              ].map((item, idx) => (
                <div key={idx} onClick={() => navigate(item.path)} className={`border-l-4 border-${item.color}-500 pl-4 py-3 bg-gray-50 rounded-r-lg hover:bg-${item.color}-50 cursor-pointer transition-colors`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                    <i className={`fas fa-arrow-right text-${item.color}-600`}></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT MANAGEMENT - FULL WIDTH */}
        <div style={{ width: '100%' }}>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-slate flex items-center gap-2">
                <i className="fas fa-edit text-orange-600"></i>
                Content Management
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
              {[
                { path: '/dashboard/announcements', color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: 'fa-bullhorn', title: 'Announcements', count: `${dashboardData.totalAnnouncements} active` },
                { path: '/dashboard/gallery', color: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', icon: 'fa-images', title: 'Gallery', count: 'Photo gallery' },
                { path: '/dashboard/research', color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', icon: 'fa-flask', title: 'Research', count: 'R&D content' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(item.path)}
                  style={{
                    background: item.color,
                    borderRadius: '12px',
                    padding: '24px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <i className={`fas ${item.icon}`} style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block' }}></i>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '4px' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="bg-gradient-to-r from-slate to-crimson rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-serif font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { path: '/dashboard/home', icon: 'fa-home', label: 'Home' },
              { path: '/dashboard/academics', icon: 'fa-graduation-cap', label: 'Academics' },
              { path: '/dashboard/admissions', icon: 'fa-user-plus', label: 'Admissions' },
              { path: '/dashboard/placements', icon: 'fa-briefcase', label: 'Placements' },
              { path: '/dashboard/announcements', icon: 'fa-bullhorn', label: 'Announce' },
              { path: '/dashboard/contact', icon: 'fa-envelope', label: 'Contact' },
            ].map((item, idx) => (
              <button key={idx} onClick={() => navigate(item.path)} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white hover:bg-white/20 transition-all text-center">
                <i className={`fas ${item.icon} text-2xl mb-2`}></i>
                <p className="text-sm font-semibold">{item.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-crimson rounded-lg flex items-center justify-center text-white font-bold text-xl">
              FIT
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-slate">Admin Panel</h1>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          {menuItems.map((item) => (
            <div key={item.id} className="mb-2">
              {item.isHeader ? (
                <>
                  <div
                    onClick={() => item.submenu && toggleSubmenu(item.id)}
                    className="flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-slate"
                  >
                    <span>{item.label}</span>
                    {item.submenu && (
                      <i className={`fas fa-chevron-down text-xs transition-transform ${expandedMenu === item.id ? 'rotate-180' : ''}`}></i>
                    )}
                  </div>
                  {item.submenu && expandedMenu === item.id && (
                    <div className="mt-1">
                      {item.submenu.map((subItem) => (
                        <div key={subItem.id}>
                          <button
                            onClick={() => {
                              if (subItem.hasDropdown) {
                                toggleDropdown(subItem.id);
                              } else {
                                navigate(subItem.path);
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition mb-1 ${
                              isMenuActive(subItem.path)
                                ? 'bg-gray-100 text-slate font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <i className={`fas ${subItem.icon} w-5`}></i>
                            <span className="flex-1 text-left">{subItem.label}</span>
                            {subItem.hasDropdown && (
                              <i className={`fas fa-chevron-down text-xs transition-transform ${expandedDropdown === subItem.id ? 'rotate-180' : ''}`}></i>
                            )}
                          </button>
                          {subItem.hasDropdown && subItem.dropdown && expandedDropdown === subItem.id && (
                            <div className="ml-6 mt-1 space-y-1">
                              {subItem.dropdown.map((dropItem) => (
                                <button
                                  key={dropItem.id}
                                  onClick={() => navigate(dropItem.path)}
                                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition ${
                                    isMenuActive(dropItem.path)
                                      ? 'bg-crimson text-white font-semibold'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <i className="fas fa-arrow-right text-xs"></i>
                                  <span>{dropItem.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition ${
                    isMenuActive(item.path)
                      ? 'bg-crimson text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <i className={`fas ${item.icon} w-5`}></i>
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate">Welcome back, {user.full_name ? user.full_name.split(' ')[0] : 'admin'}!</h2>
              <p className="text-sm text-gray-600">Here's what's happening with your website today.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-crimson transition">
                <i className="fas fa-bell text-xl"></i>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition font-semibold"
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="home" element={<ManageHomePage />} />
            <Route path="about-page" element={<ManageAboutPage />} />
            <Route path="vision-mission" element={<ManageVisionMission />} />
            <Route path="chairman-message" element={<ManageChairmanMessage />} />
            <Route path="secretary-message" element={<ManageSecretaryMessage />} />
            <Route path="joint-secretary-message" element={<ManageJointSecretaryMessage />} />
            <Route path="director-message" element={<ManageDirectorMessage />} />
            <Route path="administration" element={<ManageAdministrationPage />} />
            <Route path="governing-body" element={<ManageGoverningBody />} />
            <Route path="anti-ragging-committee" element={<AntiRaggingCommitteeManagement />} />
            <Route path="mandatory-disclosures" element={<MandatoryDisclosuresManagement />} />
            <Route path="academics" element={<ManageAcademicsPage />} />
            <Route path="admissions" element={<ManageAdmissionsPage />} />
            <Route path="placements" element={<ManagePlacementsPage />} />
            <Route path="research" element={<ManageResearchPage />} />
            <Route path="life-at-fit" element={<ManageLifeAtFITPage />} />
            <Route path="achievements" element={<ManageAchievementsPage />} />
            <Route path="careers" element={<ManageCareersPage />} />
            <Route path="contact" element={<ManageContactPage />} />
            <Route path="announcements" element={<ManageAnnouncementsPage />} />
            <Route path="gallery" element={<ManageGalleryPage />} />
            <Route path="smtp-settings" element={<ManageSMTPSettings />} />
            <Route path="email-logs" element={<EmailLogs />} />
            {/* Add more routes as needed */}
            <Route path="*" element={<DashboardHome />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
