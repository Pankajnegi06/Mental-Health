import React from 'react'

function Loader() {
  return (
    <div className="flex justify-center items-center  h-full">
      <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default Loader;