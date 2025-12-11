1. Título y descripción
Título: 🎵 Spotify Taste Mixer - Proyecto Final

Descripción: Una aplicación web construida con Next.js que permite a los usuarios autenticarse con Spotify y generar listas de reproducción personalizadas configurando preferencias a través de widgets (género, popularidad, artistas, etc.).

2. 📋 Tabla de Contenidos
Incluye un índice para facilitar la navegación:

Objetivos del Proyecto

Tecnologías utilizadas

Requisitos previos

Configuración y Ejecución

Funcionalidades

3. 🎯 Objetivos del Proyecto
Detalle lo que aprendiste e implementaste:

Cree una aplicación profesional con Next.js (App Router).

Implementar autenticación segura OAuth 2.0 con flujo de actualización de tokens.

Trabajar con la API Web de Spotify (y gestionar la limitación del endpoint de /recommendations).

Desarrollar componentes React reutilizables ( Widgets ).

Gestionar estado y persistencia conlocalStorage (para favoritos).

Diseñar una interfaz responsiva y atractiva.

4. ⚙️ Requisitos Previos y Configuración
Explique cómo instalar y configurar la aplicación:

Clonar el repositorio.

Instalar dependencias ( npm installo yarn).

Configurar Spotify:

Crear una aplicación enSpotify para desarrolladores.

Establecer el URI de redireccionamiento a http://127.0.0.1:3000/auth/callback.

Variables de Entorno:

Crear el archivo .env.local.

Añadir el CLIENT_ID, el CLIENT_SECRETy el REDIRECT_URI.

Nota de Seguridad: ElClient Secretnunca se exponen en el código del frontend .

5. ✅ Funcionalidades Implementadas
Usa la lista de la práctica para mostrar lo que funciona:

Obligatorias: Flujo OAuth 2.0, actualización automática de tokens, generación de listas de reproducción con 3-4 widgets , marcar favoritos (con localStorage), diseño responsive .

Opcionales (si las implementaste): Guardar lista de reproducción en Spotify, historial de listas de reproducción , vista previa de canciones (30s).

6. 💻 Tecnologías Utilizadas
Lista las herramientas clave:

Next.js (Enrutador de aplicaciones)

Reaccionar

JavaScript

API web de Spotify

Tailwind CSS (la librería de estilos que utiliza)

7. 👤 Contacto y Licencia
Información sobre el autor.

Licencia (ej. MIT).