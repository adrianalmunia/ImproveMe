import { createContext, useContext, useState, useEffect } from 'react';

const ContextoIdioma = createContext();

const traducciones = {
  es: {
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
    guardar: 'Guardar Cambios',
    actualizar_clave: 'Actualizar Clave',
    // ... más traducciones
  },
  en: {
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
    guardar: 'Save Changes',
    actualizar_clave: 'Update Password',
    // ... más traducciones
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
