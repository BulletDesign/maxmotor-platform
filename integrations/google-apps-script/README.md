# Catalogo Google Sheets

## Columnas requeridas

`id, sku, nombre, categoria, descripcion, marca, compatibilidad, precio, imagen, url, activo`

La primera fila contiene exactamente esos encabezados. `activo` debe ser `TRUE` o `FALSE`.

## Publicacion

1. Importar el CSV en una hoja llamada `productos`.
2. Abrir Extensiones > Apps Script.
3. Pegar `CatalogApi.gs`.
4. Implementar como aplicacion web, ejecutando como propietario y con acceso para cualquier visitante.
5. Copiar la URL terminada en `/exec` dentro de `catalog/catalog-settings.js`.

La web conserva un catalogo local de emergencia y una cache de 15 minutos. La hoja no debe contener costos internos, datos personales, contrasenas ni informacion de clientes.
