// generaQR.js
const QRCode = require('qrcode');

const comercioId = 'COMERCIO-ID-UNICO'; // *IMPORTANTE*: Reemplaza esto con un ID único para tu comercio.  Puedes usar un UUID (ej: 'comercio-abc-123')
const urlBase = 'https://tu-app-nextjs.vercel.app'; // *IMPORTANTE*: Reemplaza esto con la URL donde desplegarás tu aplicación Next.js.  ¡Asegúrate de que sea la URL correcta!

const urlParaQR = `${urlBase}/cliente?comercioId=${comercioId}`; // CORREGIDO:  Usar ${} correctamente para *ambas* variables.

QRCode.toDataURL(urlParaQR, { errorCorrectionLevel: 'H' }, function (err, url) {
    if (err) {
        console.error("Error al generar el QR:", err);
        return;
    }
    console.log("Código QR generado (data URL):", url); // Imprime la data URL.  Puedes usar esto directamente en una etiqueta <img> en HTML.

    // Opcional: Guardar el QR como imagen
    QRCode.toFile('./codigo-qr.png', urlParaQR, {
        color: {
            dark: '#000',  // Negro
            light: '#FFF' // Blanco
        }
    }, function (err) {
        if (err) throw err
        console.log('QR guardado como codigo-qr.png')
    });
});
