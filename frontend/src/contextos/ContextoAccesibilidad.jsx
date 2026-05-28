import { createContext, useState, useEffect, useContext } from 'react';

const ContextoAccesibilidad = createContext();

export function ProveedorAccesibilidad({ children }) {
  const [letraGrande, setLetraGrande] = useState(false);
  const [fuenteDislexia, setFuenteDislexia] = useState(false);

  // Leer preferencias guardadas al montar (igual que hace ContextoTema)
  useEffect(() => {
    const html = document.documentElement;

    if (localStorage.getItem('acc_letraGrande') === 'true') {
      setLetraGrande(true);
      html.classList.add('acc-letra-grande');
    }
    if (localStorage.getItem('acc_fuenteDislexia') === 'true') {
      setFuenteDislexia(true);
      html.classList.add('acc-dislexia');
    }
  }, []);

  const toggleLetraGrande = () => {
    setLetraGrande(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('acc-letra-grande');
        localStorage.setItem('acc_letraGrande', 'true');
      } else {
        document.documentElement.classList.remove('acc-letra-grande');
        localStorage.setItem('acc_letraGrande', 'false');
      }
      return next;
    });
  };

  const toggleFuenteDislexia = () => {
    setFuenteDislexia(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('acc-dislexia');
        localStorage.setItem('acc_fuenteDislexia', 'true');
      } else {
        document.documentElement.classList.remove('acc-dislexia');
        localStorage.setItem('acc_fuenteDislexia', 'false');
      }
      return next;
    });
  };

  return (
    <ContextoAccesibilidad.Provider value={{ letraGrande, fuenteDislexia, toggleLetraGrande, toggleFuenteDislexia }}>
      {children}
    </ContextoAccesibilidad.Provider>
  );
}

export const useAccesibilidad = () => {
  const contexto = useContext(ContextoAccesibilidad);
  if (!contexto) {
    throw new Error('useAccesibilidad debe usarse dentro de un ProveedorAccesibilidad');
  }
  return contexto;
};
