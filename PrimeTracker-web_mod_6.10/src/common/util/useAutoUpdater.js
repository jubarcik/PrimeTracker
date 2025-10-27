// src/common/util/useAutoUpdater.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  devicesActions,
  sessionActions,
  geofencesActions,
} from '../../store';

const UPDATE_INTERVAL = 10000; // 10 segundos

const useAutoUpdater = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAll = async () => {
      const start = performance.now();

      try {
        const [devicesRes, positionsRes, geofencesRes] = await Promise.all([
          fetch('/api/devices'),
          fetch('/api/positions'),
          fetch('/api/geofences'),
        ]);

        // log de status HTTP pra depuração
        if (!devicesRes.ok) console.warn('[AutoUpdate] /api/devices falhou:', devicesRes.status);
        if (!positionsRes.ok) console.warn('[AutoUpdate] /api/positions falhou:', positionsRes.status);
        if (!geofencesRes.ok) console.warn('[AutoUpdate] /api/geofences falhou:', geofencesRes.status);

        const devicesJson = devicesRes.ok ? await devicesRes.json() : [];
        const positionsJson = positionsRes.ok ? await positionsRes.json() : [];
        const geofencesJson = geofencesRes.ok ? await geofencesRes.json() : [];

        const devicesArray = Array.isArray(devicesJson) ? devicesJson : [devicesJson].filter(Boolean);
        const positionsArray = Array.isArray(positionsJson) ? positionsJson : [positionsJson].filter(Boolean);
        const geofencesArray = Array.isArray(geofencesJson) ? geofencesJson : [geofencesJson].filter(Boolean);

        if (devicesArray.length) dispatch(devicesActions.refresh(devicesArray));
        if (positionsArray.length) dispatch(sessionActions.updatePositions(positionsArray));
        if (geofencesArray.length) dispatch(geofencesActions.refresh(geofencesArray));

        const elapsed = (performance.now() - start).toFixed(0);
        console.log(
          `%c[AutoUpdate] ✅ ${new Date().toLocaleTimeString()} | Devices: ${devicesArray.length} | Positions: ${positionsArray.length} | Geofences: ${geofencesArray.length} | ${elapsed}ms`,
          'color: #00c853; font-weight: bold;'
        );
      } catch (err) {
        console.error('[AutoUpdate] ❌ Erro geral:', err);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, UPDATE_INTERVAL);

    return () => {
      clearInterval(interval);
      console.log('[AutoUpdate] ⏹ Atualização automática interrompida.');
    };
  }, [dispatch]);
};

export default useAutoUpdater;
