"use client";

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
}

export default function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition">
        <span>⇅</span> Filters & Sort
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt === selected ? "" : opt)}
          className={`px-4 py-1.5 rounded-full text-sm border transition ${
            selected === opt
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}