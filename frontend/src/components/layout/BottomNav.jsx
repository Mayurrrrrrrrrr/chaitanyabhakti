import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiRepeat, FiMusic, FiUser, FiWind } from 'react-icons/fi';

const BottomNav = () => {
  const navItems = [
    { to: "/dashboard", icon: FiHome, label: "Home" },
    { to: "/japa", icon: FiRepeat, label: "Japa" },
    { to: "/satsang", icon: FiMusic, label: "Satsang" },
    { to: "/breathe", icon: FiWind, label: "Breathe" },
    { to: "/profile", icon: FiUser, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-around py-2 pb-safe z-50 shadow-lg md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full py-2 gap-1 transition-all duration-200 relative
            ${isActive ? 'text-saffron-600' : 'text-gray-400 hover:text-saffron-500'}
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-saffron-500 to-orange-500 rounded-b-full"></div>
              )}
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;