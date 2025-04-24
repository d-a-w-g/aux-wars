import React from "react";

export default function PromptTag({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1 border ${
        selected
          ? "green-btn text-white"
          : "bg-gray-700 text-white border-gray-700"
      }`}
    >
      {label}
    </button>
  );
}
