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
        return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 text-center p-4">
        <div className="text-lg animate-pulse">Solicitando tu número...</div>
      </div>;
    }
    if (estado === 'error') {
        return <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-red-700 text-center p-4">
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p>{errorMsg || 'Ha ocurrido un problema.'}</p>
      </div>;
    }
    if (estado === 'esperando') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 text-blue-900 text-center p-4">
    <h1 className="text-6xl font-bold mb-4">N° {numero}</h1>
    <p className="text-lg mb-2">(Comercio: {comercioId})</p>
    <p className="text-md">Espera a ser llamado...</p>
  </div>
        );
    }
     if (estado === 'llamado') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 text-green-900 text-center p-4 animate-pulse">
            <h1 className="text-4xl font-bold mb-4">¡Es tu turno!</h1>
            <h2 className="text-6xl font-extrabold mb-2">N° {numero}</h2>
            <p className="text-lg mb-2">(Comercio: {comercioId})</p>
            <p className="text-md font-semibold">Dirígete a la atención.</p>
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
