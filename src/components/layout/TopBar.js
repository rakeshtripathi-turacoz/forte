import React from 'react';
import { Link } from 'react-router-dom';

const TopBar = () => {
  return (
    <div className="bg-slate text-white text-[11px] py-2.5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center">
        <div className="flex gap-6">
          <span className="flex items-center gap-2 font-medium text-gold">
            <i className="fas fa-globe"></i> ISO 9001:2015 Certified
          </span>
        </div>
        <div className="flex gap-6 font-medium items-center">
          <a href="#" className="hover:text-gold transition">Alumni</a>
          <a href="#" className="hover:text-gold transition">Portal</a>
          <span className="text-gold">
            <i className="fas fa-phone-alt mr-1"></i> +91 98765-43210
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;