// src/app/comercio/page.js
"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase'; // Verifica ruta

function ComercioPage() {
    const [numeroLlamado, setNumeroLlamado] = useState(0); // El número actualmente llamado
    const [clientesEnEspera, setClientesEnEspera] = useState(0); // Contador de espera
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [calling, setCalling] = useState(false); // Para deshabilitar botón mientras llama

    // ID del comercio (Hardcodeado - Idealmente de Auth)
    const comercioId = "ID_COMERCIO_1"; // Asegúrate que sea el MISMO ID que usa el cliente

    // Efecto para escuchar el número llamado actual y la cola
    useEffect(() => {
        setLoading(true);
        const llamadoRef = ref(db, `comercios/${comercioId}/numeroLlamadoActual`);
        const colaRef = ref(db, `comercios/${comercioId}/cola`);

        const llamadoListener = onValue(llamadoRef, (snapshot) => {
            setNumeroLlamado(snapshot.val() || 0); // Si no existe, es 0
            setLoading(false); // Dejar de cargar después de la primera lectura
        }, (err) => {
             console.error("Error escuchando numeroLlamadoActual:", err);
             setError("Error al obtener estado actual.");
             setLoading(false);
        });

        const colaListener = onValue(colaRef, (snapshot) => {
            if (snapshot.exists()) {
                const colaData = snapshot.val();
                const enEspera = Object.values(colaData).filter(c => c.status === 'esperando').length;
                setClientesEnEspera(enEspera);
            } else {
                setClientesEnEspera(0);
            }
        }, (err) => {
            console.error("Error escuchando la cola:", err);
            // Puedes decidir si mostrar error aquí también
        });

        // Limpieza de listeners
        return () => {
            off(llamadoRef, 'value', llamadoListener);
            off(colaRef, 'value', colaListener);
        };
    }, [comercioId]);

    const handleLlamarSiguiente = async () => {
        setError(null);
        setCalling(true); // Deshabilita botón
        console.log(`Comercio: Intentando llamar al siguiente para ${comercioId}`);

        try {
            const response = await fetch('/api/llamar-siguiente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comercioId }),
            });
    
            const text = await response.text(); // <-- leemos como texto primero
            const data = text ? JSON.parse(text) : {}; // <-- parseamos solo si hay texto
    
            if (!response.ok) {
                throw new Error(data.message || data.error || `Error ${response.status}`);
            }
    
            console.log("Comercio: API respondió, número llamado:", data.numeroLlamado);

        } catch (err) {
            console.error("Comercio: Error al llamar siguiente:", err);
            setError(err.message || "No se pudo llamar al siguiente cliente.");
        } finally {
             setCalling(false); // Rehabilita botón
        }
    };

    if (loading) {
        return <div>Cargando panel del comercio...</div>;
    }

    return (
        <div>
            <h1>Panel del Comercio</h1>
            <h2>Número Llamado Actual: {numeroLlamado > 0 ? numeroLlamado : 'Ninguno'}</h2>
            <p>Clientes en espera: {clientesEnEspera}</p>
            <button onClick={handleLlamarSiguiente} disabled={calling}>
                {calling ? 'Llamando...' : 'Llamar Siguiente Cliente'}
            </button>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>}
        </div>
    );
}

export default ComercioPage;
