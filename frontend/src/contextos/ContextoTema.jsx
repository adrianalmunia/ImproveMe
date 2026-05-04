import { createContext, useState, useEffect, useContext } from 'react';

const ContextoTema = createContext();

export function ProveedorTema({ children }) {
  const [temaOscuro, setTemaOscuro] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTemaOscuro(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else if (savedTheme === 'light') {
      setTemaOscuro(false);
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTemaOscuro(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  }, []);

  const toggleTema = () => {
    setTemaOscuro(prev => {
      const nuevoTemaOscuro = !prev;
      if (nuevoTemaOscuro) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return nuevoTemaOscuro;
    });
  };

  return (
    <ContextoTema.Provider value={{ temaOscuro, toggleTema }}>
      {children}
    </ContextoTema.Provider>
  );
}

export const useTema = () => {
  const contexto = useContext(ContextoTema);
  if (!contexto) {
    throw new Error('useTema debe usarse dentro de un ProveedorTema');
  }
  return contexto;
};
