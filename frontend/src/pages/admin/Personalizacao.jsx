import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import AdminLayout from '../../layout/AdminLayout';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert';

// Importação dos ícones
import { 
    IoSaveOutline, IoColorPaletteOutline, IoCallOutline, 
    IoLocationOutline, IoLogoInstagram, IoCheckmarkCircle 
} from 'react-icons/io5';

// --- NOVA IMPORTAÇÃO DAS SUAS IMAGENS ---
// Ajuste o caminho se sua estrutura de pastas for diferente (ex: ../../assets)
import imgPreviewPadrao from '../../assets/preview_padrao.png'; // ou .jpg, .svg
import imgPreviewPremiumRetro from '../../assets/preview_premium_retro.png';

export default function Personalizacao() {
    const { id } = useParams();
    const { isDarkMode } = useTheme();
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: '' });
    
    const [formData, setFormData] = useState({
        layout_key: 'padrao',
        whatsapp: '',
        endereco: '',
        instagram: ''
    });

    // --- LÓGICA DE DADOS (Inalterada) ---
    const fetchBarbearia = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/barbearias');
            const barbearias = res.data || res;
            const b = barbearias.find(val => 
                String(val._id) === String(id) || 
                String(val.fk_admin?._id || val.fk_admin) === String(id)
            );
            if (b) {
                setFormData({
                    layout_key: b.layout_key || 'padrao',
                    whatsapp: b.whatsapp || '',
                    endereco: b.endereco || '',
                    instagram: b.instagram || ''
                });
            }
        } catch (error) {
            setAlertConfig({ show: true, message: 'Erro ao carregar dados.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { if (id) fetchBarbearia(); }, [id, fetchBarbearia]);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
        // 1. Buscamos todas as barbearias
        const resList = await api.get('/barbearias');
        const barbearias = resList.data || resList;

        // 2. Encontramos a barbearia que pertence a este Admin (id da URL)
        // Verificamos se o ID da URL bate com o _id da barbearia OU com o fk_admin
        const b = barbearias.find(val => 
            String(val._id) === String(id) || 
            String(val.fk_admin?._id || val.fk_admin) === String(id)
        );

        if (!b) {
            setAlertConfig({ show: true, message: 'Barbearia não encontrada para este usuário.', type: 'error' });
            setSubmitting(false);
            return;
        }

        // 3. O SEGREDO: Fazemos o PUT usando o ID REAL da barbearia (b._id)
        // e enviamos apenas os campos que o seu Model aceita
        const dadosParaSalvar = {
            layout_key: formData.layout_key,
            whatsapp: formData.whatsapp,
            instagram: formData.instagram,
            endereco: formData.endereco
        };

        await api.put(`/barbearias/${b._id}`, dadosParaSalvar);
        
        setAlertConfig({ show: true, message: 'Configurações salvas com sucesso!', type: 'success' });
    } catch (error) {
        console.error("Erro detalhado:", error.response?.data || error.message);
        setAlertConfig({ 
            show: true, 
            message: error.response?.data?.error || 'Erro ao conectar com o servidor.', 
            type: 'error' 
        });
    } finally {
        setSubmitting(false);
    }
};
    const inputClass = `w-full rounded-2xl p-4 text-sm font-bold border outline-none transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-[#e6b32a]' : 'bg-slate-50 border-slate-200 focus:border-[#e6b32a]'}`;
    const labelClass = "text-[9px] uppercase font-black opacity-40 ml-1 flex items-center gap-2 mb-1";

    // --- CONFIGURAÇÃO DOS TEMAS ---
    const temasDisponiveis = [
        { 
            key: 'padrao', 
            label: 'Padrão Moderno', 
            desc: 'Minimalista, dark mode e clean.',
            image: imgPreviewPadrao // Associa a imagem importada
        },
        { 
            key: 'premium_retro', 
            label: 'Premium Retro', 
            desc: 'Elegante, clássico e vintage.',
            image: imgPreviewPremiumRetro // Associa a imagem importada
        }
    ];

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
                <header className="mb-10">
                    <h1 className="text-3xl font-black italic lowercase tracking-tighter leading-none">
                        visual.<span className="text-[#e6b32a]">setup</span>
                    </h1>
                </header>

                {alertConfig.show && (
                    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[90%] md:w-auto">
                        <CustomAlert message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />
                    </div>
                )}

                {!loading && (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* SEÇÃO: ESCOLHA DO TEMA (Com Imagens Reais) */}
                        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <IoColorPaletteOutline className="text-[#e6b32a]" size={24} />
                                <h2 className="text-xl font-black lowercase tracking-tighter">Selecione o Visual</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {temasDisponiveis.map((tema) => (
                                    <button
                                        key={tema.key}
                                        type="button"
                                        onClick={() => setFormData({...formData, layout_key: tema.key})}
                                        className={`group relative p-3 rounded-[2rem] border-2 text-left transition-all ${
                                            formData.layout_key === tema.key 
                                            ? 'border-[#e6b32a] bg-[#e6b32a]/5 shadow-2xl scale-[1.02]' 
                                            : isDarkMode ? 'border-white/5 opacity-40 hover:opacity-100' : 'border-slate-100 opacity-40 hover:opacity-100'
                                        }`}
                                    >
                                        {/* CONTAINER DA IMAGEM DE PREVIEW */}
                                        <div className="w-full h-40 rounded-2xl mb-4 overflow-hidden border border-black/5 z-0 relative">
                                            <img 
                                                src={tema.image} 
                                                alt={`Preview do tema ${tema.label}`} 
                                                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {/* Overlay sutil para destacar o texto */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        </div>
                                        
                                        <div className="flex items-center justify-between px-2 pb-1 relative z-10">
                                            <div>
                                                <span className="block font-black uppercase text-[12px] tracking-widest text-white drop-shadow-md">
                                                    {tema.label}
                                                </span>
                                                <span className="text-[10px] italic opacity-70 text-white drop-shadow-md">
                                                    {tema.desc}
                                                </span>
                                            </div>
                                            {formData.layout_key === tema.key && <IoCheckmarkCircle className="text-[#e6b32a]" size={28} />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SEÇÃO: CONTATOS (Inalterada) */}
                        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <IoCallOutline className="text-[#e6b32a]" size={24} />
                                <h2 className="text-xl font-black lowercase tracking-tighter">Contatos & Localização</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className={labelClass}><IoCallOutline /> WhatsApp (Link Direto)</label>
                                    <input type="text" placeholder="Ex: 11999998888" className={inputClass} value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}><IoLogoInstagram /> Instagram User</label>
                                    <input type="text" placeholder="Ex: minha.barbearia" className={inputClass} value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <label className={labelClass}><IoLocationOutline /> Endereço Completo</label>
                                    <input type="text" placeholder="Rua Exemplo, 123 - Centro" className={inputClass} value={formData.endereco} onChange={(e) => setFormData({...formData, endereco: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className={`w-full py-5 bg-[#e6b32a] text-black rounded-[1.5rem] text-xs font-black uppercase tracking-[2px] shadow-xl shadow-[#e6b32a]/20 flex items-center justify-center gap-3 transition-all ${submitting ? 'opacity-50' : 'active:scale-[0.98] hover:brightness-110'}`}
                        >
                            {submitting ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><IoSaveOutline size={18} /> Aplicar Alterações</>}
                        </button>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}