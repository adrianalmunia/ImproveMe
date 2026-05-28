import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Zap, TrendingUp, CheckCircle2, Brain, X, Sun, Moon, Accessibility, Type, BookOpen, Globe } from 'lucide-react';
import { useTema } from '../contextos/ContextoTema';
import { useAccesibilidad } from '../contextos/ContextoAccesibilidad';
import { useIdioma } from '../contextos/ContextoIdioma';
import logoCompleto from '../assets/logo_completo.png';
import {
  MoodDoughnutChart, MeditationCard, SleepScatterChart, HabitCard,
  MoodLineChart, HabitHeatmap, RankPreview, features
} from './SeccionesLanding';

const LandingPage = ({ onIrAAutenticacion }) => {
  const { temaOscuro, toggleTema } = useTema();
  const { letraGrande, fuenteDislexia, toggleLetraGrande, toggleFuenteDislexia } = useAccesibilidad();
  const { idioma, setIdioma, t } = useIdioma();
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [mostrarAcerca, setMostrarAcerca] = useState(false);
  const [mostrarReportarError, setMostrarReportarError] = useState(false);
  const [descripcionError, setDescripcionError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviadoExito, setEnviadoExito] = useState(false);

  // Accesibilidad
  const [panelAccesibilidad, setPanelAccesibilidad] = useState(false);
  const panelRef = useRef(null);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelAccesibilidad(false);
      }
    };
    if (panelAccesibilidad) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelAccesibilidad]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 font-['Inter'] selection:bg-blue-100 selection:text-blue-600 transition-colors duration-300 overflow-x-hidden">

      {/* ══════ NAVBAR ══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/40 dark:border-gray-800/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logoCompleto} alt="ImproveMe" className="h-9 object-contain" />
          </div>
          <div className="flex items-center gap-3">
            {/* ── Accesibilidad ── */}
            <div className="relative" ref={panelRef}>
              <button
                onClick={() => setPanelAccesibilidad(v => !v)}
                className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center border ${
                  panelAccesibilidad || letraGrande || fuenteDislexia
                    ? 'text-[#4F99CC] bg-blue-50 dark:bg-blue-900/30 border-blue-200/40 dark:border-blue-700/40'
                    : 'text-gray-500 hover:text-[#2C4159] dark:text-gray-400 dark:hover:text-white bg-gray-100/50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800/80 border-gray-200/20 dark:border-gray-700/20'
                }`}
                title="Opciones de accesibilidad"
                aria-label="Opciones de accesibilidad"
              >
                <Accessibility size={18} />
              </button>

              <AnimatePresence>
                {panelAccesibilidad && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/60 p-4 z-50"
                  >
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">Accesibilidad</p>

                    {/* Texto grande */}
                    <button
                      onClick={() => toggleLetraGrande()}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        letraGrande
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-[#4F99CC]'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        letraGrande ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <Type size={15} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold leading-tight">Texto grande</p>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Aumenta el tamaño base</p>
                      </div>
                      <div className={`ml-auto w-8 h-5 rounded-full transition-colors relative shrink-0 ${
                        letraGrande ? 'bg-[#4F99CC]' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          letraGrande ? 'left-3.5' : 'left-0.5'
                        }`} />
                      </div>
                    </button>

                    {/* Fuente para dislexia */}
                    <button
                      onClick={() => toggleFuenteDislexia()}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mt-1 ${
                        fuenteDislexia
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-[#4F99CC]'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        fuenteDislexia ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <BookOpen size={15} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold leading-tight">Fuente dislexia</p>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">OpenDyslexic</p>
                      </div>
                      <div className={`ml-auto w-8 h-5 rounded-full transition-colors relative shrink-0 ${
                        fuenteDislexia ? 'bg-[#4F99CC]' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          fuenteDislexia ? 'left-3.5' : 'left-0.5'
                        }`} />
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Idioma ── */}
            <button
              onClick={() => setIdioma(idioma === 'es' ? 'en' : idioma === 'en' ? 'fr' : 'es')}
              className={`h-9 px-3 rounded-full transition-all duration-300 flex items-center gap-1.5 border text-xs font-bold tracking-wide ${
                idioma !== 'es'
                  ? 'text-[#4F99CC] bg-blue-50 dark:bg-blue-900/30 border-blue-200/40 dark:border-blue-700/40'
                  : 'text-gray-500 hover:text-[#2C4159] dark:text-gray-400 dark:hover:text-white bg-gray-100/50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800/80 border-gray-200/20 dark:border-gray-700/20'
              }`}
              title={idioma === 'es' ? 'Switch to English' : idioma === 'en' ? 'Passer au Français' : 'Cambiar a Español'}
              aria-label="Cambiar idioma"
            >
              <Globe size={14} />
              {idioma === 'es' ? 'ES' : idioma === 'en' ? 'EN' : 'FR'}
            </button>

            {/* ── Tema ── */}
            <button onClick={toggleTema}
              className="p-2.5 text-gray-500 hover:text-[#2C4159] dark:text-gray-400 dark:hover:text-white bg-gray-100/50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800/80 rounded-full transition-all duration-300 flex items-center justify-center border border-gray-200/20 dark:border-gray-700/20"
              title={temaOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {temaOscuro ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => onIrAAutenticacion('login')}
              className="hidden sm:block px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-[#2C4159] dark:hover:text-white transition-colors">
              {t('landing_nav_iniciar')}
            </button>
            <button onClick={() => onIrAAutenticacion('registro')}
              className="px-5 py-2 bg-[#2C4159] dark:bg-white text-white dark:text-[#2C4159] rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
              {t('landing_nav_empezar')}
            </button>
          </div>
        </div>
      </nav>

      {/* ══════ HERO ══════ */}
      <section className="pt-36 pb-6 md:pt-44 md:pb-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl sm:text-6xl md:text-8xl font-['Tilt_Warp'] text-[#2C4159] dark:text-white leading-[1.05] tracking-tight mb-6"
          >
            {t('landing_hero_mejor')}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl sm:text-6xl md:text-8xl font-['Tilt_Warp'] text-transparent bg-clip-text bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] leading-[1.05] tracking-tight mb-10"
          >
            {t('landing_hero_dia')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10 font-medium leading-relaxed"
          >
            {t('landing_hero_desc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button onClick={() => onIrAAutenticacion('registro')}
              className="px-8 py-4 bg-[#4F99CC] text-white rounded-full font-semibold text-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
              {t('landing_hero_gratis')} <ArrowRight size={20} />
            </button>
            <button onClick={() => onIrAAutenticacion('login')}
              className="px-8 py-4 text-[#2C4159] dark:text-white font-semibold text-lg hover:text-[#4F99CC] transition-colors">
              {t('landing_hero_cuenta')}
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
            <Shield size={13} /> {t('landing_hero_tarjeta')}
          </motion.p>
        </div>
      </section>

      {/* ══════ DASHBOARD PREVIEW ══════ */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
          >
            <div className="space-y-8">
              <MoodDoughnutChart />
              <SleepScatterChart />
            </div>
            <div className="space-y-8 md:mt-12">
              <MeditationCard />
              <HabitCard />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ FEATURES GRID ══════ */}
      <section className="py-24 bg-white dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-['Tilt_Warp'] text-[#2C4159] dark:text-white mb-4"
            >
              {t('landing_features_titulo')}
            </motion.h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
              {t('landing_features_subtitulo')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -8 }}
                className={`p-8 bg-[#fafafa] dark:bg-gray-900 rounded-[32px] border-2 border-transparent ${f.border} transition-all group cursor-default`}
              >
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 ${f.color} group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-[#2C4159] dark:text-white mb-3">{t(f.titleKey)}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ INTELIGENCIA DE DATOS ══════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-8">
              <Brain size={16} /> {t('landing_intel_tag')}
            </div>
            <h2 className="text-3xl md:text-5xl font-['Tilt_Warp'] text-[#2C4159] dark:text-white leading-tight mb-8">
              {t('landing_intel_titulo_1')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-[#4F99CC]">{t('landing_intel_titulo_2')}</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 font-medium leading-relaxed">
              {t('landing_intel_desc')}
            </p>
            <ul className="space-y-5">
              {[
                'landing_intel_bullet_1',
                'landing_intel_bullet_2',
                'landing_intel_bullet_3',
                'landing_intel_bullet_4'
              ].map((key, i) => (
                <motion.li key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-[#2C4159] dark:text-gray-300 font-bold"
                >
                  <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  {t(key)}
                </motion.li>
              ))}
            </ul>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-5"
          >
            <MoodLineChart />
            <HabitHeatmap />
          </motion.div>
        </div>
      </section>

      {/* ══════ GAMIFICACIÓN ══════ */}
      <section className="py-28 bg-[#0f172a] text-white overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/8 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/8 blur-[150px] rounded-full" />
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-6xl font-['Tilt_Warp'] mb-4">
              {t('landing_gami_titulo_1')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C6A55E] to-red-400">
                {t('landing_gami_titulo_2')}
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium mb-14">
              {t('landing_gami_desc')}
            </p>
          </motion.div>

          <div className="mb-16"><RankPreview /></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto text-left"
          >
            {[
              { icon: <Zap size={20} />, title: t('landing_gami_xp_title'), desc: t('landing_gami_xp_desc') },
              { icon: <TrendingUp size={20} />, title: t('landing_gami_liga_title'), desc: t('landing_gami_liga_desc') },
              { icon: <Shield size={20} />, title: t('landing_gami_racha_title'), desc: t('landing_gami_racha_desc') },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <div className="w-10 h-10 bg-[#C6A55E]/20 rounded-xl flex items-center justify-center text-[#C6A55E] mb-4">
                  {item.icon}
                </div>
                <h4 className="font-black text-white mb-2">{item.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          <button onClick={() => onIrAAutenticacion('registro')}
            className="px-10 py-5 bg-white text-[#0f172a] rounded-full font-bold text-lg hover:scale-105 transition-all active:scale-95">
            {t('landing_gami_unete')}
          </button>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className="py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <img src={logoCompleto} alt="ImproveMe" className="h-14 mx-auto mb-10 opacity-70" />
            <h2 className="text-3xl md:text-5xl font-['Tilt_Warp'] text-[#2C4159] dark:text-white mb-5">
              {t('landing_cta_titulo')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto mb-10 font-medium">
              {t('landing_cta_desc')}
            </p>
            <button onClick={() => onIrAAutenticacion('registro')}
              className="px-10 py-5 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] text-white rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform active:scale-95 inline-flex items-center gap-2">
              {t('landing_cta_crear')} <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="py-8 md:py-12 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <img src={logoCompleto} alt="ImproveMe" className="h-7 md:h-8 object-contain" />
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <button onClick={() => setMostrarAcerca(true)}
              className="text-gray-400 hover:text-[#2C4159] dark:hover:text-white font-medium text-sm transition-colors">
              {t('landing_footer_acerca')}
            </button>
            <button onClick={() => setMostrarTerminos(true)}
              className="text-gray-400 hover:text-[#2C4159] dark:hover:text-white font-medium text-sm transition-colors">
              {t('landing_footer_terminos')}
            </button>
            <button onClick={() => setMostrarReportarError(true)}
              className="text-gray-400 hover:text-[#2C4159] dark:hover:text-white font-medium text-sm transition-colors">
              {t('landing_footer_error')}
            </button>
          </div>
          <p className="text-gray-400 text-sm">© 2026 ImproveMe</p>
        </div>
      </footer>

      {/* ══════ MODAL TÉRMINOS ══════ */}
      <AnimatePresence>
        {mostrarTerminos && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-12">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-3xl h-[80vh] bg-white rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative">
              <div className="p-12 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] flex justify-between items-center shrink-0 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                <h2 className="text-3xl font-['Tilt_Warp'] text-white relative z-10">{t('landing_modal_term_titulo')}</h2>
                <button onClick={() => setMostrarTerminos(false)}
                  className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors relative z-10 backdrop-blur-md border border-white/30">
                  <X />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 text-gray-600 space-y-6">
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">{t('landing_modal_term_1_title')}</h3>
                  <p className="text-sm leading-relaxed">{t('landing_modal_term_1_desc')}</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">{t('landing_modal_term_2_title')}</h3>
                  <p className="text-sm leading-relaxed">{t('landing_modal_term_2_desc')}</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">{t('landing_modal_term_3_title')}</h3>
                  <p className="text-sm leading-relaxed">{t('landing_modal_term_3_desc')}</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">{t('landing_modal_term_4_title')}</h3>
                  <p className="text-sm leading-relaxed">{t('landing_modal_term_4_desc')}</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">{t('landing_modal_term_5_title')}</h3>
                  <p className="text-sm leading-relaxed">{t('landing_modal_term_5_desc')}</p>
                </section>
                <div className="pt-8 text-center border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{t('landing_modal_term_act')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ MODAL SOBRE EL PROYECTO ══════ */}
      <AnimatePresence>
        {mostrarAcerca && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-12">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-3xl h-[80vh] bg-white rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative">
              <div className="p-12 bg-gradient-to-r from-[#4F99CC] to-[#C6A55E] flex justify-between items-center shrink-0 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                <h2 className="text-3xl font-['Tilt_Warp'] text-white relative z-10">{t('landing_modal_acerca_titulo')}</h2>
                <button onClick={() => setMostrarAcerca(false)}
                  className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors relative z-10 backdrop-blur-md border border-white/30">
                  <X />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 text-gray-600 space-y-6">
                <div className="flex justify-center mb-8">
                  <img src={logoCompleto} alt="Logo" className="h-20" />
                </div>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">{t('landing_modal_mision_title')}</h3>
                  <p className="text-sm leading-relaxed text-justify">{t('landing_modal_mision_desc')}</p>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">{t('landing_modal_chars_title')}</h3>
                  <ul className="list-disc list-inside text-sm space-y-2 ml-2">
                    <li>{t('landing_modal_chars_1')}</li>
                    <li>{t('landing_modal_chars_2')}</li>
                    <li>{t('landing_modal_chars_3')}</li>
                    <li>{t('landing_modal_chars_4')}</li>
                  </ul>
                </section>
                <section>
                  <h3 className="font-bold text-gray-800 mb-2 uppercase tracking-widest text-xs">{t('landing_modal_tec_title')}</h3>
                  <p className="text-sm leading-relaxed">{t('landing_modal_tec_desc')}</p>
                </section>
                <div className="pt-8 text-center border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{t('landing_modal_footer')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ MODAL REPORTAR ERROR ══════ */}
      <AnimatePresence>
        {mostrarReportarError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-12">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-3xl h-[85vh] bg-white rounded-[48px] overflow-hidden flex flex-col shadow-2xl relative">

              <div className="p-12 bg-[#2C4159] flex justify-between items-center shrink-0 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                <div>
                  <h2 className="text-3xl font-['Tilt_Warp'] text-white relative z-10">{t('landing_modal_err_titulo')}</h2>
                  <p className="text-white/60 text-sm font-medium mt-1 relative z-10">{t('landing_modal_err_sub')}</p>
                </div>
                <button onClick={() => setMostrarReportarError(false)}
                  className="w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors relative z-10 backdrop-blur-md border border-white/20">
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 text-gray-600 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs flex items-center gap-2">
                    <Brain size={14} className="text-[#4F99CC]" /> {t('landing_modal_err_sis')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('landing_modal_err_nav')}</p>
                      <p className="text-xs font-mono text-gray-600 break-all">{navigator.userAgent.split(' ').slice(-3).join(' ')}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('landing_modal_err_plat')}</p>
                      <p className="text-xs font-mono text-gray-600">{navigator.platform || 'Desconocida'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('landing_modal_err_res')}</p>
                      <p className="text-xs font-mono text-gray-600">{window.screen.width}x{window.screen.height}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('landing_modal_err_idioma')}</p>
                      <p className="text-xs font-mono text-gray-600">{navigator.language}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs">{t('landing_modal_err_inc')}</h3>
                  <textarea
                    value={descripcionError}
                    onChange={(e) => setDescripcionError(e.target.value)}
                    placeholder={t('landing_modal_err_placeholder')}
                    className="w-full h-40 p-6 bg-gray-50 rounded-[32px] border-2 border-transparent focus:border-[#4F99CC] focus:bg-white outline-none transition-all resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium max-w-xs text-center sm:text-left">
                    {t('landing_modal_err_nota')}
                  </p>
                  <button
                    disabled={!descripcionError.trim() || enviando}
                    onClick={async () => {
                      try {
                        setEnviando(true);
                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                        const response = await fetch(`${API_URL}/soporte/reportar-error`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            descripcion: descripcionError,
                            infoTecnica: {
                              agente: navigator.userAgent,
                              plataforma: navigator.platform,
                              resolucion: `${window.screen.width}x${window.screen.height}`,
                              idioma: navigator.language,
                              url: window.location.href
                            }
                          })
                        });

                        if (response.ok) {
                          setEnviadoExito(true);
                          setTimeout(() => {
                            setMostrarReportarError(false);
                            setEnviadoExito(false);
                            setDescripcionError('');
                          }, 2000);
                        } else {
                          alert('Error al enviar el reporte. Por favor, inténtalo de nuevo.');
                        }
                      } catch (error) {
                        console.error('Error:', error);
                        alert('No se pudo conectar con el servidor.');
                      } finally {
                        setEnviando(false);
                      }
                    }}
                    className={`px-8 py-4 ${enviadoExito ? 'bg-green-500' : 'bg-[#2C4159]'} text-white rounded-full font-bold text-sm hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2`}
                  >
                    {enviadoExito ? t('landing_modal_err_enviado') : enviando ? t('landing_modal_err_enviando') : t('landing_modal_err_btn')}
                    {!enviadoExito && !enviando && <ArrowRight size={16} />}
                    {enviadoExito && <CheckCircle2 size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LandingPage;
