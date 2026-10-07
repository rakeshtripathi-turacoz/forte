import React from 'react';
import Banner from '../components/common/Banner';

const ResearchPage = () => {
  const facultyPublications = [
    { title: 'Artificial Intelligence in Business Decision Making', authors: 'Dr. A. Kumar, Dr. B. Sharma', journal: 'Journal of Business Analytics', year: '2024' },
    { title: 'Digital Transformation in Education', authors: 'Prof. C. Gupta, Dr. D. Singh', journal: 'International Journal of Educational Technology', year: '2024' },
    { title: 'Machine Learning Applications in Financial Services', authors: 'Dr. E. Verma, Prof. F. Joshi', journal: 'Finance and Technology Review', year: '2023' },
    { title: 'Modern Pedagogical Approaches in Teacher Education', authors: 'Dr. G. Patil, Dr. H. Yadav', journal: 'Educational Research Journal', year: '2023' },
    { title: 'E-Commerce Growth and Consumer Behavior', authors: 'Prof. I. Pandey, Dr. J. Mishra', journal: 'Commerce and Management Review', year: '2023' }
  ];

  const innovationMembers = [
    { name: 'Dr. [Faculty Name]', position: 'President', department: 'Computer Sciences' },
    { name: 'Prof. [Faculty Name]', position: 'Vice President', department: 'Business Studies' },
    { name: 'Dr. [Faculty Name]', position: 'Secretary', department: 'Education' },
    { name: '[Student Name]', position: 'Student Coordinator', department: 'Commerce' },
    { name: '[Student Name]', position: 'Student Member', department: 'Computer Sciences' }
  ];

  const conferences = [
    {
      title: 'International Conference on Digital Education',
      date: 'March 2024',
      papers: 25,
      participants: 150,
      theme: 'AI and Technology in Modern Education'
    },
    {
      title: 'National Symposium on Business Innovation',
      date: 'September 2023',
      papers: 18,
      participants: 120,
      theme: 'Entrepreneurship and Startup Ecosystem'
    },
    {
      title: 'Workshop on Modern Teaching Methodologies',
      date: 'January 2024',
      papers: 12,
      participants: 80,
      theme: 'Digital Transformation in Education'
    }
  ];

  return (
    <div className="h-full w-full  fade-in">
      <Banner 
        title="Research & Development"
        subtitle="Innovation Hub | Academic Excellence | Cutting-Edge Research"
        imageSrc="https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">
        
        {/* Faculty Publications */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Faculty Publications</h2>
            <p className="text-gray-500">Research papers and scholarly contributions by our faculty members.</p>
          </div>

          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray">
            <div className="space-y-6">
              {facultyPublications.map((publication, index) => (
                <div key={index} className="border-l-4 border-crimson pl-6 bg-gray-50 p-4 rounded-r-lg">
                  <h3 className="font-semibold text-slate mb-2">{publication.title}</h3>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-medium">Authors:</span> {publication.authors}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-medium">Published in:</span> {publication.journal}
                  </p>
                  <p className="text-gray-500 text-sm">
                    <span className="font-medium">Year:</span> {publication.year}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button className="bg-crimson text-white px-3 py-1 text-xs rounded hover:bg-red-800 transition">
                      <i className="fas fa-download mr-1"></i> Download PDF
                    </button>
                    <button className="bg-gray-200 text-gray-700 px-3 py-1 text-xs rounded hover:bg-gray-300 transition">
                      <i className="fas fa-quote-right mr-1"></i> Cite
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button className="bg-slate hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition">
                <i className="fas fa-book mr-2"></i>
                View All Publications
              </button>
            </div>
          </div>
        </section>

        {/* Institution Innovation Cell */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Institution Innovation Cell</h2>
            <p className="text-gray-500">Fostering innovation and entrepreneurship among students and faculty.</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray">
              <h3 className="text-lg sm:text-xl font-bold text-crimson mb-3 sm:mb-4">About IIC</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                The Institution Innovation Cell (IIC) is a dedicated platform established to promote innovation and
                entrepreneurship within our academic community. We organize workshops, ideation sessions, and
                mentorship programs to encourage creative thinking and practical problem-solving approaches among
                students and faculty members.
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Key Initiatives</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Innovation challenges and competitions</li>
                    <li>• Startup incubation programs</li>
                    <li>• Industry-academia collaboration</li>
                    <li>• Patent filing assistance and support</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Success Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-green-700 text-center">
                    <div>
                      <div className="text-lg font-bold">50+</div>
                      <div className="text-xs">Project Ideas</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">15</div>
                      <div className="text-xs">Patents Filed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray">
              <h3 className="text-lg sm:text-xl font-bold text-crimson mb-4 sm:mb-6">IIC Committee Members</h3>
              
              <div className="space-y-4">
                {innovationMembers.map((member, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-crimson rounded-full flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.position}</p>
                      <p className="text-xs text-gray-500">{member.department}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button className="bg-gold hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition">
                  <i className="fas fa-users mr-2"></i>
                  Join IIC
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Conferences */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Conferences & Events</h2>
            <p className="text-gray-500">Academic conferences and research symposiums organized by the institute.</p>
          </div>

          <div className="space-y-6">
            {conferences.map((conference, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray">
                <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center">
                  <div className="md:col-span-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate mb-2">{conference.title}</h3>
                    <p className="text-gray-600 mb-3">{conference.theme}</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                      <span><i className="fas fa-calendar text-crimson mr-1"></i> {conference.date}</span>
                      <span><i className="fas fa-file-alt text-crimson mr-1"></i> {conference.papers} Papers</span>
                      <span><i className="fas fa-users text-crimson mr-1"></i> {conference.participants} Participants</span>
                    </div>
                  </div>
                  
                  <div className="text-center md:text-right">
                    <button className="bg-crimson hover:bg-red-800 text-white font-bold py-2 px-4 rounded transition mb-2">
                      <i className="fas fa-download mr-2"></i>
                      Proceedings
                    </button>
                    <br />
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded transition text-sm">
                      <i className="fas fa-images mr-2"></i>
                      Gallery
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="bg-slate hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition">
              <i className="fas fa-plus mr-2"></i>
              Upcoming Conferences
            </button>
          </div>
        </section>

        {/* Research Facilities */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Research Facilities</h2>
            <p className="text-gray-500">State-of-the-art research infrastructure supporting cutting-edge research.</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray text-center">
              <div className="w-16 h-16 bg-crimson rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-microscope text-white text-2xl"></i>
              </div>
              <h4 className="font-bold text-slate mb-2 text-sm sm:text-base">Advanced Research Labs</h4>
              <p className="text-xs sm:text-sm text-gray-500">Well-equipped laboratories with latest equipment</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray text-center">
              <div className="w-16 h-16 bg-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-database text-white text-2xl"></i>
              </div>
              <h4 className="font-bold text-slate mb-2 text-sm sm:text-base">Digital Library</h4>
              <p className="text-xs sm:text-sm text-gray-500">Access to international journals and databases</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray text-center">
              <div className="w-16 h-16 bg-slate rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-wifi text-white text-2xl"></i>
              </div>
              <h4 className="font-bold text-slate mb-2 text-sm sm:text-base">High-Speed Internet</h4>
              <p className="text-xs sm:text-sm text-gray-500">Campus-wide connectivity for research activities</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray text-center">
              <div className="w-16 h-16 bg-crimson rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-handshake text-white text-2xl"></i>
              </div>
              <h4 className="font-bold text-slate mb-2 text-sm sm:text-base">Industry Partnerships</h4>
              <p className="text-xs sm:text-sm text-gray-500">Collaborative research with industry partners</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ResearchPage;