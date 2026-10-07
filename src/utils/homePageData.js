// Default home page data
export const defaultHomePageData = {
  hero: {
    title: "Welcome to",
    subtitle: "Forte Institute of Technology",
    description: "Shaping the leaders of tomorrow through excellence in academics, innovation, and research since 1998.",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    buttons: {
      primary: {
        text: "Admission Enquiry",
        enabled: true
      },
      secondary: {
        text: "Academic Programs",
        link: "/academics",
        enabled: true
      }
    }
  },

  stats: [
    { number: '10+', label: 'Academic Programs' },
    { number: '5000+', label: 'Students' },
    { number: '200+', label: 'Faculty Members' },
    { number: '90%+', label: 'Placement Rate' }
  ],

  featuredPrograms: [
    {
      title: 'Computer Sciences',
      description: 'BCA, B.Sc.(CS), MCA - Software development and IT programs',
      icon: 'fas fa-laptop-code',
      link: '/academics'
    },
    {
      title: 'Business Studies',
      description: 'BBA, MBA - Management and business leadership programs',
      icon: 'fas fa-briefcase',
      link: '/academics'
    },
    {
      title: 'Education',
      description: 'B.Ed, M.Ed, B.P.Ed - Teacher training and physical education',
      icon: 'fas fa-chalkboard-teacher',
      link: '/academics'
    },
    {
      title: 'Commerce & Arts',
      description: 'B.Com, BA, B.Sc. - Foundation programs in commerce, arts and sciences',
      icon: 'fas fa-book-open',
      link: '/academics'
    }
  ],

  announcements: [
    { date: 'Dec 1, 2024', title: 'Admissions Open for Academic Year 2025-26', link: '/admission' },
    { date: 'Nov 28, 2024', title: 'Research Excellence Award 2024', link: '/research' },
    { date: 'Nov 25, 2024', title: 'Industry Partnership with Tech Giants', link: '/placements' },
    { date: 'Nov 20, 2024', title: 'Annual Sports Meet 2024', link: '#' },
    { date: 'Nov 15, 2024', title: 'Guest Lecture Series - AI & Machine Learning', link: '#' },
    { date: 'Nov 10, 2024', title: 'Examination Schedule Released', link: '/academics' },
    { date: 'Nov 5, 2024', title: 'Campus Placement Drive - TCS', link: '/placements' },
    { date: 'Oct 30, 2024', title: 'National Conference on Digital Education', link: '/research' },
    { date: 'Oct 25, 2024', title: 'Scholarship Applications Open', link: '/admission' },
    { date: 'Oct 20, 2024', title: 'Workshop on Entrepreneurship', link: '#' }
  ],

  testimonials: [
    {
      rating: 5,
      text: "The faculty at Forte Institute is exceptional. They not only taught us the curriculum but also prepared us for real-world challenges. I got placed in TCS during campus placements.",
      name: "Rahul Kumar",
      designation: "MCA, Batch 2023",
      avatar: "RK"
    },
    {
      rating: 5,
      text: "Forte Institute provided me with excellent infrastructure and learning environment. The practical exposure and industry visits helped me understand the corporate world better.",
      name: "Priya Sharma",
      designation: "MBA, Batch 2022",
      avatar: "PS"
    },
    {
      rating: 5,
      text: "The B.Ed program at Forte was comprehensive and well-structured. The teaching practice sessions and workshops prepared me well for my teaching career.",
      name: "Amit Verma",
      designation: "B.Ed, Batch 2023",
      avatar: "AV"
    }
  ],

  cta: {
    title: "Ready to Start Your Journey?",
    description: "Join thousands of successful graduates who started their careers at Forte Institute of Technology. Your future begins here.",
    buttons: {
      primary: {
        text: "Admission Enquiry",
        enabled: true
      },
      secondary: {
        text: "Learn More About Us",
        link: "/about",
        enabled: true
      }
    }
  }
};

// LocalStorage key
const STORAGE_KEY = 'forte_home_page_data';

// Get home page data from localStorage or return default
export const getHomePageData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Validate and merge with defaults to ensure all properties exist
      return {
        hero: parsed.hero || defaultHomePageData.hero,
        stats: parsed.stats || defaultHomePageData.stats,
        featuredPrograms: parsed.featuredPrograms || defaultHomePageData.featuredPrograms,
        announcements: parsed.announcements || defaultHomePageData.announcements,
        testimonials: parsed.testimonials || defaultHomePageData.testimonials,
        cta: parsed.cta || defaultHomePageData.cta
      };
    }
  } catch (error) {
    console.error('Error loading home page data:', error);
  }
  return defaultHomePageData;
};

// Save home page data to localStorage
export const saveHomePageData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving home page data:', error);
    return false;
  }
};

// Reset to default data
export const resetHomePageData = () => {
  localStorage.removeItem(STORAGE_KEY);
  return defaultHomePageData;
};
