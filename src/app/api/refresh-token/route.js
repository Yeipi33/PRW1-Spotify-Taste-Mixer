// src/app/api/refresh-token/route.js

import { NextResponse } from 'next/server';

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/src/app/api/refresh-token/route"; 

export async function POST(request) {
  try {
    const { refresh_token } = await request.json(); // Obtenemos el token de refresco del cliente

    // Credenciales del servidor
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    // Codificación base64 para la cabecera de autenticación
    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    // Cuerpo de la petición POST
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    });

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString(),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al refrescar tokens de Spotify:', errorData);
      // Si el refresh token falla (por ejemplo, ha sido revocado), devolvemos un error 401
      return NextResponse.json({ error: 'Fallo al refrescar token' }, { status: 401 });
    }

    const data = await response.json();
    
    // Spotify puede o no devolver un nuevo refresh_token. 
    // Siempre devuelve un nuevo access_token y expires_in.
    return NextResponse.json(data); 

  } catch (error) {
    console.error('Error del servidor al refrescar token:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}