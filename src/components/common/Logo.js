import React from 'react';

const Logo = ({ size = 'normal', onClick }) => {
  const isLarge = size === 'large';

  // Define dimensions based on size
  const dimensions = {
    normal: { width: '100px', height: 'auto' },
    large: { width: '300px', height: 'auto' }
  };

  return (
    <div className={`${onClick ? 'cursor-pointer' : ''}`} onClick={onClick} style={{ marginLeft: '45px' }}>
      <img
        src="/fit_logo.png"
        alt="Forte Institute of Technology Logo"
        style={{
          width: dimensions[size].width,
          height: dimensions[size].height,
          objectFit: 'contain'
        }}
        className="transition-transform hover:scale-105"
      />
    </div>
  );
};

export default Logo;