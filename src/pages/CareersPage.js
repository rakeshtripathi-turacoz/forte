import React, { useState, useEffect } from 'react';
import Banner from '../components/common/Banner';
import { careersAPI } from '../services/api';

const CareersPage = () => {
  const [loading, setLoading] = useState(true);
  const [header, setHeader] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [openings, setOpenings] = useState([]);
  const [appSteps, setAppSteps] = useState([]);
  const [generalApp, setGeneralApp] = useState(null);
  const [hrContacts, setHRContacts] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [headerRes, benefitsRes, openingsRes, stepsRes, generalRes, contactsRes] = await Promise.all([
        careersAPI.getHeader(),
        careersAPI.getBenefits(),
        careersAPI.getOpenings({ status: 'Open' }),
        careersAPI.getApplicationSteps(),
        careersAPI.getGeneralApplication(),
        careersAPI.getHRContacts()
      ]);

      if (headerRes.success && headerRes.data) {
        setHeader(headerRes.data);
      }

      if (benefitsRes.success) {
        setBenefits(benefitsRes.data);
      }

      if (openingsRes.success) {
        setOpenings(openingsRes.data);
      }

      if (stepsRes.success) {
        setAppSteps(stepsRes.data);
      }

      if (generalRes.success && generalRes.data) {
        setGeneralApp(generalRes.data);
      }

      if (contactsRes.success) {
        setHRContacts(contactsRes.data);
      }
    } catch (error) {
      console.error('Error fetching careers page data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group HR contacts by type
  const groupedContacts = hrContacts.reduce((acc, contact) => {
    if (!acc[contact.contact_type]) {
      acc[contact.contact_type] = [];
    }
    acc[contact.contact_type].push(contact);
    return acc;
  }, {});

  return (
    <div className="h-full w-full fade-in">
      <Banner
        title="Careers"
        subtitle="Join Our Team | Grow With Us | Shape the Future"
        imageSrc="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">

        {/* Page Header */}
        {header && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">{header.title}</h2>
            <div className="text-gray-500" dangerouslySetInnerHTML={{ __html: header.subtitle }}></div>
          </div>
        )}

        {/* Why Join Us */}
        {benefits.length > 0 && (
          <section>
            <div className="bg-crimson/5 p-6 sm:p-8 rounded-xl border border-crimson/20">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-6 text-center">Why Join FIT?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit.id} className="text-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ backgroundColor: benefit.icon_bg_color }}
                    >
                      <i className={`${benefit.icon} text-xl text-white`}></i>
                    </div>
                    <h4 className="font-semibold text-slate text-sm mb-1">{benefit.title}</h4>
                    {benefit.description && (
                      <div className="text-gray-500 text-xs" dangerouslySetInnerHTML={{ __html: benefit.description }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Current Openings */}
        <section>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-6">Current Openings</h3>
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson"></i>
              <p className="text-gray-500 mt-4">Loading job openings...</p>
            </div>
          ) : openings.length > 0 ? (
            <div className="space-y-4">
              {openings.map((position) => (
                <div key={position.id} className="bg-white p-6 rounded-xl border border-border_gray hover:shadow-card transition">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg text-slate">{position.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          position.status === 'Open' ? 'bg-green-100 text-green-700' :
                          position.status === 'Filled' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {position.status}
                        </span>
                      </div>
                      <p className="text-crimson text-sm font-medium mb-2">{position.department}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span><i className="fas fa-briefcase mr-1"></i>{position.employment_type}</span>
                        {position.experience_required && (
                          <span><i className="fas fa-clock mr-1"></i>{position.experience_required}</span>
                        )}
                        {position.qualification_required && (
                          <span>
                            <i className="fas fa-graduation-cap mr-1"></i>
                            <span dangerouslySetInnerHTML={{ __html: position.qualification_required }}></span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {position.posted_date && (
                        <span className="text-xs text-gray-400">
                          Posted: {new Date(position.posted_date).toLocaleDateString()}
                        </span>
                      )}
                      {position.apply_url ? (
                        <a
                          href={position.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-crimson hover:bg-red-800 text-white font-semibold py-2 px-6 rounded transition text-sm"
                        >
                          Apply Now
                        </a>
                      ) : (
                        <button className="bg-crimson hover:bg-red-800 text-white font-semibold py-2 px-6 rounded transition text-sm">
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No current openings available. Please check back later!</p>
          )}
        </section>

        {/* Application Process */}
        {appSteps.length > 0 && (
          <section>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-6">Application Process</h3>
            <div className={`grid sm:grid-cols-1 md:grid-cols-${Math.min(appSteps.length, 4)} gap-4`}>
              {appSteps.map((step) => (
                <div key={step.id} className="bg-white p-6 rounded-xl border border-border_gray text-center relative">
                  <div className="w-10 h-10 bg-crimson text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    {step.step_number}
                  </div>
                  <h4 className="font-semibold text-slate mb-2">{step.step_title}</h4>
                  <div className="text-gray-500 text-sm" dangerouslySetInnerHTML={{ __html: step.step_description }}></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* General Application */}
        {generalApp && (
          <section>
            <div className="bg-slate text-white p-6 sm:p-8 rounded-xl">
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold mb-4">{generalApp.section_title}</h3>
                  <div className="text-white/80 mb-4" dangerouslySetInnerHTML={{ __html: generalApp.section_description }}></div>
                  {generalApp.additional_info && (
                    <div className="text-white/70 text-sm mb-4" dangerouslySetInnerHTML={{ __html: generalApp.additional_info }}></div>
                  )}
                  {(generalApp.contact_email || generalApp.contact_phone) && (
                    <ul className="text-white/70 text-sm space-y-2">
                      {generalApp.contact_email && (
                        <li><i className="fas fa-envelope mr-2"></i>{generalApp.contact_email}</li>
                      )}
                      {generalApp.contact_phone && (
                        <li><i className="fas fa-phone mr-2"></i>{generalApp.contact_phone}</li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="text-center md:text-right">
                  {generalApp.button_link ? (
                    <a
                      href={generalApp.button_link}
                      className="inline-block bg-white text-slate hover:bg-gray-100 font-semibold py-3 px-8 rounded transition"
                    >
                      <i className="fas fa-paper-plane mr-2"></i>
                      {generalApp.button_text || 'Send Your Resume'}
                    </a>
                  ) : (
                    <button className="inline-block bg-white text-slate hover:bg-gray-100 font-semibold py-3 px-8 rounded transition">
                      <i className="fas fa-paper-plane mr-2"></i>
                      {generalApp.button_text || 'Send Your Resume'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contact HR */}
        {hrContacts.length > 0 && (
          <section>
            <div className="bg-gray-50 p-6 sm:p-8 rounded-xl border border-gray-200">
              <h3 className="text-xl font-serif font-bold text-slate mb-4">Human Resources Department</h3>
              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
                {Object.keys(groupedContacts).map((type) => (
                  <div key={type}>
                    {groupedContacts[type].map((contact) => (
                      <div key={contact.id}>
                        <h4 className="font-semibold text-slate mb-2">{contact.contact_title}</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-line">
                          {contact.contact_details}
                        </p>
                      </div>
                    ))}
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

export default CareersPage;
