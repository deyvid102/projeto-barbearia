import { useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoCutOutline } from 'react-icons/io5'; // Troquei Scissors por Cut

export default function SelectProfile() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-white font-sans">
      <div className="w-full max-w-sm p-10 space-y-10 rounded-[3rem] border border-slate-100 bg-white shadow-2xl">
        
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black italic lowercase tracking-tighter text-slate-900">
            barber.<span className="text-[#e6b32a]">flow</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[4px]">bem-vindo de volta</p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => navigate('/cliente/login')}
            className="group relative flex flex-col items-center gap-3 p-8 rounded-[2rem] border-2 border-slate-100 bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-900 text-white">
              <IoPersonOutline size={24} />
            </div>
            <span className="font-black uppercase text-xs tracking-widest text-slate-900">sou cliente</span>
          </button>

          <button
            onClick={() => navigate('/barbeiro/login')}
            className="group relative flex flex-col items-center gap-3 p-8 rounded-[2rem] border-2 border-slate-200 bg-white hover:border-slate-900 transition-all active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#e6b32a] text-black">
              <IoCutOutline size={24} />
            </div>
            <span className="font-black uppercase text-xs tracking-widest text-slate-900">sou barbeiro</span>
          </button>
        </div>

        <p className="text-[8px] text-center text-gray-300 font-bold uppercase tracking-widest">
          v 2.0.4 • 2026
        </p>
      </div>
    </div>
  );
}