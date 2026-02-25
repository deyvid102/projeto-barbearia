import React, { useState, useRef, useEffect } from 'react';
import { IoChevronDown } from 'react-icons/io5';

export default function SelectPersonalizado({ 
  options, 
  value, 
  onChange, 
  label, 
  placeholder = "selecione uma opção..." 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fecha o select ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="flex flex-col gap-2 w-full" ref={containerRef}>
      {label && (
        <label className="text-[8px] font-black uppercase text-gray-500 tracking-[3px] ml-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Trigger do Select */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between
            px-4 py-3.5 rounded-xl border transition-all duration-200
            text-xs font-bold text-left outline-none
            ${isOpen ? 'border-[#e6b32a] ring-1 ring-[#e6b32a]/20' : 'border-black/10 dark:border-white/10'}
            bg-white dark:bg-white/5 
            text-gray-900 dark:text-gray-100
          `}
        >
          <span className={!selectedOption ? 'text-gray-400 font-medium' : ''}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <IoChevronDown 
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#e6b32a]' : 'text-gray-400'}`} 
            size={16} 
          />
        </button>

        {/* Menu Dropdown */}
        {isOpen && (
          <div className="
            absolute z-[1100] w-full mt-2 
            bg-white dark:bg-[#111] 
            border border-black/10 dark:border-white/10 
            rounded-2xl shadow-2xl overflow-hidden
            animate-in fade-in zoom-in-95 duration-200
          ">
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider
                    transition-colors duration-150
                    hover:bg-[#e6b32a]/10 hover:text-[#e6b32a]
                    ${value === option.value ? 'bg-[#e6b32a] text-black hover:bg-[#e6b32a]' : 'text-gray-600 dark:text-gray-400'}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}