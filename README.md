# Un regalo para Hiru

Web móvil en formato de archivo fotográfico para reunir fotos y mensajes de felicitación. Funciona sin instalación y puede publicarse en GitHub Pages, Netlify o Vercel.

## Probarla en local

Puedes abrir `index.html` directamente. Para probar también el modo instalable, sirve la carpeta con cualquier servidor estático, por ejemplo con la extensión Live Server de VS Code.

Sin configurar una base de datos, las felicitaciones se guardan en el navegador del dispositivo. Esto sirve para probar el diseño, pero no comparte los mensajes entre dispositivos.

## Abrir la página de subida

La galería pública no muestra ningún control para añadir fotografías. El formulario está en una ruta separada:

```text
index.html#ulpoad
```

También se admite `index.html#upload` como alias. En una web publicada en `https://ejemplo.com`, el enlace sería `https://ejemplo.com/#ulpoad`.

El enlace separado oculta el formulario a los visitantes normales, pero no es autenticación real. Para impedir técnicamente que otra persona publique si descubre la dirección, habrá que añadir inicio de sesión y cambiar las políticas públicas de Supabase.

## Activar las felicitaciones compartidas

1. Crea un proyecto gratuito en [Supabase](https://supabase.com).
2. Abre **SQL Editor**, pega el contenido de `supabase.sql` y ejecútalo.
3. En **Project settings → API**, copia la URL del proyecto y la clave pública `anon`.
4. Pega ambos valores en `config.js`:

```js
window.HIRU_CONFIG = {
  celebrantName: "Hiru",
  showStockPhotos: true,
  supabaseUrl: "https://TU-PROYECTO.supabase.co",
  supabaseAnonKey: "TU-CLAVE-PUBLICA",
};
```

La clave `anon` está diseñada para usarse en el navegador. Las políticas incluidas solo permiten leer y crear felicitaciones; no permiten borrarlas ni modificarlas.

## Personalizar

- Cambia el nombre en `config.js`.
- Cambia `showStockPhotos` a `false` para retirar todas las fotografías temporales.
- Las fotos y mensajes de muestra están al principio de `app.js`.
- Los textos principales están en `index.html`.
- Los colores están al principio de `styles.css`.

Antes de compartir públicamente el enlace, conviene añadir moderación o limitar el acceso a personas invitadas si las fotos son privadas.
