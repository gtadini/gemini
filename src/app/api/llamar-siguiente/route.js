// app/api/llamar-siguiente/route.js
import { ref, get, update } from 'firebase/database';
import { db } from '../../firebase'; 

export async function POST(req) {
    try {
        const body = await req.json();
        const { comercioId } = body;

        if (!comercioId) {
            return new Response(JSON.stringify({ error: 'Falta el ID del comercio.' }), { status: 400 });
        }

        const colaRef = ref(db, `comercios/${comercioId}/cola`);
        const snapshot = await get(colaRef);

        if (!snapshot.exists()) {
            return new Response(JSON.stringify({ message: 'No hay clientes en la cola.' }), { status: 404 });
        }

        const colaData = snapshot.val();
        let siguienteClienteKey = null;
        let minTimestamp = Infinity;

        for (const key in colaData) {
            if (colaData[key].status === 'esperando') {
                if (colaData[key].timestamp < minTimestamp) {
                    minTimestamp = colaData[key].timestamp;
                    siguienteClienteKey = key;
                }
            }
        }

        if (!siguienteClienteKey) {
            return new Response(JSON.stringify({ message: 'No hay clientes esperando.' }), { status: 404 });
        }

        const numeroLlamado = parseInt(siguienteClienteKey);
        console.log(`API: Llamando número ${numeroLlamado} para comercio ${comercioId}`);

        const updates = {};
        updates[`comercios/${comercioId}/cola/${numeroLlamado}/status`] = 'llamado';
        updates[`comercios/${comercioId}/numeroLlamadoActual`] = numeroLlamado;

        await update(ref(db), updates);

        return new Response(JSON.stringify({ numeroLlamado }), { status: 200 });

    } catch (error) {
        console.error("Error en /api/llamar-siguiente:", error);
        return new Response(JSON.stringify({ error: 'Error interno al llamar al siguiente cliente.', details: error.message }), { status: 500 });
    }
}

