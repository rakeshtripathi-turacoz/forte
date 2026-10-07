import React, { useState, useEffect } from 'react';
import Banner from '../components/common/Banner';
import { lifeAtFitAPI } from '../services/api';

const LifeAtFITPage = () => {
  const [loading, setLoading] = useState(true);
  const [campusLife, setCampusLife] = useState([]);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all Life@FIT content
      const [activitiesRes, facilitiesRes] = await Promise.all([
        lifeAtFitAPI.getActivities(),
        lifeAtFitAPI.getFacilities()
      ]);

      if (activitiesRes.success) {
        setCampusLife(activitiesRes.data);
      }

      if (facilitiesRes.success) {
        setFacilities(facilitiesRes.data);
      }
    } catch (error) {
      console.error('Error fetching Life@FIT data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full fade-in">
      <Banner
        title="Life@FIT"
        subtitle="Campus Life | Student Activities | Beyond Academics"
        imageSrc="https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">

        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate mb-3 sm:mb-4">Life at Forte Institute of Technology</h2>
          <p className="text-gray-500">
            At FIT, we believe in holistic development. Beyond academics, our campus offers a vibrant environment
            where students can explore their passions, develop new skills, and create lifelong memories.
          </p>
        </div>

        {/* Campus Life Sections */}
        <section>
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-4xl text-crimson mb-4"></i>
              <p className="text-gray-500">Loading campus life activities...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
              {campusLife.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-xl border border-border_gray hover:shadow-card transition">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-crimson/10 rounded-xl flex items-center justify-center">
                      <i className={`${item.icon} text-2xl text-crimson`}></i>
                    </div>
                    <h3 className="font-bold text-xl text-slate">{item.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.items && item.items.map((tag) => (
                      <span key={tag.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        {tag.item_name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Campus Facilities */}
        <section>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate mb-6">Campus Facilities</h3>
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-3xl text-crimson"></i>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {facilities
                .filter(facility =>
                  !facility.name.toLowerCase().includes('hostel') &&
                  !facility.name.toLowerCase().includes('transport')
                )
                .map((facility) => (
                <div key={facility.id} className="bg-white p-4 rounded-xl border border-border_gray text-center hover:shadow-card transition">
                  <div className="w-12 h-12 bg-slate rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className={`${facility.icon} text-white`}></i>
                  </div>
                  <h4 className="font-semibold text-slate text-sm mb-1">{facility.name}</h4>
                  <p className="text-gray-500 text-xs">{facility.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section>
          <div className="bg-slate text-white p-6 sm:p-8 rounded-xl text-center">
            <h3 className="text-xl sm:text-2xl font-serif font-bold mb-4">Experience Life@FIT</h3>
            <p className="text-white/80 mb-6">Visit our campus and experience the vibrant student life firsthand.</p>
            <a
              href="/contact"
              className="inline-block bg-crimson hover:bg-red-800 text-white font-semibold py-3 px-8 rounded transition"
            >
              Schedule a Campus Visit
            </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LifeAtFITPage;
