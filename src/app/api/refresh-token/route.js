// src/app/api/refresh-token/route.js

import { NextResponse } from 'next/server';

// Obtener las credenciales de entorno privadas (solo accesibles en el servidor)
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export async function POST(request) {
    // 1. Obtener el refresh_token del cuerpo de la solicitud
    const { refreshToken } = await request.json();

    if (!refreshToken) {
        return NextResponse.json({ error: 'Falta el refresh token' }, { status: 400 });
    }

    // 2. Preparar los parámetros para la solicitud POST a Spotify
    const authOptions = {
        method: 'POST',
        headers: {
            // Codificación base64 de CLIENT_ID:CLIENT_SECRET
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }).toString()
    };

    try {
        // 3. Solicitar el nuevo token de acceso a Spotify
        const response = await fetch('http://googleusercontent.com/api.spotify.com/api/token', authOptions);
        
        const data = await response.json();

        if (!response.ok) {
            console.error('Error de Spotify al refrescar token:', data);
            return NextResponse.json({ error: 'Fallo al refrescar token de Spotify' }, { status: response.status });
        }

        // 4. Devolver la respuesta de Spotify (que contiene el nuevo access_token y expires_in)
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error de red o servidor:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}