# Plan de deploy manual en Cloudflare

## Estado implementado

- Hero y linea grafica MXR aplicados al inicio.
- Explorador de familias generado desde `catalog/families.js`.
- Previews, animaciones, configurador existente y fichas de producto conectados.
- Header y footer reutilizables desde `assets/site-shell.js`.
- Cabeceras basicas de seguridad y cache en `_headers`.
- Paquete de publicacion reproducible mediante `node scripts/build-static.mjs`.

## Ventana de trabajo recomendada

### Hora 0-2: contenido

- Ventas valida nombres, claims, capacidades y precios.
- Bodega entrega fotografias finales de los productos prioritarios.
- Sustituir las imagenes referenciales repetidas. No publicar especificaciones no confirmadas.

### Hora 2-4: proteccion de activos

- Mantener originales fuera del bucket publico.
- Publicar derivados de maximo 1600 px y calidad web, nunca archivos de produccion.
- Agregar una marca de agua MXR semitransparente sobre el producto, no solo en una esquina recortable.
- Servir las imagenes desde un subdominio propio, por ejemplo `media.maxmotor4x4.com`.
- Activar Hotlink Protection o una regla WAF que permita los referers de Maxmotor y redes sociales necesarias.

La proteccion no impide que un visitante guarde lo que ve. Su objetivo es que solo pueda obtener una copia web reducida y marcada, no el original comercial.

## Hora 4-6: QA

- Probar inicio, buscador, las diez familias y todas las fichas.
- Probar cotizacion en WhatsApp desde telefono real.
- Probar formulario de cupon y confirmar que el endpoint sigue activo.
- Revisar textos y fotografias en 390 px, 768 px y 1440 px.
- Ejecutar `node scripts/build-static.mjs` y revisar exclusivamente la carpeta `dist`.

## Hora 6-7: preview

1. Abrir Cloudflare Dashboard.
2. Entrar a Workers & Pages.
3. Crear un proyecto Direct Upload o un deployment Preview.
4. Arrastrar la carpeta `dist`.
5. Validar la URL `pages.dev` sin conectar aun el dominio.

## Hora 7-8: produccion

- Descargar un respaldo de la version publica actual.
- Publicar `dist` como deployment de produccion.
- Validar dominio, HTTPS, formulario, WhatsApp, favicon, sitemap y Analytics.
- Purgar cache solo si se mantienen rutas antiguas con contenido obsoleto.
- Conservar la URL del deployment anterior para rollback.

## Bloqueadores antes de produccion

- Varias imagenes antiguas del R2 devuelven 404 y fueron reemplazadas temporalmente por fotografias referenciales.
- Las fichas genericas necesitan fotografias y especificaciones finales de ventas/bodega.
- El popup automatico de cupon interrumpe la primera impresion y deberia activarse por intencion de salida o despues de interaccion.
- El `index.html` conserva el configurador historico monolitico. El shell, catalogo y fichas ya estan separados, pero la logica del configurador debe migrarse por familias despues del deploy urgente.
