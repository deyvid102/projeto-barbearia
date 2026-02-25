import React from 'react';
import { useTheme } from '../ThemeContext';

export default function ModalConfirmacao({ isOpen, onClose, onConfirm, mensagem, tipo }) {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  const isCancel = tipo === 'cancelar';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200 ${
      isDarkMode ? 'bg-black/95' : 'bg-white/80'
    }`}>
      <div className={`w-full max-w-[280px] border rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 transition-colors ${
        isDarkMode 
        ? 'bg-[#111] border-white/10' 
        : 'bg-white border-slate-200'
      }`}>
        
        <div className="text-center space-y-4">
          {/* ÍCONE - MUDA DE COR */}
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center border ${
            isCancel 
            ? (isDarkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100') 
            : (isDarkMode ? 'bg-[#e6b32a]/10 border-[#e6b32a]/20' : 'bg-[#e6b32a]/10 border-[#e6b32a]/30')
          }`}>
            <span className={`text-lg font-black italic ${isCancel ? 'text-red-500' : 'text-[#e6b32a]'}`}>!</span>
          </div>
          
          <div className="space-y-2">
            <h2 className={`text-xl font-black lowercase tracking-tighter ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              confirmar?
            </h2>
            <p className={`text-[9px] uppercase tracking-[2px] leading-relaxed font-bold ${
              isDarkMode ? 'text-gray-500' : 'text-slate-400'
            }`}>
              {mensagem}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* BOTÃO - MUDA DE COR */}
          <button 
            onClick={onConfirm}
            className={`w-full py-4 font-black uppercase text-[10px] tracking-[2px] rounded-2xl active:scale-95 transition-all shadow-xl ${
              isCancel 
              ? 'bg-red-600 text-white shadow-red-900/20' 
              : 'bg-[#e6b32a] text-black shadow-[#e6b32a]/10'
            }`}
          >
            confirmar
          </button>
          
          <button 
            onClick={onClose}
            className={`w-full py-4 font-black uppercase text-[9px] tracking-[2px] rounded-2xl transition-all ${
              isDarkMode 
              ? 'bg-white/5 text-gray-400 hover:text-white' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            voltar
          </button>
        </div>
      </div>
    </div>
  );
}