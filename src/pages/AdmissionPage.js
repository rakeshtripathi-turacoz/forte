import React, { useState, useEffect } from 'react';
import Banner from '../components/common/Banner';
import API_CONFIG from '../config/api.config';

const API_URL = API_CONFIG.API_URL;

const AdmissionPage = () => {
  const [activeSection, setActiveSection] = useState('process');
  const [loading, setLoading] = useState(true);

  // State for all data
  const [headerData, setHeaderData] = useState(null);
  const [ugPrograms, setUgPrograms] = useState([]);
  const [pgPrograms, setPgPrograms] = useState([]);
  const [ugSteps, setUgSteps] = useState([]);
  const [pgSteps, setPgSteps] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [paymentGuidelines, setPaymentGuidelines] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentGuidelines, setDocumentGuidelines] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [affiliations, setAffiliations] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        headerRes,
        ugProgramsRes,
        pgProgramsRes,
        ugStepsRes,
        pgStepsRes,
        paymentInfoRes,
        paymentOptionsRes,
        paymentGuidelinesRes,
        documentsRes,
        documentGuidelinesRes,
        contactsRes,
        affiliationsRes
      ] = await Promise.all([
        fetch(`${API_URL}/admission/header`),
        fetch(`${API_URL}/admission/programs?level=UG`),
        fetch(`${API_URL}/admission/programs?level=PG`),
        fetch(`${API_URL}/admission/process-steps?level=UG`),
        fetch(`${API_URL}/admission/process-steps?level=PG`),
        fetch(`${API_URL}/admission/payment-info`),
        fetch(`${API_URL}/admission/payment-options`),
        fetch(`${API_URL}/admission/payment-guidelines`),
        fetch(`${API_URL}/admission/documents`),
        fetch(`${API_URL}/admission/document-guidelines`),
        fetch(`${API_URL}/admission/contacts`),
        fetch(`${API_URL}/admission/affiliations`)
      ]);

      const [
        headerData,
        ugProgramsData,
        pgProgramsData,
        ugStepsData,
        pgStepsData,
        paymentInfoData,
        paymentOptionsData,
        paymentGuidelinesData,
        documentsData,
        documentGuidelinesData,
        contactsData,
        affiliationsData
      ] = await Promise.all([
        headerRes.json(),
        ugProgramsRes.json(),
        pgProgramsRes.json(),
        ugStepsRes.json(),
        pgStepsRes.json(),
        paymentInfoRes.json(),
        paymentOptionsRes.json(),
        paymentGuidelinesRes.json(),
        documentsRes.json(),
        documentGuidelinesRes.json(),
        contactsRes.json(),
        affiliationsRes.json()
      ]);

      if (headerData.success) setHeaderData(headerData.data);
      if (ugProgramsData.success) setUgPrograms(ugProgramsData.data);
      if (pgProgramsData.success) setPgPrograms(pgProgramsData.data);
      if (ugStepsData.success) setUgSteps(ugStepsData.data);
      if (pgStepsData.success) setPgSteps(pgStepsData.data);
      if (paymentInfoData.success) setPaymentInfo(paymentInfoData.data);
      if (paymentOptionsData.success) setPaymentOptions(paymentOptionsData.data);
      if (paymentGuidelinesData.success) setPaymentGuidelines(paymentGuidelinesData.data);
      if (documentsData.success) setDocuments(documentsData.data);
      if (documentGuidelinesData.success) setDocumentGuidelines(documentGuidelinesData.data);
      if (contactsData.success) setContacts(contactsData.data);
      if (affiliationsData.success) setAffiliations(affiliationsData.data);

    } catch (error) {
      console.error('Error loading admission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProcessSection = () => (
    <div className="space-y-8">
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading admission information...</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* UG Program Admission */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray">
              <h3 className="text-base sm:text-lg font-bold text-crimson mb-4 sm:mb-6 flex items-center">
                <i className="fas fa-graduation-cap mr-2"></i>
                Undergraduate Programs
              </h3>

              <div className="space-y-4">
                {ugPrograms.length > 0 && (
                  <div className="bg-surface p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-slate text-sm mb-2">Programs Available</h4>
                    <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                      {ugPrograms.map((program) => (
                        <li key={program.id}>
                          • {program.program_name} ({program.program_code}) -
                          <span className="text-green-600 text-xs font-semibold ml-1">{program.affiliation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {ugSteps.length > 0 && (
                  <div className="bg-surface p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-slate text-sm mb-2">Eligibility & Process</h4>
                    <ol className="text-xs sm:text-sm text-gray-600 space-y-1">
                      {ugSteps.map((step) => (
                        <li key={step.id}>{step.step_number}. {step.step_title}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* PG Program Admission */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray">
              <h3 className="text-base sm:text-lg font-bold text-crimson mb-4 sm:mb-6 flex items-center">
                <i className="fas fa-user-graduate mr-2"></i>
                Postgraduate Programs
              </h3>

              <div className="space-y-4">
                {pgPrograms.length > 0 && (
                  <div className="bg-surface p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-slate text-sm mb-2">Programs Available</h4>
                    <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                      {pgPrograms.map((program) => (
                        <li key={program.id}>
                          • {program.program_name} ({program.program_code}) -
                          <span className="text-blue-600 text-xs font-semibold ml-1">{program.affiliation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pgSteps.length > 0 && (
                  <div className="bg-surface p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-slate text-sm mb-2">Eligibility & Process</h4>
                    <ol className="text-xs sm:text-sm text-gray-600 space-y-1">
                      {pgSteps.map((step) => (
                        <li key={step.id}>{step.step_number}. {step.step_title}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Affiliation Summary */}
          {affiliations.length > 0 && (
            <div className="bg-slate-50 p-6 rounded-xl border border-border_gray">
              <h3 className="text-base sm:text-lg font-bold text-slate mb-4">Program Affiliation Summary</h3>
              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
                {affiliations.map((affiliation, index) => {
                  const colors = ['blue', 'green', 'purple'];
                  const color = colors[index % colors.length];
                  return (
                    <div key={affiliation.id} className={`bg-white p-4 rounded-lg border border-${color}-200`}>
                      <h4 className={`font-semibold text-sm text-${color}-600 mb-2`}>{affiliation.affiliation_name}</h4>
                      <p className="text-xs text-gray-600">{affiliation.programs_covered}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderPaymentSection = () => {
    // Group guidelines by type
    const groupedGuidelines = {
      General: [],
      Important: [],
      Refund: [],
      'Late Fee': []
    };

    paymentGuidelines.forEach(guideline => {
      if (groupedGuidelines[guideline.guideline_type]) {
        groupedGuidelines[guideline.guideline_type].push(guideline.guideline_text);
      }
    });

    return (
      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
            <p className="text-gray-600">Loading payment information...</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Payment Instructions */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-border_gray">
              <h3 className="text-base sm:text-lg font-bold text-crimson mb-4 sm:mb-6">Payment Instructions</h3>

              <div className="space-y-4">
                {paymentOptions.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-green-800 mb-2 flex items-center">
                      <i className="fas fa-shield-alt mr-2"></i>
                      Secure Payment Options
                    </h4>
                    <ul className="text-green-700 text-xs sm:text-sm space-y-1">
                      {paymentOptions.map((option) => (
                        <li key={option.id}>• {option.option_title}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {groupedGuidelines.General.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-blue-800 mb-2">Payment Guidelines</h4>
                    <ul className="text-blue-700 text-xs sm:text-sm space-y-1">
                      {groupedGuidelines.General.map((text, index) => (
                        <li key={index}>• {text}</li>
                      ))}
                      {groupedGuidelines.Refund.map((text, index) => (
                        <li key={`refund-${index}`}>• {text}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {groupedGuidelines.Important.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-yellow-800 mb-2">Important Notes</h4>
                    <ul className="text-yellow-700 text-xs sm:text-sm space-y-1">
                      {groupedGuidelines.Important.map((text, index) => (
                        <li key={index}>• {text}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDocumentsSection = () => (
    <div className="space-y-8">
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
          <p className="text-gray-600">Loading document information...</p>
        </div>
      ) : (
        <>
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray">
            <h3 className="text-base sm:text-lg font-bold text-crimson mb-4 sm:mb-6">Required Documents</h3>

            {documents.length > 0 && (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4">
                {documents.map((document, index) => (
                  <div key={document.id} className="flex items-start space-x-3">
                    <div className="bg-crimson text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">
                      {document.document_name}
                      {!document.is_mandatory && <span className="text-xs text-gray-500 ml-1">(if applicable)</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {documentGuidelines.length > 0 && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-sm text-blue-800 mb-2 flex items-center">
                  <i className="fas fa-info-circle mr-2"></i>
                  Document Guidelines
                </h4>
                <ul className="text-blue-700 text-xs sm:text-sm space-y-1">
                  {documentGuidelines.map((guideline) => (
                    <li key={guideline.id}>• {guideline.guideline_text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const sections = [
    { id: 'process', label: 'Admission Process', component: renderProcessSection },
    { id: 'payment', label: 'Payment Procedure', component: renderPaymentSection },
    { id: 'documents', label: 'Document Checklist', component: renderDocumentsSection }
  ];

  return (
    <div className="h-full w-full fade-in">
      <Banner
        title={headerData?.title || "Admissions"}
        subtitle={headerData?.subtitle || "Join Our Community | Your Journey to Excellence Starts Here"}
        imageSrc={headerData?.banner_image_url || "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"}
      />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10">

        {/* Section Navigation */}
        <div className="mb-6 sm:mb-8 border-b border-gray-200">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-3 sm:py-4 px-2 border-b-2 font-semibold whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'border-crimson text-crimson'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Section Content */}
        {sections.find(section => section.id === activeSection)?.component()}

      </div>
    </div>
  );
};

export default AdmissionPage;
