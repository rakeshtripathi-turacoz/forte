import React from 'react';

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'admission', label: 'Admission' },
    { id: 'placements', label: 'Training & Placements' },
    { id: 'research', label: 'Research & Development' },
    { id: 'infrastructure', label: 'Infrastructure' }
  ];

  return (
    <div className="bg-white border-b border-border_gray px-6 py-0 z-20 shadow-sm">
      <div className="flex gap-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 text-sm font-semibold border-b-2 transition-all hover:text-slate whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-crimson border-crimson'
                : 'text-gray-500 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;