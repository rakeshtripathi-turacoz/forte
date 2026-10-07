import React from 'react';
import Banner from '../components/common/Banner';

const InfrastructurePage = () => {
  const campusAreas = [
    { name: 'Academic Blocks', description: 'Modern classrooms with smart boards and audio-visual equipment' },
    { name: 'Laboratory Complex', description: 'State-of-the-art labs for all engineering disciplines' },
    { name: 'Administrative Building', description: 'Central administrative offices and meeting rooms' },
    { name: 'Central Library', description: 'Digital and physical resources with reading spaces' },
    { name: 'Student Hostels', description: 'Comfortable accommodation facilities for students' },
    { name: 'Faculty Quarters', description: 'Residential facilities for faculty and staff' },
    { name: 'Sports Complex', description: 'Indoor and outdoor sports facilities' },
    { name: 'Cafeteria & Dining', description: 'Hygienic food service and dining areas' }
  ];

  const classroomFeatures = [
    'Smart boards and projectors in every classroom',
    'Air-conditioned learning environments',
    'Ergonomic furniture and seating arrangements',
    'High-speed internet connectivity',
    'Audio-visual equipment for presentations',
    'Natural lighting and ventilation systems'
  ];

  const libraryServices = [
    'Digital library with online databases',
    'Physical book collection of 50,000+ volumes',
    'Research journals and periodicals',
    'Individual and group study areas',
    'Computer terminals for digital access',
    '24/7 access for registered users'
  ];

  return (
    <div className="h-full w-full  fade-in">
      <Banner 
        title="Infrastructure"
        subtitle="World-Class Facilities | Modern Campus | State-of-the-Art Equipment"
        imageSrc="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">
        
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Infrastructure</h2>
          <p className="text-gray-500">World-class facilities designed to support learning, research, and development.</p>
        </div>

        {/* Campus Overview */}
        <section>
          <div className="mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-3 sm:mb-4">Campus Overview</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Forte Institute of Technology is spread across a sprawling campus equipped with modern infrastructure 
              and facilities. Our campus is designed to provide an optimal learning environment that combines academic 
              excellence with comfortable living spaces.
            </p>
          </div>

          {/* Campus Tour Gallery */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray mb-6 sm:mb-8">
            <h4 className="text-lg sm:text-xl font-bold text-crimson mb-4 sm:mb-6 flex items-center">
              <i className="fas fa-camera mr-3"></i>
              Campus Tour Gallery
            </h4>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div className="bg-gray-100 p-6 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="fas fa-building text-4xl mb-2"></i>
                  <p className="text-sm font-medium">Main Academic Block</p>
                </div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="fas fa-graduation-cap text-4xl mb-2"></i>
                  <p className="text-sm font-medium">Convocation Hall</p>
                </div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="fas fa-tree text-4xl mb-2"></i>
                  <p className="text-sm font-medium">Green Campus Areas</p>
                </div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="fas fa-car text-4xl mb-2"></i>
                  <p className="text-sm font-medium">Parking Facilities</p>
                </div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="fas fa-walking text-4xl mb-2"></i>
                  <p className="text-sm font-medium">Walking Pathways</p>
                </div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="fas fa-landmark text-4xl mb-2"></i>
                  <p className="text-sm font-medium">Central Plaza</p>
                </div>
              </div>
            </div>

            {/* Campus Areas Grid */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {campusAreas.map((area, index) => (
                <div key={index} className="bg-surface p-4 rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-slate mb-2">{area.name}</h5>
                  <p className="text-sm text-gray-600">{area.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Classrooms */}
        <section>
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray">
            <h3 className="text-xl sm:text-2xl font-bold text-crimson mb-4 sm:mb-6 flex items-center">
              <i className="fas fa-chalkboard-teacher mr-3"></i>
              Modern Classrooms
            </h3>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
              <div className="space-y-6">
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Our classrooms are designed with modern pedagogy in mind, featuring advanced technology and 
                  comfortable learning environments. Each classroom is equipped with the latest teaching aids 
                  and technology to enhance the learning experience.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">Classroom Features</h4>
                  <ul className="text-blue-700 text-sm sm:text-base space-y-2">
                    {classroomFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fas fa-check-circle text-blue-600 mr-2 mt-0.5"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-crimson text-white p-3 rounded-lg">
                    <div className="text-xl font-bold">50+</div>
                    <div className="text-xs">Classrooms</div>
                  </div>
                  <div className="bg-gold text-white p-3 rounded-lg">
                    <div className="text-xl font-bold">100%</div>
                    <div className="text-xs">Smart Enabled</div>
                  </div>
                  <div className="bg-slate text-white p-3 rounded-lg">
                    <div className="text-xl font-bold">60</div>
                    <div className="text-xs">Seating Capacity</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-100 p-6 rounded-lg h-32 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <i className="fas fa-camera text-3xl mb-2"></i>
                    <p className="text-sm">Lecture Hall</p>
                  </div>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg h-32 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <i className="fas fa-camera text-3xl mb-2"></i>
                    <p className="text-sm">Smart Classroom</p>
                  </div>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg h-32 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <i className="fas fa-camera text-3xl mb-2"></i>
                    <p className="text-sm">Seminar Room</p>
                  </div>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg h-32 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <i className="fas fa-camera text-3xl mb-2"></i>
                    <p className="text-sm">Tutorial Room</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Library */}
        <section>
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray">
            <h3 className="text-xl sm:text-2xl font-bold text-crimson mb-4 sm:mb-6 flex items-center">
              <i className="fas fa-book mr-3"></i>
              Central Library
            </h3>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
              <div className="bg-gray-100 p-8 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="fas fa-camera text-5xl mb-3"></i>
                  <p className="text-lg font-medium">Library Interior Photos</p>
                  <p className="text-sm">Reading areas, book stacks, and digital zones</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Our central library is the knowledge hub of the campus, providing access to extensive digital and 
                  physical resources. The library offers a conducive environment for study, research, and academic 
                  exploration with modern amenities and services.
                </p>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">Library Services</h4>
                  <ul className="text-purple-700 text-sm sm:text-base space-y-2">
                    {libraryServices.map((service, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fas fa-book-open text-purple-600 mr-2 mt-0.5"></i>
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate text-white p-3 rounded-lg">
                    <div className="text-xl font-bold">50K+</div>
                    <div className="text-xs">Books Collection</div>
                  </div>
                  <div className="bg-crimson text-white p-3 rounded-lg">
                    <div className="text-xl font-bold">200+</div>
                    <div className="text-xs">Seating Capacity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Canteen */}
        <section>
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray">
            <h3 className="text-xl sm:text-2xl font-bold text-crimson mb-4 sm:mb-6 flex items-center">
              <i className="fas fa-utensils mr-3"></i>
              Cafeteria & Dining Facilities
            </h3>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
              <div className="space-y-6">
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Our campus cafeteria provides nutritious and hygienic food options for students and faculty. 
                  The dining facility is designed to accommodate a large number of students with comfortable 
                  seating arrangements and a variety of meal options.
                </p>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-3">Dining Features</h4>
                  <ul className="text-orange-700 text-sm sm:text-base space-y-2">
                    <li>• Hygienic food preparation and service</li>
                    <li>• Variety of vegetarian and non-vegetarian options</li>
                    <li>• Affordable pricing for students</li>
                    <li>• Clean and comfortable dining environment</li>
                    <li>• Extended hours to accommodate all schedules</li>
                    <li>• Special dietary requirements catered</li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg inline-block">
                    <i className="fas fa-leaf mr-2"></i>
                    <span className="font-semibold">Eco-Friendly Packaging & Zero Waste Initiative</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 p-8 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <i className="fas fa-camera text-5xl mb-3"></i>
                  <p className="text-lg font-medium">Cafeteria Photos</p>
                  <p className="text-sm">Dining area and food service facilities</p>
                  <div className="mt-4 text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded">
                    Photos to be uploaded
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Facilities */}
        <section>
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-border_gray">
            <h3 className="text-xl sm:text-2xl font-bold text-crimson mb-4 sm:mb-6">Additional Campus Facilities</h3>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center p-4 bg-surface rounded-lg border border-gray-200">
                <div className="w-16 h-16 bg-crimson rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-wifi text-white text-2xl"></i>
                </div>
                <h4 className="font-semibold text-slate mb-2 text-sm sm:text-base">Wi-Fi Campus</h4>
                <p className="text-xs sm:text-sm text-gray-500">High-speed internet across campus</p>
              </div>
              
              <div className="text-center p-4 bg-surface rounded-lg border border-gray-200">
                <div className="w-16 h-16 bg-gold rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-shield-alt text-white text-2xl"></i>
                </div>
                <h4 className="font-semibold text-slate mb-2 text-sm sm:text-base">24/7 Security</h4>
                <p className="text-xs sm:text-sm text-gray-500">Round-the-clock campus security</p>
              </div>
              
              <div className="text-center p-4 bg-surface rounded-lg border border-gray-200">
                <div className="w-16 h-16 bg-slate rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-bus text-white text-2xl"></i>
                </div>
                <h4 className="font-semibold text-slate mb-2 text-sm sm:text-base">Transportation</h4>
                <p className="text-xs sm:text-sm text-gray-500">Bus services from various locations</p>
              </div>
              
              <div className="text-center p-4 bg-surface rounded-lg border border-gray-200">
                <div className="w-16 h-16 bg-crimson rounded-xl flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-clinic-medical text-white text-2xl"></i>
                </div>
                <h4 className="font-semibold text-slate mb-2 text-sm sm:text-base">Medical Facility</h4>
                <p className="text-xs sm:text-sm text-gray-500">On-campus health center</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default InfrastructurePage;