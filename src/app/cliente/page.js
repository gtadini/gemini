// src/app/cliente/page.js
"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase'; // Verifica ruta

// --- Componente Interno ---
function ClienteContenido() {
    const searchParams = useSearchParams();
    const comercioId = searchParams.get('comercioId');

    const [numero, setNumero] = useState(null); // El número asignado a ESTE cliente
    const [estado, setEstado] = useState('solicitando'); // Estados: 'solicitando', 'esperando', 'llamado', 'error'
    const [errorMsg, setErrorMsg] = useState('');

    // 1. Efecto para SOLICITAR número al cargar
    useEffect(() => {
        if (comercioId && estado === 'solicitando') {
            console.log(`Cliente: Solicitando número para comercio ${comercioId}`);
            setErrorMsg(''); // Limpiar errores previos

            fetch('../api/solicitar-numero', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comercioId }),
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || 'Error en la respuesta de la API') });
                }
                return res.json();
            })
            .then(data => {
                console.log(`Cliente: Número asignado recibido: ${data.numero}`);
                setNumero(data.numero);
                setEstado('esperando'); // Cambia estado a esperando el llamado
            })
            .catch(err => {
                console.error("Cliente: Error al solicitar número:", err);
                setErrorMsg(err.message || 'No se pudo obtener un número.');
                setEstado('error');
            });
        } else if (!comercioId && estado === 'solicitando') {
             setErrorMsg('ID de comercio no encontrado en URL.');
             setEstado('error');
        }
    }, [comercioId, estado]); // Depende del ID y del estado 'solicitando'

    // 2. Efecto para ESCUCHAR el estado una vez que tenemos número
    useEffect(() => {
        // Solo escuchar si tenemos comercioId, número asignado, y estamos esperando
        if (comercioId && numero !== null && estado === 'esperando') {
            const estadoRef = ref(db, `comercios/${comercioId}/cola/${numero}/status`);
            console.log(`Cliente (Nº ${numero}): Escuchando estado en ${estadoRef.toString()}`);

            const listener = onValue(estadoRef, (snapshot) => {
                const status = snapshot.val();
                console.log(`Cliente (Nº ${numero}): Estado recibido de Firebase: ${status}`);
                if (status === 'llamado') {
                    setEstado('llamado'); // Actualiza el estado local
                    // Podrías añadir una alerta visual/sonora aquí
                    alert(`¡Es tu turno! Número ${numero}`);
                }
                // Podrías manejar otros status si los implementas (ej. 'atendido')
            }, (firebaseError) => {
                 console.error(`Cliente (Nº ${numero}): Error escuchando estado:`, firebaseError);
                 setErrorMsg('Error de conexión para recibir llamado.');
                 setEstado('error');
                 // Considera si quieres detener el listener aquí
                 off(estadoRef, 'value', listener);
            });

            // Limpieza del listener
            return () => {
                console.log(`Cliente (Nº ${numero}): Dejando de escuchar estado.`);
                off(estadoRef, 'value', listener);
            };
        }
    }, [comercioId, numero, estado]); // Depende de tener ID, número, y estar 'esperando'

    // --- Renderizado Condicional ---
    if (estado === 'solicitando') {
        return <div>Solicitando tu número...</div>;
    }
    if (estado === 'error') {
        return <div>Error: {errorMsg || 'Ha ocurrido un problema.'}</div>;
    }
    if (estado === 'esperando') {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="max-w-sm w-full p-8 bg-white/80 rounded-2xl shadow-xl backdrop-blur-sm text-center">
          {/* Branding */}
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 mb-1 uppercase">eturnio.com</h2>
  
          {/* Mensaje principal */}
          <h1 className="text-gray-700 text-xl font-light mb-4">
            Tu número de turno es
          </h1>
  
          {/* Número asignado */}
          <div className="text-7xl font-bold text-indigo-600 mb-6 drop-shadow-sm">
            {numero}
          </div>
  
          {/* Instrucción */}
          <p className="text-sm text-gray-500">
            Mostralo cuando seas llamado.
          </p>
          <p className="text-sm text-gray-500">Comercio: La Fonte D'Oro</p>
        </div>
      </div>
        );
    }
     if (estado === 'llamado') {
        return (
            <div>
                <h1>¡Es tu turno!</h1>
                <h2>Tu número es: {numero}</h2>
                <p>(Comercio: {comercioId})</p>
                <p style={{ color: 'green', fontWeight: 'bold' }}>Dirígete a la atención.</p>
            </div>
        );
    }

    // Fallback por si acaso
    return <div>Cargando...</div>;
}

// --- Componente Principal con Suspense ---
export default function ClientePage() {
    return (
        <Suspense fallback={<div>Cargando Comercio...</div>}>
            <ClienteContenido />
        </Suspense>
    );
}
