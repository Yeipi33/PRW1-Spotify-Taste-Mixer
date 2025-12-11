// src/app/api/spotify-token/route.js

import { NextResponse } from 'next/server';

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com//src/app/api/spotify-token/route";

export async function POST(request) {
  try {
    const { code } = await request.json(); // Obtenemos el código enviado desde el frontend

    // Credenciales del servidor
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID; // Sin NEXT_PUBLIC_
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;

    // Codificación base64 para la cabecera de autenticación
    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    // Cuerpo de la petición POST
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
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
      console.error('Error al obtener tokens de Spotify:', errorData);
      return NextResponse.json({ error: 'Fallo en intercambio de código' }, { status: response.status });
    }

    const data = await response.json();
    
    // Devuelve los tokens (access_token, refresh_token, expires_in) al frontend
    return NextResponse.json(data); 

  } catch (error) {
    console.error('Error del servidor:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}