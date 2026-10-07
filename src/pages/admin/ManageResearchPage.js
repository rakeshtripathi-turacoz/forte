import React, { useState, useEffect } from 'react';

const ManageResearchPage = () => {
  const [activeTab, setActiveTab] = useState('publications');
  const [publications, setPublications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Publication Form State
  const [publicationForm, setPublicationForm] = useState({
    id: null,
    title: '',
    authors: '',
    journal: '',
    year: new Date().getFullYear().toString(),
    volume: '',
    pages: '',
    doi: '',
    type: 'journal',
    abstract: ''
  });

  // Project Form State
  const [projectForm, setProjectForm] = useState({
    id: null,
    title: '',
    pi_name: '',
    co_investigators: '',
    funding_agency: '',
    amount: '',
    duration: '',
    start_date: new Date().toISOString().split('T')[0],
    status: 'ongoing',
    description: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    loadPublications();
    loadProjects();
  }, []);

  const loadPublications = () => {
    const stored = localStorage.getItem('forte_publications');
    if (stored) {
      setPublications(JSON.parse(stored));
    }
  };

  const loadProjects = () => {
    const stored = localStorage.getItem('forte_projects');
    if (stored) {
      setProjects(JSON.parse(stored));
    }
  };

  const savePublications = (data) => {
    localStorage.setItem('forte_publications', JSON.stringify(data));
    setPublications(data);
  };

  const saveProjects = (data) => {
    localStorage.setItem('forte_projects', JSON.stringify(data));
    setProjects(data);
  };

  // Publication Handlers
  const handlePublicationSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editMode && publicationForm.id) {
        const updated = publications.map(pub =>
          pub.id === publicationForm.id ? publicationForm : pub
        );
        savePublications(updated);
        setSuccess('Publication updated successfully!');
      } else {
        const newPub = { ...publicationForm, id: Date.now() };
        savePublications([...publications, newPub]);
        setSuccess('Publication added successfully!');
      }

      resetPublicationForm();
    } catch (err) {
      setError('Failed to save publication');
    }
  };

  const handleEditPublication = (pub) => {
    setPublicationForm(pub);
    setEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePublication = (id) => {
    if (!window.confirm('Are you sure you want to delete this publication?')) return;

    const updated = publications.filter(pub => pub.id !== id);
    savePublications(updated);
    setSuccess('Publication deleted successfully!');
  };

  const resetPublicationForm = () => {
    setPublicationForm({
      id: null,
      title: '',
      authors: '',
      journal: '',
      year: new Date().getFullYear().toString(),
      volume: '',
      pages: '',
      doi: '',
      type: 'journal',
      abstract: ''
    });
    setEditMode(false);
  };

  // Project Handlers
  const handleProjectSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editMode && projectForm.id) {
        const updated = projects.map(proj =>
          proj.id === projectForm.id ? projectForm : proj
        );
        saveProjects(updated);
        setSuccess('Project updated successfully!');
      } else {
        const newProj = { ...projectForm, id: Date.now() };
        saveProjects([...projects, newProj]);
        setSuccess('Project added successfully!');
      }

      resetProjectForm();
    } catch (err) {
      setError('Failed to save project');
    }
  };

  const handleEditProject = (proj) => {
    setProjectForm(proj);
    setEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    const updated = projects.filter(proj => proj.id !== id);
    saveProjects(updated);
    setSuccess('Project deleted successfully!');
  };

  const resetProjectForm = () => {
    setProjectForm({
      id: null,
      title: '',
      pi_name: '',
      co_investigators: '',
      funding_agency: '',
      amount: '',
      duration: '',
      start_date: new Date().toISOString().split('T')[0],
      status: 'ongoing',
      description: ''
    });
    setEditMode(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-slate mb-2">Manage Research</h1>
        <p className="text-sm text-gray-600">Manage publications and research projects</p>
        <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded">
          <i className="fas fa-info-circle mr-2"></i>
          Note: Currently using localStorage. Data will be migrated to database in future updates.
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <i className="fas fa-check-circle mr-2"></i>
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Publications</div>
          <div className="text-2xl font-bold text-crimson">{publications.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Projects</div>
          <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Ongoing Projects</div>
          <div className="text-2xl font-bold text-green-600">
            {projects.filter(p => p.status === 'ongoing').length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab('publications');
              resetPublicationForm();
              resetProjectForm();
            }}
            className={`pb-3 px-1 font-semibold border-b-2 transition ${
              activeTab === 'publications'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-book mr-2"></i>
            Publications
          </button>
          <button
            onClick={() => {
              setActiveTab('projects');
              resetPublicationForm();
              resetProjectForm();
            }}
            className={`pb-3 px-1 font-semibold border-b-2 transition ${
              activeTab === 'projects'
                ? 'border-crimson text-crimson'
                : 'border-transparent text-gray-500 hover:text-slate'
            }`}
          >
            <i className="fas fa-flask mr-2"></i>
            Research Projects
          </button>
        </div>
      </div>

      {/* Publications Tab */}
      {activeTab === 'publications' && (
        <div className="space-y-6">
          {/* Add/Edit Publication Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {editMode ? 'Edit Publication' : 'Add New Publication'}
            </h2>

            <form onSubmit={handlePublicationSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={publicationForm.title}
                    onChange={(e) => setPublicationForm({ ...publicationForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Title of the publication"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Authors *
                  </label>
                  <input
                    type="text"
                    required
                    value={publicationForm.authors}
                    onChange={(e) => setPublicationForm({ ...publicationForm, authors: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Dr. A. Kumar, Dr. B. Singh"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Journal/Conference *
                  </label>
                  <input
                    type="text"
                    required
                    value={publicationForm.journal}
                    onChange={(e) => setPublicationForm({ ...publicationForm, journal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Journal or Conference name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Publication Type
                  </label>
                  <select
                    value={publicationForm.type}
                    onChange={(e) => setPublicationForm({ ...publicationForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  >
                    <option value="journal">Journal Article</option>
                    <option value="conference">Conference Paper</option>
                    <option value="book">Book</option>
                    <option value="chapter">Book Chapter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={publicationForm.year}
                    onChange={(e) => setPublicationForm({ ...publicationForm, year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Volume/Issue
                  </label>
                  <input
                    type="text"
                    value={publicationForm.volume}
                    onChange={(e) => setPublicationForm({ ...publicationForm, volume: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Vol. 5, Issue 2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pages
                  </label>
                  <input
                    type="text"
                    value={publicationForm.pages}
                    onChange={(e) => setPublicationForm({ ...publicationForm, pages: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., 123-145"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    DOI/URL
                  </label>
                  <input
                    type="text"
                    value={publicationForm.doi}
                    onChange={(e) => setPublicationForm({ ...publicationForm, doi: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="DOI or URL"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Abstract
                  </label>
                  <textarea
                    value={publicationForm.abstract}
                    onChange={(e) => setPublicationForm({ ...publicationForm, abstract: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    rows="3"
                    placeholder="Brief abstract or summary..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition"
                >
                  <i className="fas fa-save mr-2"></i>
                  {editMode ? 'Update Publication' : 'Add Publication'}
                </button>

                {editMode && (
                  <button
                    type="button"
                    onClick={resetPublicationForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Publications List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              All Publications ({publications.length})
            </h2>

            {publications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-book-open text-4xl mb-2"></i>
                <p>No publications found. Add your first publication above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publications.map((pub) => (
                  <div key={pub.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                          {pub.type.toUpperCase()}
                        </span>
                        <h3 className="text-lg font-bold text-slate mt-2">{pub.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <i className="fas fa-users mr-2"></i>
                          {pub.authors}
                        </p>
                        <p className="text-sm text-gray-600">
                          <i className="fas fa-book mr-2"></i>
                          {pub.journal} {pub.volume && `(${pub.volume})`}
                          {pub.pages && `, pp. ${pub.pages}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          <i className="fas fa-calendar mr-2"></i>
                          {pub.year}
                        </p>
                        {pub.doi && (
                          <p className="text-sm text-blue-600 mt-1">
                            <i className="fas fa-link mr-2"></i>
                            <a href={pub.doi} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {pub.doi}
                            </a>
                          </p>
                        )}
                        {pub.abstract && (
                          <p className="text-sm text-gray-500 mt-2 italic">{pub.abstract}</p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditPublication(pub)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeletePublication(pub.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Add/Edit Project Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              {editMode ? 'Edit Research Project' : 'Add New Research Project'}
            </h2>

            <form onSubmit={handleProjectSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Title of the research project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Principal Investigator *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.pi_name}
                    onChange={(e) => setProjectForm({ ...projectForm, pi_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Dr. Rajesh Kumar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Co-Investigators
                  </label>
                  <input
                    type="text"
                    value={projectForm.co_investigators}
                    onChange={(e) => setProjectForm({ ...projectForm, co_investigators: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., Dr. A, Dr. B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Funding Agency
                  </label>
                  <input
                    type="text"
                    value={projectForm.funding_agency}
                    onChange={(e) => setProjectForm({ ...projectForm, funding_agency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., UGC, DST, AICTE"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Funding Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={projectForm.amount}
                    onChange={(e) => setProjectForm({ ...projectForm, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="Amount in Rupees"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={projectForm.duration}
                    onChange={(e) => setProjectForm({ ...projectForm, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    placeholder="e.g., 2 years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson focus:border-crimson"
                    rows="3"
                    placeholder="Brief description of the project..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="bg-crimson text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-800 transition"
                >
                  <i className="fas fa-save mr-2"></i>
                  {editMode ? 'Update Project' : 'Add Project'}
                </button>

                {editMode && (
                  <button
                    type="button"
                    onClick={resetProjectForm}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Projects List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate mb-4">
              All Research Projects ({projects.length})
            </h2>

            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-flask text-4xl mb-2"></i>
                <p>No research projects found. Add your first project above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            proj.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                            proj.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {proj.status.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate">{proj.title}</h3>
                        <p className="text-sm text-gray-600 mt-2">
                          <i className="fas fa-user-tie mr-2"></i>
                          <strong>PI:</strong> {proj.pi_name}
                        </p>
                        {proj.co_investigators && (
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-users mr-2"></i>
                            <strong>Co-PI:</strong> {proj.co_investigators}
                          </p>
                        )}
                        {proj.funding_agency && (
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-building mr-2"></i>
                            <strong>Funding:</strong> {proj.funding_agency}
                            {proj.amount && ` (₹${parseFloat(proj.amount).toLocaleString()})`}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <i className="fas fa-calendar mr-2"></i>
                          <strong>Start:</strong> {new Date(proj.start_date).toLocaleDateString()}
                          {proj.duration && ` | Duration: ${proj.duration}`}
                        </p>
                        {proj.description && (
                          <p className="text-sm text-gray-500 mt-2 italic">{proj.description}</p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditProject(proj)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageResearchPage;
