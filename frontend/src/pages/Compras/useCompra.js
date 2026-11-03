import { useEffect, useState } from 'react'
import { obtenerCompra } from '../../mocks/compras'

export default function useCompra(id) {
  const [estado, setEstado] = useState({ compra: null, cargando: true, error: '' })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let activo = true
    setEstado({ compra: null, cargando: true, error: '' })

    obtenerCompra(id)
      .then((compra) => {
        if (activo) setEstado({ compra, cargando: false, error: '' })
      })
      .catch(() => {
        if (activo) {
          setEstado({ compra: null, cargando: false, error: 'No se pudo cargar la compra.' })
        }
      })

    return () => {
      activo = false
    }
  }, [id, intento])

  return { ...estado, reintentar: () => setIntento((n) => n + 1) }
}