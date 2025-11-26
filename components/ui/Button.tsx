import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${className}`}
    >
      {children}
    </button>
  );
}
//