// API Service for Backend Communication
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8009/api';
const BASE_URL = API_URL.replace('/api', ''); // Base URL without /api for file uploads

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('admin_token');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include'  // Enable CORS with credentials
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`API returned non-JSON response. Check if backend is running at ${API_URL}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ========================================
// HOME PAGE APIs
// ========================================

export const homeAPI = {
  // Get all home page data
  getComplete: () => apiCall('/home/complete'),

  // Hero Section
  getHero: () => apiCall('/home/hero'),
  updateHero: (data) => apiCall('/home/hero', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Statistics
  getStats: () => apiCall('/home/stats'),
  addStat: (data) => apiCall('/home/stats', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateStat: (id, data) => apiCall(`/home/stats/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteStat: (id) => apiCall(`/home/stats/${id}`, {
    method: 'DELETE'
  }),

  // Featured Programs
  getPrograms: () => apiCall('/home/programs'),
  addProgram: (data) => apiCall('/home/programs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProgram: (id, data) => apiCall(`/home/programs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteProgram: (id) => apiCall(`/home/programs/${id}`, {
    method: 'DELETE'
  }),

  // Announcements
  getAnnouncements: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/home/announcements${query ? '?' + query : ''}`);
  },
  addAnnouncement: (data) => apiCall('/home/announcements', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateAnnouncement: (id, data) => apiCall(`/home/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteAnnouncement: (id) => apiCall(`/home/announcements/${id}`, {
    method: 'DELETE'
  }),

  // Testimonials
  getTestimonials: () => apiCall('/home/testimonials'),
  addTestimonial: (data) => apiCall('/home/testimonials', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTestimonial: (id, data) => apiCall(`/home/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTestimonial: (id) => apiCall(`/home/testimonials/${id}`, {
    method: 'DELETE'
  }),

  // CTA Section
  getCTA: () => apiCall('/home/cta'),
  updateCTA: (data) => apiCall('/home/cta', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

// ========================================
// ADMISSION APIs
// ========================================

export const admissionAPI = {
  // Submit enquiry (public)
  submitEnquiry: (data) => apiCall('/admission/enquiry', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Admin operations
  getEnquiries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/admission/enquiries${query ? '?' + query : ''}`);
  },
  getEnquiry: (id) => apiCall(`/admission/enquiries/${id}`),
  updateStatus: (id, status, notes) => apiCall(`/admission/enquiries/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes })
  }),
  deleteEnquiry: (id) => apiCall(`/admission/enquiries/${id}`, {
    method: 'DELETE'
  })
};

// ========================================
// CONTACT APIs
// ========================================

export const contactAPI = {
  // Submit contact form (public)
  submitContact: (data) => apiCall('/contact/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Admin operations
  getSubmissions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/contact/submissions${query ? '?' + query : ''}`);
  },
  updateStatus: (id, status) => apiCall(`/contact/submissions/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  deleteSubmission: (id) => apiCall(`/contact/submissions/${id}`, {
    method: 'DELETE'
  })
};

// ========================================
// ACADEMICS APIs
// ========================================

export const academicsAPI = {
  // Departments
  getDepartments: () => apiCall('/academics/departments'),
  addDepartment: (data) => apiCall('/academics/departments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDepartment: (id, data) => apiCall(`/academics/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteDepartment: (id) => apiCall(`/academics/departments/${id}`, {
    method: 'DELETE'
  }),

  // Courses
  getCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/academics/courses${query ? '?' + query : ''}`);
  },
  getCourse: (id) => apiCall(`/academics/courses/${id}`),
  addCourse: (data) => apiCall('/academics/courses', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCourse: (id, data) => apiCall(`/academics/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteCourse: (id) => apiCall(`/academics/courses/${id}`, {
    method: 'DELETE'
  }),

  // Anti-Ragging Policy
  getAntiRaggingPolicy: () => apiCall('/academics/anti-ragging'),
  updateAntiRaggingPolicy: (data) => apiCall('/academics/anti-ragging', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Grievances
  getGrievances: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/academics/grievances${query ? '?' + query : ''}`);
  },
  submitGrievance: (data) => apiCall('/academics/grievances', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateGrievance: (id, data) => apiCall(`/academics/grievances/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteGrievance: (id) => apiCall(`/academics/grievances/${id}`, {
    method: 'DELETE'
  }),

  // Faculty
  getFaculty: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/academics/faculty${query ? '?' + query : ''}`);
  },
  getFacultyMember: (id) => apiCall(`/academics/faculty/${id}`),
  addFaculty: (data) => apiCall('/academics/faculty', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateFaculty: (id, data) => apiCall(`/academics/faculty/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteFaculty: (id) => apiCall(`/academics/faculty/${id}`, {
    method: 'DELETE'
  })
};

// ========================================
// PLACEMENTS APIs
// ========================================

export const placementsAPI = {
  // Student Placement Records
  getPlacements: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/placements${query ? '?' + query : ''}`);
  },
  getStats: () => apiCall('/placements/stats'),
  getPlacement: (id) => apiCall(`/placements/${id}`),
  addPlacement: (data) => apiCall('/placements', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePlacement: (id, data) => apiCall(`/placements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePlacement: (id) => apiCall(`/placements/${id}`, {
    method: 'DELETE'
  }),

  // Placement Page Content Management
  // Coordinator
  getCoordinator: () => apiCall('/placements/content/coordinator'),
  updateCoordinator: (data) => apiCall('/placements/content/coordinator', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Training Programs
  getTrainingPrograms: () => apiCall('/placements/content/training-programs'),
  createTrainingProgram: (data) => apiCall('/placements/content/training-programs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTrainingProgram: (id, data) => apiCall(`/placements/content/training-programs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTrainingProgram: (id) => apiCall(`/placements/content/training-programs/${id}`, {
    method: 'DELETE'
  }),

  // Recruiters
  getRecruiters: () => apiCall('/placements/content/recruiters'),
  createRecruiter: (data) => apiCall('/placements/content/recruiters', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateRecruiter: (id, data) => apiCall(`/placements/content/recruiters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteRecruiter: (id) => apiCall(`/placements/content/recruiters/${id}`, {
    method: 'DELETE'
  }),

  // Placement Statistics (Page Statistics)
  getPageStatistics: () => apiCall('/placements/content/statistics'),
  createPageStatistic: (data) => apiCall('/placements/content/statistics', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePageStatistic: (id, data) => apiCall(`/placements/content/statistics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePageStatistic: (id) => apiCall(`/placements/content/statistics/${id}`, {
    method: 'DELETE'
  }),

  // Contact Information
  getContactInfo: () => apiCall('/placements/content/contact-info'),
  createContactInfo: (data) => apiCall('/placements/content/contact-info', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateContactInfo: (id, data) => apiCall(`/placements/content/contact-info/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteContactInfo: (id) => apiCall(`/placements/content/contact-info/${id}`, {
    method: 'DELETE'
  })
};

// ========================================
// AUTH APIs
// ========================================

export const authAPI = {
  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (data) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  verify: () => apiCall('/auth/verify'),
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return Promise.resolve({ success: true });
  }
};

// ========================================
// Helper Functions
// ========================================

export const setAuthToken = (token) => {
  localStorage.setItem('admin_token', token);
};

// ========================================
// GALLERY APIs
// ========================================

// Helper function for file upload API calls
const apiCallWithFile = async (endpoint, formData, options = {}) => {
  try {
    const token = localStorage.getItem('admin_token');

    const headers = {
      ...options.headers
      // DO NOT set Content-Type for FormData - browser will set it automatically with boundary
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || 'POST',
      headers,
      body: formData,
      credentials: 'include'
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`API returned non-JSON response. Check if backend is running at ${API_URL}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const galleryAPI = {
  // Categories
  getCategories: () => apiCall('/gallery/categories'),
  getAllCategories: () => apiCall('/gallery/categories/all'),
  createCategory: (data) => apiCall('/gallery/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCategory: (id, data) => apiCall(`/gallery/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteCategory: (id) => apiCall(`/gallery/categories/${id}`, {
    method: 'DELETE'
  }),

  // Images
  getImages: (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/gallery/images${query}`);
  },
  getAllImages: () => apiCall('/gallery/images/all'),
  getImage: (id) => apiCall(`/gallery/images/${id}`),

  // Create image with file upload
  createImage: (formData) => apiCallWithFile('/gallery/images', formData, { method: 'POST' }),

  // Update image with optional file upload
  updateImage: (id, formData) => apiCallWithFile(`/gallery/images/${id}`, formData, { method: 'PUT' }),

  deleteImage: (id) => apiCall(`/gallery/images/${id}`, {
    method: 'DELETE'
  }),

  // Stats
  getStats: () => apiCall('/gallery/stats'),
  getAllStats: () => apiCall('/gallery/stats/all'),
  createStat: (data) => apiCall('/gallery/stats', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateStat: (id, data) => apiCall(`/gallery/stats/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteStat: (id) => apiCall(`/gallery/stats/${id}`, {
    method: 'DELETE'
  }),

  // Page Header
  getHeader: () => apiCall('/gallery/header'),
  updateHeader: (data) => apiCall('/gallery/header', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

// Life@FIT API
export const lifeAtFitAPI = {
  // Activities
  getActivities: () => apiCall('/life-at-fit/activities'),
  getActivity: (id) => apiCall(`/life-at-fit/activities/${id}`),
  createActivity: (data) => apiCall('/life-at-fit/activities', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateActivity: (id, data) => apiCall(`/life-at-fit/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteActivity: (id) => apiCall(`/life-at-fit/activities/${id}`, {
    method: 'DELETE'
  }),

  // Facilities
  getFacilities: () => apiCall('/life-at-fit/facilities'),
  createFacility: (data) => apiCall('/life-at-fit/facilities', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateFacility: (id, data) => apiCall(`/life-at-fit/facilities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteFacility: (id) => apiCall(`/life-at-fit/facilities/${id}`, {
    method: 'DELETE'
  }),

  // Hostel Features
  getHostelFeatures: (hostelType) => {
    const query = hostelType ? `?hostel_type=${hostelType}` : '';
    return apiCall(`/life-at-fit/hostel-features${query}`);
  },
  createHostelFeature: (data) => apiCall('/life-at-fit/hostel-features', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateHostelFeature: (id, data) => apiCall(`/life-at-fit/hostel-features/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteHostelFeature: (id) => apiCall(`/life-at-fit/hostel-features/${id}`, {
    method: 'DELETE'
  }),

  // Testimonials
  getTestimonials: (isFeatured) => {
    const query = isFeatured !== undefined ? `?is_featured=${isFeatured}` : '';
    return apiCall(`/life-at-fit/testimonials${query}`);
  },
  createTestimonial: (data) => apiCall('/life-at-fit/testimonials', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTestimonial: (id, data) => apiCall(`/life-at-fit/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTestimonial: (id) => apiCall(`/life-at-fit/testimonials/${id}`, {
    method: 'DELETE'
  }),

  // Statistics
  getStatistics: () => apiCall('/life-at-fit/statistics')
};

// Achievements API
export const achievementsAPI = {
  // Categories
  getCategories: () => apiCall('/achievements/categories'),
  createCategory: (data) => apiCall('/achievements/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCategory: (id, data) => apiCall(`/achievements/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteCategory: (id) => apiCall(`/achievements/categories/${id}`, {
    method: 'DELETE'
  }),

  // Institutional Awards
  getInstitutionalAwards: (year) => {
    const query = year ? `?year=${year}` : '';
    return apiCall(`/achievements/institutional-awards${query}`);
  },
  createInstitutionalAward: (data) => apiCall('/achievements/institutional-awards', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateInstitutionalAward: (id, data) => apiCall(`/achievements/institutional-awards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteInstitutionalAward: (id) => apiCall(`/achievements/institutional-awards/${id}`, {
    method: 'DELETE'
  }),

  // Student Achievements
  getStudentAchievements: (categoryId) => {
    const query = categoryId ? `?category_id=${categoryId}` : '';
    return apiCall(`/achievements/student-achievements${query}`);
  },
  getStudentAchievementsList: () => apiCall('/achievements/student-achievements/list'),
  createStudentAchievement: (data) => apiCall('/achievements/student-achievements', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateStudentAchievement: (id, data) => apiCall(`/achievements/student-achievements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteStudentAchievement: (id) => apiCall(`/achievements/student-achievements/${id}`, {
    method: 'DELETE'
  }),

  // Faculty Achievements
  getFacultyAchievements: (department, type) => {
    const params = [];
    if (department) params.push(`department=${department}`);
    if (type) params.push(`achievement_type=${type}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return apiCall(`/achievements/faculty-achievements${query}`);
  },
  createFacultyAchievement: (data) => apiCall('/achievements/faculty-achievements', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateFacultyAchievement: (id, data) => apiCall(`/achievements/faculty-achievements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteFacultyAchievement: (id) => apiCall(`/achievements/faculty-achievements/${id}`, {
    method: 'DELETE'
  }),

  // Placement Highlights
  getPlacementHighlights: (year) => {
    const query = year ? `?year=${year}` : '';
    return apiCall(`/achievements/placement-highlights${query}`);
  },
  createPlacementHighlight: (data) => apiCall('/achievements/placement-highlights', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePlacementHighlight: (id, data) => apiCall(`/achievements/placement-highlights/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePlacementHighlight: (id) => apiCall(`/achievements/placement-highlights/${id}`, {
    method: 'DELETE'
  }),

  // Recognitions
  getRecognitions: () => apiCall('/achievements/recognitions'),
  createRecognition: (data) => apiCall('/achievements/recognitions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateRecognition: (id, data) => apiCall(`/achievements/recognitions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteRecognition: (id) => apiCall(`/achievements/recognitions/${id}`, {
    method: 'DELETE'
  }),

  // Statistics
  getStatistics: () => apiCall('/achievements/statistics')
};

// Careers API
export const careersAPI = {
  // Page Header
  getHeader: () => apiCall('/careers/header'),
  updateHeader: (data) => apiCall('/careers/header', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Benefits
  getBenefits: () => apiCall('/careers/benefits'),
  createBenefit: (data) => apiCall('/careers/benefits', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateBenefit: (id, data) => apiCall(`/careers/benefits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteBenefit: (id) => apiCall(`/careers/benefits/${id}`, {
    method: 'DELETE'
  }),

  // Job Openings
  getOpenings: (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/careers/openings${query}`);
  },
  getOpening: (id) => apiCall(`/careers/openings/${id}`),
  createOpening: (data) => apiCall('/careers/openings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateOpening: (id, data) => apiCall(`/careers/openings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteOpening: (id) => apiCall(`/careers/openings/${id}`, {
    method: 'DELETE'
  }),

  // Application Steps
  getApplicationSteps: () => apiCall('/careers/application-steps'),
  createApplicationStep: (data) => apiCall('/careers/application-steps', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateApplicationStep: (id, data) => apiCall(`/careers/application-steps/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteApplicationStep: (id) => apiCall(`/careers/application-steps/${id}`, {
    method: 'DELETE'
  }),

  // General Application
  getGeneralApplication: () => apiCall('/careers/general-application'),
  updateGeneralApplication: (data) => apiCall('/careers/general-application', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // HR Contacts
  getHRContacts: () => apiCall('/careers/hr-contacts'),
  createHRContact: (data) => apiCall('/careers/hr-contacts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateHRContact: (id, data) => apiCall(`/careers/hr-contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteHRContact: (id) => apiCall(`/careers/hr-contacts/${id}`, {
    method: 'DELETE'
  })
};

// Administration Content API
export const administrationContentAPI = {
  // Get complete page data
  getComplete: () => apiCall('/administration-content/complete'),

  // Header
  getHeader: () => apiCall('/administration-content/header'),
  updateHeader: (id, data) => apiCall(`/administration-content/header/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Director
  getDirector: () => apiCall('/administration-content/director'),
  updateDirector: (id, data) => apiCall(`/administration-content/director/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Team
  getTeam: () => apiCall('/administration-content/team'),
  getTeamMember: (id) => apiCall(`/administration-content/team/${id}`),
  createTeamMember: (data) => apiCall('/administration-content/team', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTeamMember: (id, data) => apiCall(`/administration-content/team/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTeamMember: (id) => apiCall(`/administration-content/team/${id}`, {
    method: 'DELETE'
  }),

  // Departments
  getDepartments: () => apiCall('/administration-content/departments'),
  getDepartment: (id) => apiCall(`/administration-content/departments/${id}`),
  createDepartment: (data) => apiCall('/administration-content/departments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDepartment: (id, data) => apiCall(`/administration-content/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteDepartment: (id) => apiCall(`/administration-content/departments/${id}`, {
    method: 'DELETE'
  }),

  // Offices
  getOffices: () => apiCall('/administration-content/offices'),
  getOffice: (id) => apiCall(`/administration-content/offices/${id}`),
  createOffice: (data) => apiCall('/administration-content/offices', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateOffice: (id, data) => apiCall(`/administration-content/offices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteOffice: (id) => apiCall(`/administration-content/offices/${id}`, {
    method: 'DELETE'
  }),

  // Contacts
  getContacts: () => apiCall('/administration-content/contacts'),
  getContact: (id) => apiCall(`/administration-content/contacts/${id}`),
  createContact: (data) => apiCall('/administration-content/contacts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateContact: (id, data) => apiCall(`/administration-content/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteContact: (id) => apiCall(`/administration-content/contacts/${id}`, {
    method: 'DELETE'
  })
};

// Anti-Ragging Committee API
export const antiRaggingCommitteeAPI = {
  // Complete Page Data
  getComplete: () => apiCall('/anti-ragging-committee/complete'),

  // Header
  getHeader: () => apiCall('/anti-ragging-committee/header'),
  updateHeader: (data) => apiCall('/anti-ragging-committee/header', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Anti-Ragging Committee Members
  getAntiRaggingCommittee: () => apiCall('/anti-ragging-committee/anti-ragging-committee'),
  getAntiRaggingMember: (id) => apiCall(`/anti-ragging-committee/anti-ragging-committee/${id}`),
  createAntiRaggingMember: (data) => apiCall('/anti-ragging-committee/anti-ragging-committee', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateAntiRaggingMember: (id, data) => apiCall(`/anti-ragging-committee/anti-ragging-committee/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteAntiRaggingMember: (id) => apiCall(`/anti-ragging-committee/anti-ragging-committee/${id}`, {
    method: 'DELETE'
  }),

  // Grievance Committee Members
  getGrievanceCommittee: () => apiCall('/anti-ragging-committee/grievance-committee'),
  getGrievanceMember: (id) => apiCall(`/anti-ragging-committee/grievance-committee/${id}`),
  createGrievanceMember: (data) => apiCall('/anti-ragging-committee/grievance-committee', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateGrievanceMember: (id, data) => apiCall(`/anti-ragging-committee/grievance-committee/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteGrievanceMember: (id) => apiCall(`/anti-ragging-committee/grievance-committee/${id}`, {
    method: 'DELETE'
  }),

  // Emergency Contacts
  getEmergencyContacts: () => apiCall('/anti-ragging-committee/emergency-contacts'),
  createEmergencyContact: (data) => apiCall('/anti-ragging-committee/emergency-contacts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateEmergencyContact: (id, data) => apiCall(`/anti-ragging-committee/emergency-contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteEmergencyContact: (id) => apiCall(`/anti-ragging-committee/emergency-contacts/${id}`, {
    method: 'DELETE'
  }),

  // Documents
  getDocuments: (category) => {
    const query = category ? `?category=${category}` : '';
    return apiCall(`/anti-ragging-committee/documents${query}`);
  },
  createDocument: (data) => apiCall('/anti-ragging-committee/documents', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDocument: (id, data) => apiCall(`/anti-ragging-committee/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteDocument: (id) => apiCall(`/anti-ragging-committee/documents/${id}`, {
    method: 'DELETE'
  }),

  // Grievance Submissions
  getGrievanceSubmissions: (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/anti-ragging-committee/grievance-submissions${query}`);
  },
  submitGrievance: (data) => apiCall('/anti-ragging-committee/grievance-submissions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateGrievanceSubmission: (id, data) => apiCall(`/anti-ragging-committee/grievance-submissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Statistics
  getStatistics: () => apiCall('/anti-ragging-committee/statistics')
};

// Mandatory Disclosures API
export const mandatoryDisclosuresAPI = {
  // Complete Page Data
  getComplete: () => apiCall('/mandatory-disclosures/complete'),

  // Header
  getHeader: () => apiCall('/mandatory-disclosures/header'),
  updateHeader: (data) => apiCall('/mandatory-disclosures/header', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Categories
  getCategories: () => apiCall('/mandatory-disclosures/categories'),
  getCategory: (id) => apiCall(`/mandatory-disclosures/categories/${id}`),
  createCategory: (data) => apiCall('/mandatory-disclosures/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCategory: (id, data) => apiCall(`/mandatory-disclosures/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteCategory: (id) => apiCall(`/mandatory-disclosures/categories/${id}`, {
    method: 'DELETE'
  }),

  // Documents
  getDocuments: (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/mandatory-disclosures/documents${query}`);
  },
  getDocumentsByCategory: (slug) => apiCall(`/mandatory-disclosures/documents/category/${slug}`),
  getDocument: (id) => apiCall(`/mandatory-disclosures/documents/${id}`),
  createDocument: (data) => apiCall('/mandatory-disclosures/documents', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDocument: (id, data) => apiCall(`/mandatory-disclosures/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteDocument: (id) => apiCall(`/mandatory-disclosures/documents/${id}`, {
    method: 'DELETE'
  }),

  // Statistics
  getStatistics: () => apiCall('/mandatory-disclosures/statistics')
};

// ============================================================================
// ANNOUNCEMENTS API
// ============================================================================
export const announcementsAPI = {
  // Get all active announcements
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/announcements${query ? '?' + query : ''}`);
  },

  // Get all announcements including inactive (for admin)
  getAllAdmin: () => apiCall('/announcements/all'),

  // Get single announcement
  getById: (id) => apiCall(`/announcements/${id}`),

  // Get categories
  getCategories: () => apiCall('/announcements/meta/categories'),

  // Create announcement (without file)
  create: (data) => apiCall('/announcements', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Create announcement with file upload
  createWithFile: async (formData) => {
    const token = localStorage.getItem('admin_token');
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/announcements`, {
      method: 'POST',
      headers,
      body: formData, // FormData - don't set Content-Type header
      credentials: 'include'
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`API returned non-JSON response. Check if backend is running at ${API_URL}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  },

  // Update announcement (without file)
  update: (id, data) => apiCall(`/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Update announcement with file upload
  updateWithFile: async (id, formData) => {
    const token = localStorage.getItem('admin_token');
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/announcements/${id}`, {
      method: 'PUT',
      headers,
      body: formData, // FormData - don't set Content-Type header
      credentials: 'include'
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`API returned non-JSON response. Check if backend is running at ${API_URL}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  },

  // Delete announcement
  delete: (id) => apiCall(`/announcements/${id}`, {
    method: 'DELETE'
  })
};

// ========================================
// UPLOAD APIs
// ========================================
export const uploadAPI = {
  // Upload hero image
  uploadHeroImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiCallWithFile('/upload/hero-image', formData, { method: 'POST' });
  },

  // Upload vision image
  uploadVisionImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiCallWithFile('/upload/vision-image', formData, { method: 'POST' });
  },

  // Upload mission image
  uploadMissionImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiCallWithFile('/upload/mission-image', formData, { method: 'POST' });
  },

  // Upload logo image
  uploadLogoImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiCallWithFile('/upload/logo-image', formData, { method: 'POST' });
  },

  // Upload banner image
  uploadBannerImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiCallWithFile('/upload/banner-image', formData, { method: 'POST' });
  },

  // Upload general image
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiCallWithFile('/upload/image', formData, { method: 'POST' });
  },

  // Upload document
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCallWithFile('/upload', formData, { method: 'POST' });
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('admin_token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Export BASE_URL for file URLs
export const getBaseURL = () => {
  return BASE_URL;
};

export default {
  home: homeAPI,
  admission: admissionAPI,
  contact: contactAPI,
  academics: academicsAPI,
  placements: placementsAPI,
  auth: authAPI,
  gallery: galleryAPI,
  lifeAtFit: lifeAtFitAPI,
  achievements: achievementsAPI,
  careers: careersAPI,
  administrationContent: administrationContentAPI,
  antiRaggingCommittee: antiRaggingCommitteeAPI,
  mandatoryDisclosures: mandatoryDisclosuresAPI,
  announcements: announcementsAPI,
  upload: uploadAPI
};
