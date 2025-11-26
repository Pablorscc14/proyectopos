import React from "react";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
}: {
  label?: string;
  type?: string;
  value: any;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="border rounded px-3 py-2 w-full focus:ring focus:ring-blue-300 outline-none transition"
      />
    </div>
  );
}
