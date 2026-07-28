import React from 'react';

const Line = () => {
  return (
    <div className="w-full bg-white py-4 overflow-hidden">
      <marquee 
        behavior="scroll" 
        direction="left" 
        scrollamount="6" 
        className="text-lg md:text-2xl font-medium tracking-widest text-amber-500 uppercase flex items-center"
      >
        EASY TO CREATE & CUSTOMIZE &nbsp;&nbsp;★&nbsp;&nbsp; DESIGN YOUR OWN &nbsp;&nbsp;★&nbsp;&nbsp; 
        EASY TO CREATE & CUSTOMIZE &nbsp;&nbsp;★&nbsp;&nbsp; DESIGN YOUR OWN &nbsp;&nbsp;★&nbsp;&nbsp;
        EASY TO CREATE & CUSTOMIZE &nbsp;&nbsp;★&nbsp;&nbsp; DESIGN YOUR OWN &nbsp;&nbsp;★&nbsp;&nbsp; 
        EASY TO CREATE & CUSTOMIZE &nbsp;&nbsp;★&nbsp;&nbsp; DESIGN YOUR OWN &nbsp;&nbsp;★&nbsp;&nbsp;
        EASY TO CREATE & CUSTOMIZE &nbsp;&nbsp;★&nbsp;&nbsp; DESIGN YOUR OWN
      </marquee>
    </div>
  );
};

export default Line;