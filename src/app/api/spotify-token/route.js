// src/app/api/spotify-token/route.js

import { NextResponse } from 'next/server';

// Variables de entorno privadas (accesibles en el servidor)
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI; // La versión pública también sirve aquí

export async function POST(request) {
    // 1. Obtener el código de autorización del cuerpo de la solicitud (enviado desde el callback page)
    const { code } = await request.json();

    if (!code) {
        return NextResponse.json({ error: 'Falta el código de autorización' }, { status: 400 });
    }

    // 2. Preparar los parámetros para la solicitud POST a Spotify
    const authOptions = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        }).toString()
    };

    try {
        // 3. Solicitar el token de acceso a Spotify
        const response = await fetch('http://googleusercontent.com/api.spotify.com/api/token', authOptions);
        
        const data = await response.json();

        if (!response.ok) {
            console.error('Error de Spotify al obtener token:', data);
            return NextResponse.json({ error: 'Fallo al obtener token de Spotify', details: data }, { status: response.status });
        }

        // 4. Devolver los tokens al cliente (callback page)
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error de red o servidor:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}