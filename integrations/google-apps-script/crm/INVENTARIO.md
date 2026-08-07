# Estrategia para el inventario CSV

## Auditoria actual

- 1.042 productos y 1.042 codigos unicos.
- 84 categorias internas.
- 1.023 productos con existencia positiva.
- 1.035 productos con costo registrado.
- Dos nombres duplicados, sin codigos duplicados.

El tamano no es el problema. El riesgo es publicar costos, cantidades, descripciones contables y categorias internas sin valor comercial.

## Modelo de tres capas

### 1. Inventario_Raw

Importacion exacta del sistema contable. Es privada, no se edita manualmente y conserva `cantot`, `costot`, codigos fiscales y observaciones.

### 2. Inventario_Maestro

Vista limpia para el equipo. Normaliza nombres, corrige categorias y anade:

- `FAMILIA_PUBLICA`
- `MARCA`
- `COMPATIBILIDAD`
- `PRECIO_PUBLICO`
- `IMAGEN`
- `DESCRIPCION_COMERCIAL`
- `PUBLICAR`
- `DESTACADO`

### 3. Catalogo_Publico

Solo contiene productos con `PUBLICAR=TRUE`. Nunca incluye costo, existencia exacta, impuestos ni observaciones internas. El sitio consulta esta vista y conserva un catalogo local de respaldo.

## Regla de publicacion

No se cargan 1.042 fichas a la web. Se empieza con los productos que realmente generan busquedas y cotizaciones: tapas, lonas, suspensiones, barras de tiro, estribos, bullbars, recubrimiento, iluminacion y carga. El resto queda disponible para busqueda interna del asesor.

Las 84 categorias internas deben mapearse a aproximadamente 12 familias publicas. El archivo `CatalogApi.gs` existente puede publicar la vista curada una vez que tenga los campos comerciales requeridos.
