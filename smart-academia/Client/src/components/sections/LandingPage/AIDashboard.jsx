import React from 'react';

const AIDashboard = ({ 
  className = "",
  aspectRatio = "aspect-[3/1] xs:aspect-[2/1] sm:aspect-[5/2] md:aspect-[3/1] lg:aspect-video",
  borderRadius = "rounded-lg sm:rounded-xl",
  background = "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/20",
  icons = [
    {
      position: "left-[5%] xs:left-[8%] sm:left-[10%] top-[15%] xs:top-[18%] sm:top-[20%]",
      icon: "psychology",
      label: "AI Brain",
      bgColor: "bg-blue-500",
      animation: "animate-float-1"
    },
    {
      position: "right-[5%] xs:right-[8%] sm:right-[10%] top-[15%] xs:top-[18%] sm:top-[20%]",
      icon: "code",
      label: "Code Assistant",
      bgColor: "bg-blue-500",
      animation: "animate-float-2"
    },
    {
      position: "left-1/2 bottom-[15%] xs:bottom-[18%] sm:bottom-[20%]",
      icon: "smart_toy",
      label: "Progress Analytics",
      bgColor: "bg-blue-500",
      animation: "animate-float-3",
      translate: "-translate-x-1/2"
    }
  ],
  floatingElements = [
    { 
      size: "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4", 
      position: { left: '10%', top: '10%' },
      responsive: { xs: { left: '12%', top: '12%' }, sm: { left: '15%', top: '15%' } },
      animation: "animate-float-1" 
    },
    { 
      size: "w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3", 
      position: { right: '10%', top: '10%' },
      responsive: { xs: { right: '12%', top: '12%' }, sm: { right: '15%', top: '15%' } },
      animation: "animate-float-2" 
    },
    { 
      size: "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4", 
      position: { left: '5%', top: '45%' },
      responsive: { xs: { left: '8%', top: '48%' }, sm: { left: '10%', top: '50%' } },
      animation: "animate-float-3" 
    },
    { 
      size: "w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3", 
      position: { right: '5%', top: '45%' },
      responsive: { xs: { right: '8%', top: '48%' }, sm: { right: '10%', top: '50%' } },
      animation: "animate-float-1" 
    },
    { 
      size: "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4", 
      position: { left: '18%', bottom: '10%' },
      responsive: { xs: { left: '20%', bottom: '12%' }, sm: { left: '25%', bottom: '15%' } },
      animation: "animate-float-2" 
    },
    { 
      size: "w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3", 
      position: { right: '18%', bottom: '10%' },
      responsive: { xs: { right: '20%', bottom: '12%' }, sm: { right: '25%', bottom: '15%' } },
      animation: "animate-float-3" 
    }
  ],
  dataFlowLines = [
    {
      type: "horizontal",
      position: "left-[15%] xs:left-[20%] sm:left-[25%] top-[20%] xs:top-[25%] sm:top-[30%] right-[15%] xs:right-[20%] sm:right-[25%]",
      gradient: "from-blue-400/30 to-green-400/30"
    },
    {
      type: "vertical", 
      position: "left-1/2 top-[30%] xs:top-[35%] sm:top-[40%] bottom-[20%] xs:bottom-[25%] sm:bottom-[30%]",
      gradient: "from-blue-400/30 to-purple-400/30"
    }
  ]
}) => {
  return (
    <div className={`w-full ${aspectRatio} ${borderRadius} flex items-center justify-center relative overflow-hidden ${background} ${className}`}>
      <div className="relative w-full h-full flex items-center justify-center p-2 xs:p-3 sm:p-4">
        
        {/* Main Icons */}
        {icons.map((iconConfig, index) => (
          <div
            key={index}
            className={`absolute ${iconConfig.position} w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 ${iconConfig.bgColor} rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-md sm:shadow-lg transform ${iconConfig.animation} z-10 ${iconConfig.translate || ''}`}
          >
            <span className="material-symbols-outlined text-white text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl">
              {iconConfig.icon}
            </span>
          </div>
        ))}
        
        {/* Floating Elements */}
        {floatingElements.map((element, index) => (
          <div
            key={index}
            className={`absolute ${element.size} bg-blue-400 rounded-full opacity-60 ${element.animation}`}
            style={{
              left: element.position.left,
              top: element.position.top,
              right: element.position.right,
              bottom: element.position.bottom
            }}
          ></div>
        ))}
        
        {/* Data Flow Lines */}
        <div className="absolute inset-0 pointer-events-none">
          {dataFlowLines.map((line, index) => (
            <div
              key={index}
              className={`absolute ${line.position} ${
                line.type === 'horizontal' ? 'h-0.5' : 'w-0.5'
              } bg-gradient-to-${line.type === 'horizontal' ? 'r' : 'b'} ${line.gradient} animate-pulse`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;