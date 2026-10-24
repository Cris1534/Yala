import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { actualizarItem, encolarVenta, obtenerCola } from './db';

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [online, setOnline] = useState(navigator.onLine);
  const [cola, setCola] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  const sincronizandoRef = useRef(false);

  async function refrescarCola() {
    const items = await obtenerCola();
    setCola(items);
    return items;
  }

  async function sincronizar() {
    if (sincronizandoRef.current || !navigator.onLine) return;
    sincronizandoRef.current = true;
    setSincronizando(true);

    try {
      // FIFO por timestamp: la venta mas antigua gana en caso de conflicto de stock,
      // igual que define la regla de sincronizacion del documento (menor timestamp primero).
      const pendientes = (await obtenerCola()).filter((i) => i.estado === 'pendiente');

      for (const item of pendientes) {
        try {
          await api.post('/ventas', item.payload);
          await actualizarItem(item.id, { estado: 'sincronizado' });
        } catch (err) {
          const mensaje = err.response?.data?.message || 'Error al sincronizar';
          // Stock insuficiente u otro rechazo del servidor -> queda para revision manual,
          // igual que el estado 'pendiente_revision' documentado para conflictos de stock.
          await actualizarItem(item.id, { estado: 'conflicto', mensaje });
        }
      }
    } finally {
      await refrescarCola();
      sincronizandoRef.current = false;
      setSincronizando(false);
    }
  }

  useEffect(() => {
    refrescarCola();

    function handleOnline() {
      setOnline(true);
      sincronizar();
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) sincronizar();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function registrarVentaOffline(payload) {
    await encolarVenta(payload);
    await refrescarCola();
  }

  const pendientes = cola.filter((i) => i.estado === 'pendiente').length;
  const conflictos = cola.filter((i) => i.estado === 'conflicto').length;

  return (
    <OfflineContext.Provider
      value={{
        online,
        cola,
        pendientes,
        conflictos,
        sincronizando,
        registrarVentaOffline,
        sincronizar,
        refrescarCola,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}
