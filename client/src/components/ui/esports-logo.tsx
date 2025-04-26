import React from "react";

export function EsportsLogo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-32 h-32",
    lg: "w-48 h-48"
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 185C147.455 185 185 147.455 185 100C185 52.5445 147.455 15 100 15C52.5445 15 15 52.5445 15 100C15 147.455 52.5445 185 100 185Z"
        stroke="white"
        strokeWidth="8"
      />
      <path
        d="M100 165C136.42 165 165 136.42 165 100C165 63.5795 136.42 35 100 35C63.5795 35 35 63.5795 35 100C35 136.42 63.5795 165 100 165Z"
        stroke="white"
        strokeWidth="6"
      />
      <path
        d="M100 143C124.3 143 144 123.3 144 99C144 74.7 124.3 55 100 55C75.7 55 56 74.7 56 99C56 123.3 75.7 143 100 143Z"
        fill="#FF5722"
      />
      <path
        d="M100 130C116.569 130 130 116.569 130 100C130 83.4315 116.569 70 100 70C83.4315 70 70 83.4315 70 100C70 116.569 83.4315 130 100 130Z"
        fill="#0F1923"
      />
      <path
        d="M85 155L87 170M115 155L113 170"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M72.5 150L65 160M127.5 150L135 160"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EsportsLogoWithText({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <EsportsLogo size="sm" className="mr-2" />
      <h1 className={`font-rajdhani font-bold ${sizeClasses[size]}`}>
        eSPORT <span className="text-secondary">CHAMPIONS</span>
      </h1>
    </div>
  );
}
