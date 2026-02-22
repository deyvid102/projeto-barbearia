import React from 'react';

export default function ModalConfirmacao({ isOpen, onClose, onConfirm, mensagem }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-xs bg-[#111] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          
          <div>
            <h2 className="text-lg font-bold text-white lowercase">confirmar?</h2>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-1">
              {mensagem || "esta ação não pode ser desfeita."}
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <button 
              onClick={onConfirm}
              className="w-full py-4 bg-red-600 text-white font-black uppercase text-[10px] rounded-2xl hover:bg-red-700 transition-colors"
            >
              confirmar
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-transparent text-gray-400 font-bold uppercase text-[10px] rounded-2xl hover:text-white transition-colors"
            >
              voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}