# Arquitectura gratuita recomendada

## Decision

Google Sheets con Apps Script puede utilizarse como CMS editorial del catalogo publico, pero no como base de datos transaccional del portal.

## Uso permitido de Sheets

- Nombre, descripcion, categoria y estado visible de productos.
- Precios referenciales que no constituyan una promesa contractual.
- Orden de aparicion, etiquetas e imagenes alojadas en R2.
- Importacion periodica hacia el catalogo estatico.

El sitio publico no debe consultar Sheets en cada visita. Un proceso de publicacion valida los datos y regenera los HTML; asi el catalogo sigue funcionando aunque Apps Script falle o alcance una cuota.

## Datos que deben permanecer en Supabase

- Credenciales, sesiones, roles y permisos.
- Clientes y vehiculos.
- Facturas, puntos y canjes.
- Garantias, kilometraje y mantenimientos.
- Suscripciones, pagos y auditoria.

Estos flujos requieren integridad referencial, transacciones, control de acceso por fila y trazabilidad. Una hoja editable no ofrece esas garantias.

## Flujo propuesto

1. Ventas actualiza el catalogo editorial en Google Sheets.
2. Un Apps Script autenticado exporta un JSON validado.
3. El generador consume ese JSON y crea las fichas tecnicas reutilizables en `fichas/*.html`.
4. El despliegue publica archivos estaticos en Cloudflare.
5. El portal privado consume Supabase mediante funciones de servidor; las llaves administrativas nunca llegan al navegador.

## Limites operativos

Apps Script tiene limite de tiempo por ejecucion y concurrencia. Sheets aplica cuotas de lectura y escritura por minuto. Por ello no debe estar en el camino critico de cada visita ni de una operacion de puntos.
