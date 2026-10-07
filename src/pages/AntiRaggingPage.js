import React, { useState, useEffect } from 'react';
import Banner from '../components/common/Banner';
import { academicsAPI, antiRaggingCommitteeAPI } from '../services/api';

const AntiRaggingPage = () => {
  const [policyData, setPolicyData] = useState(null);
  const [headerData, setHeaderData] = useState(null);
  const [antiRaggingMembers, setAntiRaggingMembers] = useState([]);
  const [grievanceMembers, setGrievanceMembers] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load header data
      const headerResponse = await antiRaggingCommitteeAPI.getHeader();
      if (headerResponse.success && headerResponse.data) {
        setHeaderData(headerResponse.data);
      }

      // Load Anti-Ragging Committee members
      const arcResponse = await antiRaggingCommitteeAPI.getAntiRaggingCommittee();
      if (arcResponse.success && arcResponse.data) {
        setAntiRaggingMembers(arcResponse.data);
      }

      // Load Grievance Committee members
      const gcResponse = await antiRaggingCommitteeAPI.getGrievanceCommittee();
      if (gcResponse.success && gcResponse.data) {
        setGrievanceMembers(gcResponse.data);
      }

      // Load Emergency Contacts
      const ecResponse = await antiRaggingCommitteeAPI.getEmergencyContacts();
      if (ecResponse.success && ecResponse.data) {
        setEmergencyContacts(ecResponse.data);
      }

      // Load policy data (old data for backward compatibility)
      const response = await academicsAPI.getAntiRaggingPolicy();
      if (response.success && response.data) {
        setPolicyData(response.data);
      }
    } catch (error) {
      console.error('Error loading anti-ragging data:', error);
      setError('Failed to load anti-ragging data');
    } finally {
      setLoading(false);
    }
  };

  // Parse acts_list JSON string to array
  const getActsList = () => {
    if (!policyData?.acts_list) return [];
    try {
      return typeof policyData.acts_list === 'string'
        ? JSON.parse(policyData.acts_list)
        : policyData.acts_list;
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="h-full w-full fade-in">
      <Banner
        title={headerData?.title || "Anti-Ragging & Grievance Committee"}
        subtitle={headerData?.subtitle || "Ensuring a Safe and Supportive Campus Environment"}
        imageSrc="https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">

        {/* Header Description */}
        {headerData?.description && (
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-border_gray">
            <div
              className="text-xs sm:text-sm text-gray-600 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{ __html: headerData.description }}
            />
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
            <p className="text-gray-600">Loading anti-ragging policy...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && policyData && (
          <>
            {/* Anti-Ragging Policy */}
            <section>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-ban text-white text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-red-700 mb-4">Anti-Ragging Policy</h2>
                    <div
                      className="text-xs sm:text-sm text-gray-600 leading-relaxed prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: policyData.policy_content }}
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* What Constitutes Ragging - Dynamic from Database */}
        {!loading && !error && policyData && getActsList().length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate mb-6">What Constitutes Ragging?</h2>
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-border_gray">
              <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
                {getActsList().map((act, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <i className="fas fa-exclamation-triangle text-red-500 mt-1 flex-shrink-0"></i>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}


        {/* Anti-Ragging Committee Members */}
        {!loading && antiRaggingMembers.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate mb-6">Anti-Ragging Committee</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {antiRaggingMembers.map((member) => (
                <div key={member.id} className="bg-white p-6 rounded-xl border border-border_gray hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.member_name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <i className="fas fa-user text-blue-600 text-2xl"></i>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-slate text-sm">{member.member_name}</h3>
                      <p className="text-xs text-gray-600">{member.designation}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{member.role}</span>
                      {member.department && <p className="text-xs text-gray-500 mt-1">{member.department}</p>}
                      {member.phone && <p className="text-xs text-gray-600 mt-2"><i className="fas fa-phone mr-1"></i>{member.phone}</p>}
                      {member.email && <p className="text-xs text-gray-600"><i className="fas fa-envelope mr-1"></i>{member.email}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Grievance Committee Members */}
        {!loading && grievanceMembers.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate mb-6">Grievance Committee</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grievanceMembers.map((member) => (
                <div key={member.id} className="bg-white p-6 rounded-xl border border-border_gray hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.member_name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <i className="fas fa-user text-green-600 text-2xl"></i>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-slate text-sm">{member.member_name}</h3>
                      <p className="text-xs text-gray-600">{member.designation}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{member.role}</span>
                      {member.department && <p className="text-xs text-gray-500 mt-1">{member.department}</p>}
                      {member.phone && <p className="text-xs text-gray-600 mt-2"><i className="fas fa-phone mr-1"></i>{member.phone}</p>}
                      {member.email && <p className="text-xs text-gray-600"><i className="fas fa-envelope mr-1"></i>{member.email}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Emergency Contacts */}
        {!loading && emergencyContacts.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate mb-6">Emergency Contacts</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-phone-alt text-white text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate text-base sm:text-lg">{contact.contact_type}</h3>
                      {contact.contact_name && <p className="text-xs sm:text-sm text-gray-600 mb-2">{contact.contact_name}</p>}
                      <p className="text-xl sm:text-2xl font-bold text-red-600 mb-2">{contact.phone}</p>
                      {contact.email && <p className="text-xs sm:text-sm text-gray-600 mb-2"><i className="fas fa-envelope mr-1"></i>{contact.email}</p>}
                      <p className="text-xs text-gray-500 mb-2"><i className="fas fa-clock mr-1"></i>{contact.available_hours}</p>
                      {contact.description && (
                        <div className="text-xs sm:text-sm text-gray-600 mt-3" dangerouslySetInnerHTML={{ __html: contact.description }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default AntiRaggingPage;
