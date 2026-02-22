import React from 'react';

export default function ModalConfirmacao({ isOpen, onClose, onConfirm, mensagem, tipo }) {
  if (!isOpen) return null;

  const isCancel = tipo === 'cancelar';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-[280px] bg-[#111] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
        
        <div className="text-center space-y-4">
          {/* ÍCONE - MUDA DE COR */}
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center border ${
            isCancel ? 'bg-red-500/10 border-red-500/20' : 'bg-[#e6b32a]/10 border-[#e6b32a]/20'
          }`}>
            <span className={`text-lg font-black italic ${isCancel ? 'text-red-500' : 'text-[#e6b32a]'}`}>!</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white lowercase tracking-tighter">confirmar?</h2>
            <p className="text-[9px] text-gray-500 uppercase tracking-[2px] leading-relaxed font-bold">
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
            className="w-full py-4 bg-white/5 text-gray-400 font-black uppercase text-[9px] tracking-[2px] rounded-2xl hover:text-white transition-colors"
          >
            voltar
          </button>
        </div>
      </div>
    </div>
  );
}