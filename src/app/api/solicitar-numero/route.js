// src/app/api/solicitar-numero/route.js

import { ref, runTransaction, serverTimestamp, set } from 'firebase/database';
import { db } from '../../firebase'; // Ajustá esta ruta si es distinta en tu estructura

export async function POST(req) {
    const body = await req.json();
    const { comercioId } = body;

    if (!comercioId) {
        return new Response(JSON.stringify({ error: 'Falta el ID del comercio.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!db) {
        console.error("Error: Firebase DB no inicializada.");
        return new Response(JSON.stringify({ error: 'Firebase no inicializado' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    //const ultimoNumeroRef = ref(db, `comercios/${comercioId}/ultimoNumeroAsignado`);
    const ultimoNumeroRef = ref(db, `comercios/${comercioId}/ultimoNumeroAsignado`);

    try {
        let numeroAsignado;
        const transactionResult = await runTransaction(ultimoNumeroRef, (currentValue) => {
            numeroAsignado = (currentValue || 0) + 1;
            return numeroAsignado;
        });

        if (!transactionResult.committed || numeroAsignado === undefined) {
            throw new Error("No se pudo completar la transacción");
        }

        const clienteRef = ref(db, `comercios/${comercioId}/cola/${numeroAsignado}`);
        await set(clienteRef, {
            timestamp: serverTimestamp(),
            status: 'esperando'
        });

        return new Response(JSON.stringify({ numero: numeroAsignado }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Error Firebase:", error);
        return new Response(JSON.stringify({
            error: 'Error interno',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
