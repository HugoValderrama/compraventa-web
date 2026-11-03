import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Título personalizado opcional para el navbar.
// Uso en una pantalla:  useTituloPantalla(tienda?.nombre)
const TituloContext = createContext({ titulo: '', setTitulo: () => {} })

export function TituloPantallaProvider({ children }) {
  const [titulo, setTitulo] = useState('')
  const valor = useMemo(() => ({ titulo, setTitulo }), [titulo])
  return <TituloContext.Provider value={valor}>{children}</TituloContext.Provider>
}

export function useTituloPantalla(texto) {
  const { setTitulo } = useContext(TituloContext)
  useEffect(() => {
    if (!texto) return undefined
    setTitulo(texto)
    return () => setTitulo('')
  }, [texto, setTitulo])
}

// Lo usa el navbar.
export function useTituloActual() {
  return useContext(TituloContext).titulo
}
