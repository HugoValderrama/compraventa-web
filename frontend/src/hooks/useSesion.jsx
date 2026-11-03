import { useEffect, useState } from 'react';
import { getMe } from '../mocks/usuario';

// usuario === null y cargando === false  ->  visitante (sin sesión)
export default function useSesion() {
  const [estado, setEstado] = useState({ usuario: null, cargando: true });

  useEffect(() => {
    let activo = true;
    getMe()
      .then((usuario) => activo && setEstado({ usuario, cargando: false }))
      .catch(() => activo && setEstado({ usuario: null, cargando: false }));
    return () => {
      activo = false;
    };
  }, []);

  return estado;
}