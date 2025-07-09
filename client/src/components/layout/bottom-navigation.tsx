import React from "react";
import { Link, useLocation } from "wouter";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: "ri-home-5-line" },
  { path: "/tournaments", label: "Tournaments", icon: "ri-trophy-line" },
  { path: "/wallet", label: "Wallet", icon: "ri-wallet-3-line" },
  { path: "/profile", label: "Profile", icon: "ri-user-3-line" },
];

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary-900 border-t border-gray-800 px-2 py-1 z-10 bg-black">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`tab flex flex-col items-center py-2 px-3 ${
                isActive
                  ? "active text-secondary"
                  : "text-gray-500"
              }`}
            >
              <i className={`${item.icon} text-xl`}></i>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
