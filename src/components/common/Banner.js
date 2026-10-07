import React from 'react';

const Banner = ({ 
  title = "Page Title", 
  subtitle = "Subtitle description", 
  imageSrc = "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  height = "h-64" 
}) => {
  return (
    <div className={`relative ${height} bg-cover bg-center bg-gray-200 flex items-center justify-center overflow-hidden`}
         style={{ backgroundImage: `url(${imageSrc})` }}>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate bg-opacity-70"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-6">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{title}</h1>
        {subtitle && (
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
      
      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-gradient"></div>
    </div>
  );
};

export default Banner;