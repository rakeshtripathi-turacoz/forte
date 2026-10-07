import React, { useState, useEffect } from 'react';
import Banner from '../components/common/Banner';
import { achievementsAPI } from '../services/api';

const AchievementsPage = () => {
  const [loading, setLoading] = useState(true);
  const [institutionalAwards, setInstitutionalAwards] = useState([]);
  const [studentAchievements, setStudentAchievements] = useState([]);
  const [facultyAchievements, setFacultyAchievements] = useState([]);
  const [placementHighlights, setPlacementHighlights] = useState([]);
  const [recognitions, setRecognitions] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [institutional, student, faculty, placements, recog] = await Promise.all([
        achievementsAPI.getInstitutionalAwards(),
        achievementsAPI.getStudentAchievements(),
        achievementsAPI.getFacultyAchievements(),
        achievementsAPI.getPlacementHighlights(new Date().getFullYear().toString()),
        achievementsAPI.getRecognitions()
      ]);

      if (institutional.success) {
        setInstitutionalAwards(institutional.data);
      }

      if (student.success) {
        setStudentAchievements(student.data);
      }

      if (faculty.success) {
        setFacultyAchievements(faculty.data);
      }

      if (placements.success) {
        setPlacementHighlights(placements.data);
      }

      if (recog.success) {
        setRecognitions(recog.data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full fade-in">
      <Banner
        title="Achievements and Awards"
        subtitle="Excellence | Recognition | Success Stories"
        imageSrc="https://images.unsplash.com/photo-1567521464027-f127ff144326?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">

        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Our Achievements</h2>
          <p className="text-gray-500">
            Forte Institute of Technology takes pride in the achievements of its students, faculty, and the institution
            as a whole. Here we celebrate our milestones and success stories.
          </p>
        </div>

        {/* Institutional Awards */}
        <section>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-6">Institutional Awards</h3>
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              <p className="text-gray-500 mt-4">Loading awards...</p>
            </div>
          ) : institutionalAwards.length > 0 ? (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {institutionalAwards.map((award) => (
                <div key={award.id} className="bg-gradient-to-br from-gold/20 to-yellow-50 p-6 rounded-xl border border-yellow-200 text-center hover:shadow-card transition">
                  <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className={`${award.icon} text-2xl text-white`}></i>
                  </div>
                  <div className="text-sm text-crimson font-semibold mb-1">{award.year}</div>
                  <h4 className="font-bold text-slate mb-2">{award.title}</h4>
                  <p className="text-gray-500 text-sm">{award.organization}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No institutional awards available.</p>
          )}
        </section>

        {/* Student Achievements */}
        <section>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-6">Student Achievements</h3>
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
            </div>
          ) : studentAchievements.length > 0 ? (
            <div className="space-y-6">
              {studentAchievements.map((category) => (
                <div key={category.category_name} className="bg-white p-6 rounded-xl border border-border_gray">
                  <h4 className="font-bold text-crimson mb-4 flex items-center">
                    <i className={`${category.category_icon} mr-2`}></i>
                    {category.category_name}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-3 font-semibold text-slate">Event/Competition</th>
                          <th className="text-left p-3 font-semibold text-slate">Participants</th>
                          <th className="text-left p-3 font-semibold text-slate">Achievement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {category.achievements.map((item) => (
                          <tr key={item.id}>
                            <td className="p-3">{item.event_name}</td>
                            <td className="p-3 text-gray-600">{item.participants}</td>
                            <td className="p-3">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                                {item.prize}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No student achievements available.</p>
          )}
        </section>

        {/* Faculty Achievements */}
        <section>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-6">Faculty Achievements</h3>
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
            </div>
          ) : facultyAchievements.length > 0 ? (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
              {facultyAchievements.map((faculty) => (
                <div key={faculty.id} className="bg-white p-6 rounded-xl border border-border_gray flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-user-tie text-white"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate">{faculty.faculty_name}</h4>
                    <p className="text-xs text-crimson mb-2">{faculty.department} Department</p>
                    <p className="text-gray-600 text-sm">{faculty.achievement_text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No faculty achievements available.</p>
          )}
        </section>

        {/* Placement Highlights */}
        <section>
          <div className="bg-slate text-white p-6 sm:p-8 rounded-xl">
            <h3 className="text-xl sm:text-2xl font-serif font-bold mb-6 text-center">Placement Highlights {new Date().getFullYear()}</h3>
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-white"></i>
              </div>
            ) : placementHighlights.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {placementHighlights.map((item) => (
                  <div key={item.id} className="bg-white/10 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-gold text-lg mb-1">{item.company_name}</h4>
                    <p className="text-white/80 text-sm">{item.package}</p>
                    <p className="text-white/60 text-xs">{item.students_placed} Students Placed</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-white/70 py-8">No placement highlights available.</p>
            )}
            <div className="text-center mt-6">
              <a
                href="/placements"
                className="inline-block bg-crimson hover:bg-red-800 text-white font-semibold py-2 px-6 rounded transition"
              >
                View All Placements
              </a>
            </div>
          </div>
        </section>

        {/* Recognition Wall */}
        <section>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-6">Recognition & Accreditations</h3>
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
            </div>
          ) : recognitions.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recognitions.map((recognition) => (
                <div key={recognition.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <span className="font-bold text-lg" style={{ color: recognition.badge_color }}>
                      {recognition.short_name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{recognition.description || recognition.full_name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recognitions available.</p>
          )}
        </section>

      </div>
    </div>
  );
};

export default AchievementsPage;
