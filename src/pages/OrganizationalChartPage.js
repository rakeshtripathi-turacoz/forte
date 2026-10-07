import React from 'react';
import Banner from '../components/common/Banner';

const OrganizationalChartPage = () => {
  return (
    <div className="h-full w-full fade-in">
      <Banner
        title="Organizational Chart"
        subtitle="Leadership Structure | Hierarchy | Governance"
        imageSrc="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">

        {/* Introduction */}
        <section>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Institutional Hierarchy</h2>
            <p className="text-gray-500">
              The organizational structure of Forte Institute of Technology ensures efficient governance,
              clear lines of responsibility, and effective decision-making for academic and administrative functions.
            </p>
          </div>
        </section>

        {/* Organizational Chart */}
        <section>
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-border_gray">

            {/* Level 1 - Chairman */}
            <div className="flex justify-center mb-8">
              <div className="bg-crimson text-white p-4 sm:p-6 rounded-xl text-center min-w-[200px] shadow-lg">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-user-tie text-2xl"></i>
                </div>
                <h3 className="font-bold text-lg">Chairman</h3>
                <p className="text-sm opacity-80">Governing Body</p>
              </div>
            </div>

            {/* Connector Line */}
            <div className="flex justify-center mb-8">
              <div className="w-0.5 h-8 bg-gray-300"></div>
            </div>

            {/* Level 2 - Secretary & Joint Secretary */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-8">
              <div className="bg-gold text-white p-4 sm:p-5 rounded-xl text-center min-w-[180px] shadow-md">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-user-cog text-xl"></i>
                </div>
                <h3 className="font-bold">Secretary</h3>
                <p className="text-xs opacity-80">Administration</p>
              </div>
              <div className="bg-gold text-white p-4 sm:p-5 rounded-xl text-center min-w-[180px] shadow-md">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-user-cog text-xl"></i>
                </div>
                <h3 className="font-bold">Joint Secretary</h3>
                <p className="text-xs opacity-80">Operations</p>
              </div>
            </div>

            {/* Connector Line */}
            <div className="flex justify-center mb-8">
              <div className="w-0.5 h-8 bg-gray-300"></div>
            </div>

            {/* Level 3 - Directors */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-8">
              <div className="bg-slate text-white p-4 sm:p-5 rounded-xl text-center min-w-[180px] shadow-lg">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-chalkboard-teacher text-xl"></i>
                </div>
                <h3 className="font-bold">Principal In Prof Scale</h3>
                <p className="text-xs opacity-80">Education</p>
              </div>
              <div className="bg-slate text-white p-4 sm:p-5 rounded-xl text-center min-w-[180px] shadow-lg">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-user-graduate text-xl"></i>
                </div>
                <h3 className="font-bold">Director</h3>
                <p className="text-xs opacity-80">Academics & Administrative Head</p>
              </div>
              <div className="bg-slate text-white p-4 sm:p-5 rounded-xl text-center min-w-[180px] shadow-lg">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-server text-xl"></i>
                </div>
                <h3 className="font-bold">Director</h3>
                <p className="text-xs opacity-80">Systems</p>
              </div>
            </div>

            {/* Connector Lines to Departments */}
            <div className="flex justify-center mb-4">
              <div className="w-0.5 h-8 bg-gray-300"></div>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-3/4 h-0.5 bg-gray-300"></div>
            </div>

            {/* Level 4 - Deans & Registrar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-600 text-white p-4 rounded-xl text-center shadow-md">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-user-tie"></i>
                </div>
                <h3 className="font-bold text-sm">Dean Academics</h3>
                <p className="text-xs opacity-80">Academic Affairs</p>
              </div>
              <div className="bg-green-600 text-white p-4 rounded-xl text-center shadow-md">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h3 className="font-bold text-sm">Registrar</h3>
                <p className="text-xs opacity-80">Administration</p>
              </div>
              <div className="bg-purple-600 text-white p-4 rounded-xl text-center shadow-md">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-flask"></i>
                </div>
                <h3 className="font-bold text-sm">Dean R&D</h3>
                <p className="text-xs opacity-80">Research & Development</p>
              </div>
            </div>

            {/* Level 5 - HODs */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
              <h4 className="text-center font-bold text-slate mb-4">Heads of Departments</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <i className="fas fa-laptop-code text-crimson mb-2"></i>
                  <p className="text-xs font-semibold text-slate">HOD - MCA</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <i className="fas fa-briefcase text-crimson mb-2"></i>
                  <p className="text-xs font-semibold text-slate">HOD - MBA</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <i className="fas fa-calculator text-crimson mb-2"></i>
                  <p className="text-xs font-semibold text-slate">HOD - BCA</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <i className="fas fa-chart-line text-crimson mb-2"></i>
                  <p className="text-xs font-semibold text-slate">HOD - BBA</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <i className="fas fa-coins text-crimson mb-2"></i>
                  <p className="text-xs font-semibold text-slate">HOD - B.Com</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <i className="fas fa-book text-crimson mb-2"></i>
                  <p className="text-xs font-semibold text-slate">HOD - BA</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <i className="fas fa-chalkboard text-crimson mb-2"></i>
                  <p className="text-xs font-semibold text-slate">HOD - B.Ed</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <i className="fas fa-running text-crimson mb-2"></i>
                  <p className="text-xs font-semibold text-slate">HOD - B.P.Ed</p>
                </div>
              </div>
            </div>

            {/* Level 6 - Faculty */}
            <div className="bg-blue-50 p-4 sm:p-6 rounded-xl mt-6">
              <h4 className="text-center font-bold text-slate mb-4">Faculty</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                  <i className="fas fa-laptop-code text-blue-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">MCA</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                  <i className="fas fa-briefcase text-blue-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">MBA</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                  <i className="fas fa-calculator text-blue-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">BCA</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                  <i className="fas fa-chart-line text-blue-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">BBA</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                  <i className="fas fa-coins text-blue-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">B.Com</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                  <i className="fas fa-book text-blue-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">BA</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                  <i className="fas fa-chalkboard text-blue-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">B.Ed</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                  <i className="fas fa-running text-blue-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">B.P.Ed</p>
                </div>
              </div>
            </div>

            {/* Level 7 - Support Functions */}
            <div className="mt-8">
              <h4 className="text-center font-bold text-slate mb-4">Support Functions</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-orange-100 p-3 rounded-lg text-center border border-orange-200">
                  <i className="fas fa-book-open text-orange-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">Library</p>
                </div>
                <div className="bg-teal-100 p-3 rounded-lg text-center border border-teal-200">
                  <i className="fas fa-user-friends text-teal-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">Placement Cell</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg text-center border border-indigo-200">
                  <i className="fas fa-money-bill-wave text-indigo-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">Accounts</p>
                </div>
                <div className="bg-pink-100 p-3 rounded-lg text-center border border-pink-200">
                  <i className="fas fa-desktop text-pink-600 mb-2"></i>
                  <p className="text-xs font-semibold text-slate">IT Support</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legend */}
        <section>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="font-bold text-slate mb-4">Legend</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-crimson rounded"></div>
                <span className="text-sm text-gray-600">Governing Body</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gold rounded"></div>
                <span className="text-sm text-gray-600">Management</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate rounded"></div>
                <span className="text-sm text-gray-600">Executive Leadership</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-sm text-gray-600">Academic Administration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-sm text-gray-600">General Administration</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default OrganizationalChartPage;
