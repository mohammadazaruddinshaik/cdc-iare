import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/Scene-1.json'; 

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="w-64 h-64"> {/* Adjust width/height as needed */}
        <Lottie 
          animationData={loadingAnimation} 
          loop={true} 
          autoplay={true}
        />
      </div>
    </div>
  );
};

export default Loader;