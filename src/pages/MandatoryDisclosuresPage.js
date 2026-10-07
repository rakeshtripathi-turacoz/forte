import React, { useState, useEffect } from 'react';
import Banner from '../components/common/Banner';
import { mandatoryDisclosuresAPI } from '../services/api';

const MandatoryDisclosuresPage = () => {
  const [loading, setLoading] = useState(true);
  const [headerData, setHeaderData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load header
      const headerRes = await mandatoryDisclosuresAPI.getHeader();
      if (headerRes.success && headerRes.data) {
        setHeaderData(headerRes.data);
      }

      // Load categories
      const catRes = await mandatoryDisclosuresAPI.getCategories();
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }

      // Load documents
      const docsRes = await mandatoryDisclosuresAPI.getDocuments();
      if (docsRes.success && docsRes.data) {
        setDocuments(docsRes.data);
      }
    } catch (error) {
      console.error('Error loading mandatory disclosures:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group documents by category
  const getDocumentsByCategory = (categoryId) => {
    return documents.filter(doc => doc.category_id === categoryId);
  };

  return (
    <div className="h-full w-full fade-in">
      <Banner
        title={headerData?.title || "Mandatory Disclosures"}
        subtitle={headerData?.subtitle || "Transparency | Compliance | Information"}
        imageSrc="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
            <p className="text-gray-600">Loading mandatory disclosures...</p>
          </div>
        )}

        {/* Header Description */}
        {!loading && headerData?.description && (
          <section>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-info-circle text-white text-xl"></i>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-2">About Mandatory Disclosures</h2>
                  <div
                    className="text-xs sm:text-sm text-gray-600 leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: headerData.description }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories with Documents */}
        {!loading && categories.length > 0 && categories.map((category) => {
          const categoryDocs = getDocumentsByCategory(category.id);
          if (categoryDocs.length === 0) return null;

          return (
            <section key={category.id}>
              <div className="flex items-center gap-3 mb-6">
                {category.icon && (
                  <div className="w-10 h-10 bg-crimson rounded-lg flex items-center justify-center">
                    <i className={`fas ${category.icon} text-white`}></i>
                  </div>
                )}
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate">{category.category_name}</h2>
                  {category.description && (
                    <div
                      className="text-xs sm:text-sm text-gray-600 mt-1 prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: category.description }}
                    />
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryDocs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white p-4 rounded-xl border border-border_gray hover:shadow-md hover:border-crimson transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition">
                        <i className="fas fa-file-pdf text-red-500"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate text-sm group-hover:text-crimson transition truncate">
                          {doc.document_title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.document_type && `${doc.document_type} • `}
                          {doc.file_size || 'PDF'}
                        </p>
                        {doc.academic_year && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            {doc.academic_year}
                          </span>
                        )}
                        {doc.description && (
                          <div
                            className="text-xs text-gray-600 mt-2 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: doc.description }}
                          />
                        )}
                      </div>
                      <i className="fas fa-external-link-alt text-gray-400 group-hover:text-crimson transition flex-shrink-0"></i>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          );
        })}

        {/* No Data Message */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <i className="fas fa-folder-open text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-600">No mandatory disclosures available at this time.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MandatoryDisclosuresPage;
