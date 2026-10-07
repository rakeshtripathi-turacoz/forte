import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../components/common/Banner';
import { announcementsAPI, getBaseURL } from '../services/api';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementsAPI.getAll();
      if (response.success) {
        setAnnouncements(response.data);
      }
    } catch (err) {
      setError('Failed to load announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Hardcoded backup data (will be removed once database is populated)
  const backupAnnouncements = [
    {
      date: 'Dec 1, 2024',
      title: 'Admissions Open for Academic Year 2025-26',
      description: 'Apply now for undergraduate and postgraduate programs. Early bird discounts available for early applicants. Visit the admission office or apply online.',
      category: 'Admission',
      link: '/admission'
    },
    {
      date: 'Nov 28, 2024',
      title: 'Research Excellence Award 2024',
      description: 'Forte Institute of Technology receives recognition for outstanding research contributions in the field of technology and education.',
      category: 'Achievement',
      link: '/research'
    },
    {
      date: 'Nov 25, 2024',
      title: 'Industry Partnership with Tech Giants',
      description: 'New collaboration agreements signed with leading technology companies for internships, placements, and research opportunities.',
      category: 'Partnership',
      link: '/placements'
    },
    {
      date: 'Nov 20, 2024',
      title: 'Annual Sports Meet 2024',
      description: 'Register now for the annual sports meet. Events include athletics, cricket, football, basketball, and indoor games.',
      category: 'Event',
      link: '#'
    },
    {
      date: 'Nov 15, 2024',
      title: 'Guest Lecture Series - AI & Machine Learning',
      description: 'Distinguished professors from IITs will deliver lectures on latest trends in Artificial Intelligence and Machine Learning.',
      category: 'Academic',
      link: '#'
    },
    {
      date: 'Nov 10, 2024',
      title: 'Examination Schedule Released',
      description: 'End semester examination schedule for all programs has been released. Students can download the datesheet from the academic section.',
      category: 'Examination',
      link: '/academics'
    },
    {
      date: 'Nov 5, 2024',
      title: 'Campus Placement Drive - TCS',
      description: 'TCS is visiting our campus for recruitment. Eligible students from MCA and MBA programs can register through the placement cell.',
      category: 'Placement',
      link: '/placements'
    },
    {
      date: 'Oct 30, 2024',
      title: 'National Conference on Digital Education',
      description: 'Register for the upcoming national conference on digital transformation in education. Paper submissions are open.',
      category: 'Conference',
      link: '/research'
    },
    {
      date: 'Oct 25, 2024',
      title: 'Scholarship Applications Open',
      description: 'Merit-based and need-based scholarship applications are now open for the current academic year. Apply before the deadline.',
      category: 'Scholarship',
      link: '/admission'
    },
    {
      date: 'Oct 20, 2024',
      title: 'Workshop on Entrepreneurship',
      description: 'A two-day workshop on entrepreneurship and startup ecosystem in collaboration with Startup India initiative.',
      category: 'Workshop',
      link: '#'
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'Admission': 'bg-green-100 text-green-700',
      'Achievement': 'bg-gold/20 text-yellow-700',
      'Partnership': 'bg-blue-100 text-blue-700',
      'Event': 'bg-purple-100 text-purple-700',
      'Academic': 'bg-crimson/10 text-crimson',
      'Examination': 'bg-orange-100 text-orange-700',
      'Placement': 'bg-teal-100 text-teal-700',
      'Conference': 'bg-indigo-100 text-indigo-700',
      'Scholarship': 'bg-pink-100 text-pink-700',
      'Workshop': 'bg-cyan-100 text-cyan-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  // Use backup data if no announcements from database
  const displayAnnouncements = announcements.length > 0 ? announcements : backupAnnouncements;

  if (loading) {
    return (
      <div className="h-full w-full fade-in">
        <Banner
          title="Announcements"
          subtitle="Latest News, Updates & Events"
          imageSrc="https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
        />
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full fade-in">
      <Banner
        title="Announcements"
        subtitle="Latest News, Updates & Events"
        imageSrc="https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3">All Announcements</h2>
          <p className="text-gray-500">Stay updated with the latest news, events, and important notices from Forte Institute of Technology.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-600 mr-3"></i>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {displayAnnouncements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <i className="fas fa-bullhorn text-gray-300 text-5xl mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Announcements Available</h3>
            <p className="text-gray-500">Check back later for updates and announcements.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayAnnouncements.map((announcement, index) => (
              <div
                key={announcement.id || index}
                className="block bg-white p-6 rounded-xl border border-border_gray hover:shadow-card transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(announcement.category)}`}>
                      {announcement.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {announcement.announcement_date ? formatDate(announcement.announcement_date) : announcement.date}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate mb-2">{announcement.title}</h3>
                {announcement.description && (
                  <div
                    className="text-gray-600 mb-3"
                    dangerouslySetInnerHTML={{ __html: announcement.description }}
                  />
                )}

                {/* Display attachment and links */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {announcement.attachment_url && (
                    <a
                      href={`${getBaseURL()}${announcement.attachment_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fas fa-paperclip"></i>
                      <span className="text-sm font-medium">{announcement.attachment_name || 'Download Attachment'}</span>
                      <i className="fas fa-download text-xs"></i>
                    </a>
                  )}

                  {announcement.link_url && announcement.link_url !== '#' && (
                    <Link
                      to={announcement.link_url}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-crimson hover:bg-red-800 text-white rounded-lg transition"
                    >
                      <span className="text-sm font-medium">Read More</span>
                      <i className="fas fa-arrow-right text-xs"></i>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-block bg-slate hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            <i className="fas fa-home mr-2"></i>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
