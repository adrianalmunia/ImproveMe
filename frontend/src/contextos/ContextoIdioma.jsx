import { createContext, useContext, useState, useEffect } from 'react';

const ContextoIdioma = createContext();

const traducciones = {
  es: {
    // Navegación
    nav_inicio: 'Inicio',
    nav_diario: 'Diario',
    nav_registros: 'Registros',
    nav_estadisticas: 'Estadísticas',
    nav_habitos: 'Hábitos',
    nav_meditacion: 'Meditación',
    nav_ranked: 'Ránking',
    nav_calendario: 'Calendario',
    nav_usuario: 'Usuario',

    // Comunes
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    confirmar: 'Confirmar',
    cargando: 'Cargando...',
    error: 'Error',
    exito: '¡Éxito!',

    // Pantalla Usuario
    perfil: 'Perfil',
    datos_personales: 'Datos Personales',
    seguridad: 'Seguridad',
    idioma: 'Idioma',
    galeria: 'Galería',
    acerca_de: 'Acerca de',
    terminos: 'Términos',
    exportar: 'Exportar Datos',
    modo_oscuro: 'Modo Oscuro',
    modo_claro: 'Modo Claro',
    cerrar_sesion: 'Cerrar Sesión',
    actualizar_clave: 'Actualizar Clave',
    zona_peligro: 'Zona de Peligro',
    eliminar_cuenta: 'Eliminar Cuenta Permanente',
    
    // Diario
    diario_titulo: '¿Cómo va tu día?',
    diario_placeholder: 'Cuéntame algo...',
    diario_sueno: 'Horas de sueño',
    diario_animo: 'Estado de ánimo',
    diario_multimedia: 'Multimedia',
    
    // Estadísticas
    stats_titulo: 'Tu Progreso',
    stats_animo_medio: 'Ánimo Medio',
    stats_sueno_medio: 'Sueño Medio',
    stats_racha_max: 'Racha Máxima',

    // Meditación
    med_titulo: 'Momento de Calma',
    med_comenzar: 'Comenzar Sesión',
    med_finalizada: '¡Sesión Completada!',
    med_minutos: 'Minutos',
    med_tecnica: 'Técnica de Respiración',
    med_musica: 'Música Ambiental'
  },
  en: {
    // Navigation
    nav_inicio: 'Home',
    nav_diario: 'Journal',
    nav_registros: 'Logs',
    nav_estadisticas: 'Stats',
    nav_habitos: 'Habits',
    nav_meditacion: 'Meditation',
    nav_ranked: 'Ranking',
    nav_calendario: 'Calendar',
    nav_usuario: 'User',

    // Common
    guardar: 'Save',
    cancelar: 'Cancel',
    confirmar: 'Confirm',
    cargando: 'Loading...',
    error: 'Error',
    exito: 'Success!',

    // User Screen
    perfil: 'Profile',
    datos_personales: 'Personal Data',
    seguridad: 'Security',
    idioma: 'Language',
    galeria: 'Gallery',
    acerca_de: 'About',
    terminos: 'Terms',
    exportar: 'Export Data',
    modo_oscuro: 'Dark Mode',
    modo_claro: 'Light Mode',
    cerrar_sesion: 'Logout',
    actualizar_clave: 'Update Password',
    zona_peligro: 'Danger Zone',
    eliminar_cuenta: 'Delete Account Permanently',

    // Journal
    diario_titulo: 'How is your day?',
    diario_placeholder: 'Tell me something...',
    diario_sueno: 'Sleep hours',
    diario_animo: 'Mood',
    diario_multimedia: 'Multimedia',

    // Stats
    stats_titulo: 'Your Progress',
    stats_animo_medio: 'Average Mood',
    stats_sueno_medio: 'Average Sleep',
    stats_racha_max: 'Max Streak',

    // Meditation
    med_titulo: 'Calm Moment',
    med_comenzar: 'Start Session',
    med_finalizada: 'Session Completed!',
    med_minutos: 'Minutes',
    med_tecnica: 'Breathing Technique',
    med_musica: 'Ambient Music'
  }
};

export function ProveedorIdioma({ children }) {
  const [idioma, setIdioma] = useState(() => {
    return localStorage.getItem('improveme_idioma') || 'es';
  });

  useEffect(() => {
    localStorage.setItem('improveme_idioma', idioma);
  }, [idioma]);

  const t = (key) => traducciones[idioma][key] || key;

  return (
    <ContextoIdioma.Provider value={{ idioma, setIdioma, t }}>
      {children}
    </ContextoIdioma.Provider>
  );
}

export function useIdioma() {
  return useContext(ContextoIdioma);
}
