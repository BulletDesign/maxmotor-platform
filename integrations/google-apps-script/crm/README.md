# Maxmotor CRM en Google Sheets

CRM interno, separado de D1 y de las cuentas MiMaxmotor. Google Sheets almacena y presenta los datos; una web app de Apps Script permite registrar contactos rapidamente desde el telefono.

## Flujo operativo

1. El asesor escribe primero el telefono.
2. Si el cliente ya existe, nombre y provincia se completan automaticamente.
3. Selecciona marca, familia, canal y estado; escribe modelo y producto.
4. La proforma solo aparece para `Cotizado` o `Vendido`.
5. El motivo de perdida solo aparece para `Perdido`.
6. `Guardar y nuevo` limpia el formulario. `Guardar y abrir WhatsApp` abre el chat del cliente.
7. Fecha, asesor, IDs y proximo seguimiento se generan automaticamente.

## Hojas creadas

- `Clientes`: una fila por telefono; evita duplicar datos personales.
- `Oportunidades`: una fila por interes, producto o proforma.
- `Actividades`: bitacora inmutable de creacion y cambios de estado.
- `Catalogos`: provincias, marcas, canales, estados y familias editables.
- `Equipo`: lista blanca de correos autorizados.
- `Configuracion`: avisos y hora del resumen.
- `Dashboard`: oportunidades, ventas, conversion, seguimientos y canales.

## Instalacion

1. Crear un Google Sheet vacio con una cuenta administradora.
2. Abrir `Extensiones > Apps Script`.
3. Crear los archivos `Config.gs`, `Setup.gs`, `Code.gs`, `Notifications.gs` e `Index.html` y pegar su contenido.
4. En Configuracion del proyecto activar la visualizacion de `appsscript.json` y reemplazarlo por el manifiesto incluido.
5. Ejecutar `setupCrm` desde el editor y aceptar los permisos.
6. En la hoja `Equipo`, agregar los seis correos de vendedores y mantener `ACTIVO=TRUE`.
7. Compartir el Sheet como editor unicamente con esos correos.
8. Ejecutar `installCrmTriggers` desde la cuenta propietaria.

## Publicacion movil segura

1. En Apps Script seleccionar `Implementar > Nueva implementacion > Aplicacion web`.
2. Elegir `Ejecutar como: Usuario que accede a la aplicacion web`.
3. Permitir acceso a usuarios con cuenta de Google o, si existe Workspace, solo al dominio.
4. Cada vendedor abre la URL `/exec`, autoriza una sola vez y la agrega a la pantalla de inicio del telefono.
5. Pegar la URL publicada en `Configuracion > URL_WEB_APP`.

No publicar la aplicacion como el propietario con acceso anonimo. El control de acceso depende del correo activo y de la lista `Equipo`.

## Notificaciones internas

El disparador diario agrupa seguimientos vencidos por asesor y envia un solo correo a cada uno. Esto evita consumir innecesariamente la cuota gratuita. Para avisar al dueno en cada oportunidad, completar `EMAIL_DUENO` y cambiar `NOTIFICAR_NUEVA_OPORTUNIDAD` a `TRUE`.

Los botones asignados a dibujos dentro de Sheets no se ejecutan desde movil. Por eso la captura se resuelve con una web app responsive y el Sheet se usa para filtros y dashboard.
