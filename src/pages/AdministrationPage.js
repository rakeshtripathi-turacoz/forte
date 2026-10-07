import React, { useState, useEffect } from 'react';
import Banner from '../components/common/Banner';
import api from '../services/api';
import './AdministrationPage.css';

const AdministrationPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    header: null,
    director: null,
    team: [],
    departments: [],
    offices: [],
    contacts: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await api.administrationContent.getComplete();
      setData(result);
    } catch (error) {
      console.error('Error loading administration page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full fade-in flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full fade-in">
      <Banner
        title={data.header?.title || "Director's Office"}
        subtitle={data.header?.subtitle || "Academic Leadership | Administrative Excellence | Student Support"}
        imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">

        {/* Header Description */}
        {data.header?.description && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Director's Office</h2>
            <div
              className="text-gray-500 administration-header-content"
              dangerouslySetInnerHTML={{ __html: data.header.description }}
            />
          </div>
        )}

        {/* Director Section */}
        {data.director && (
          <section>
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-border_gray">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {data.director.photo_url ? (
                      <img
                        src={data.director.photo_url}
                        alt={data.director.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="fas fa-user-graduate text-6xl text-gray-400"></i>
                    )}
                  </div>
                  <h3 className="font-bold text-xl text-slate">{data.director.name}</h3>
                  <p className="text-crimson font-semibold">{data.director.designation}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-xl font-serif font-bold text-slate mb-4">Director's Office</h3>
                  <div
                    className="text-gray-600 leading-relaxed mb-4 director-office-content"
                    dangerouslySetInnerHTML={{ __html: data.director.office_description }}
                  />
                  {data.director.message_link && (
                    <a
                      href={data.director.message_link}
                      className="inline-block bg-crimson hover:bg-red-800 text-white font-semibold py-2 px-6 rounded transition"
                    >
                      Read Director's Message
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Administrative Team */}
        {data.team.length > 0 && (
          <section>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-6">Administrative Team</h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.team.map((member) => (
                <div key={member.id} className="bg-white p-6 rounded-xl border border-border_gray hover:shadow-card transition">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-crimson/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-user text-2xl text-crimson"></i>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate">{member.name}</h4>
                      <p className="text-crimson text-sm font-semibold">{member.designation}</p>
                      {member.department && (
                        <p className="text-gray-500 text-xs">{member.department}</p>
                      )}
                    </div>
                  </div>
                  {member.responsibilities && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Key Responsibilities:</p>
                      <div
                        className="text-sm text-gray-600 team-responsibilities-content"
                        dangerouslySetInnerHTML={{ __html: member.responsibilities }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Academic Departments */}
        {data.departments.length > 0 && (
          <section>
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-border_gray">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-6">Academic Departments</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 font-semibold text-slate">Department</th>
                      <th className="text-left p-4 font-semibold text-slate">Programs</th>
                      <th className="text-left p-4 font-semibold text-slate">Faculty Strength</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.departments.map((dept) => (
                      <tr key={dept.id}>
                        <td className="p-4 font-medium">{dept.department_name}</td>
                        <td className="p-4 text-crimson">{dept.programs || 'N/A'}</td>
                        <td className="p-4">{dept.faculty_strength ? `${dept.faculty_strength}+` : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Administrative Offices */}
        {data.offices.length > 0 && (
          <section>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-6">Administrative Offices</h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.offices.map((office, index) => {
                const colors = [
                  { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
                  { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
                  { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
                  { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' }
                ];
                const color = colors[index % colors.length];

                return (
                  <div key={office.id} className={`${color.bg} p-4 rounded-lg border ${color.border} text-center`}>
                    <i className={`fas fa-building text-3xl ${color.icon} mb-3`}></i>
                    <h4 className="font-semibold text-slate">{office.office_name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{office.floor}, {office.building}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Contact Information */}
        {data.contacts.length > 0 && (
          <section>
            <div className="bg-slate-50 p-6 sm:p-8 rounded-xl border border-border_gray">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-4">Contact Administration</h3>
              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
                {data.contacts.map((contact) => (
                  <div key={contact.id}>
                    <h4 className="font-semibold text-slate mb-2">{contact.contact_type}</h4>
                    {contact.contact_person && (
                      <p className="text-gray-600 text-sm font-medium">{contact.contact_person}</p>
                    )}
                    <p className="text-gray-600 text-sm">{contact.email}</p>
                    {contact.phone && (
                      <p className="text-gray-600 text-sm">{contact.phone}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default AdministrationPage;
