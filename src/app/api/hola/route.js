// app/api/hola/route.js

export async function GET(request) {
    return Response.json({ mensaje: '¡Hola mundo!' });
  }
  