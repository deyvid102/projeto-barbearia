import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useTheme } from '../ThemeContext';
import { IoClose, IoAdd, IoRemove, IoCheckmarkCircleOutline, IoSyncOutline } from 'react-icons/io5';

export default function ModalFoto({ image, onCropComplete, onClose }) {
  const { isDarkMode } = useTheme();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const onCropCompleteInternal = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      // Passamos os pixels do corte para a função que vai gerar o Base64 final
      onCropComplete(croppedAreaPixels);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className={`relative w-full max-w-2xl rounded-[3rem] overflow-hidden border shadow-2xl flex flex-col ${
        isDarkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <div>
            <h3 className={`text-xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              ajustar.<span className="text-[#e6b32a]">perfil</span>
            </h3>
            <p className="text-[9px] font-bold uppercase tracking-[3px] opacity-40">Posicione e ajuste o zoom</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-gray-500">
            <IoClose size={28} />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative w-full h-[400px] bg-[#151515]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Controls */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-6">
            <IoRemove className={isDarkMode ? 'text-white/20' : 'text-slate-300'} />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full h-1.5 bg-[#e6b32a]/20 rounded-lg appearance-none cursor-pointer accent-[#e6b32a]"
            />
            <IoAdd className={isDarkMode ? 'text-white/20' : 'text-slate-300'} />
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-[#e6b32a] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#e6b32a]/20 active:scale-95 transition-all"
            >
              <IoCheckmarkCircleOutline size={18} /> Aplicar Foto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}