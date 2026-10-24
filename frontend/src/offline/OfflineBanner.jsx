import { useOffline } from './OfflineContext';

export default function OfflineBanner() {
  const { online, pendientes, conflictos, sincronizando } = useOffline();

  if (online && pendientes === 0 && conflictos === 0) return null;

  return (
    <div className={`offline-banner ${online ? 'offline-banner-sync' : 'offline-banner-off'}`}>
      {!online && '🔴 Sin conexion — modo offline activo. Las ventas se guardan en este dispositivo.'}
      {online && sincronizando && '🔄 Sincronizando ventas pendientes...'}
      {online && !sincronizando && pendientes > 0 && `⏳ ${pendientes} venta(s) pendiente(s) de sincronizar.`}
      {online && !sincronizando && conflictos > 0 && ` ⚠ ${conflictos} venta(s) con conflicto — revisa la cola offline.`}
    </div>
  );
}
