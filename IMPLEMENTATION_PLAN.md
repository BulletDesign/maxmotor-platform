# Maxmotor Platform - Plan de implementacion por interfaces

## 1. Alcance y decisiones vigentes

- Plataforma: Cloudflare Pages + Pages Functions + D1.
- Roles: `customer`, `employee`, `superadmin`.
- Regla inicial de puntos: 1 punto por cada USD 10 del total de factura.
- Los puntos se calculan exclusivamente en el servidor y no expiran en el MVP.
- Todo movimiento de puntos, instalacion, revision o cambio administrativo deja auditoria.
- Una instalacion exige cliente, vehiculo, producto, factura unica y empleado responsable.
- El cliente registra su primer vehiculo; los siguientes los agrega un empleado.
- Suscripciones, pagos, WhatsApp automatico y facturacion electronica quedan fuera del MVP.

## 2. Sistema visual y estructura comun

Antes de crear portales se construira una capa reutilizable:

- `AppShell`: header, navegacion lateral, contenido y acciones moviles.
- Componentes: botones, campos, selectores, tablas, tarjetas, modales, alertas y estados vacios.
- Patrones: buscador global, formulario por pasos, confirmacion critica y linea de tiempo.
- Tokens visuales compartidos con el index: negro, rojo Maxmotor, tipografia condensada y textura tecnica.
- Accesibilidad: teclado, foco visible, contraste, mensajes de error y objetivos tactiles.
- Estados obligatorios: cargando, vacio, error, sin permisos, exito y sin conexion.

## 3. Interfaz publica y acceso

### 3.1 Entrada al portal

Pantallas:

- Selector `Ingresar` / `Crear cuenta`.
- Registro del cliente y primer vehiculo en pasos.
- Inicio de sesion.
- Recuperacion de acceso asistida por Maxmotor.
- Terminos, privacidad y consentimiento.

Flujo de registro:

1. Cliente ingresa identidad, contacto y contrasena.
2. Registra marca, modelo, ano, placa y VIN del primer vehiculo.
3. Acepta terminos y tratamiento de datos.
4. Backend valida duplicados y crea codigo de cliente.
5. Se inicia sesion y se abre el onboarding del portal.

Criterios de aceptacion:

- Email, codigo de cliente y factura no pueden duplicarse.
- La contrasena nunca se genera desde cedula, placa o nombres.
- La sesion usa cookie segura `HttpOnly`.
- El cliente nunca puede asignarse un rol privilegiado.

## 4. Portal del cliente

### 4.1 Dashboard

- Resumen del vehiculo principal.
- Proxima revision y estado de garantia mas urgente.
- Saldo de puntos y ultimo movimiento.
- Accesos directos a vehiculos, instalaciones, puntos y recompensas.

### 4.2 Mis vehiculos

- Lista de vehiculos asociados.
- Ficha del vehiculo con kilometraje actual y ultima visita.
- Accesorios instalados y estado de sus garantias.
- El cliente solo consulta; altas y cambios posteriores los realiza un empleado.

### 4.3 Instalaciones y garantias

- Linea de tiempo por accesorio.
- Fecha de instalacion, kilometraje, revisiones requeridas y tolerancia.
- Estados: activa, revision proxima, vencida, perdida, completada o anulada.
- Detalle de condiciones aceptadas y contacto para agendar revision.

### 4.4 Puntos y recompensas

- Saldo disponible, reservado y movimientos.
- Catalogo de recompensas activas.
- Solicitud de canje sin combinacion de dinero y puntos.
- Seguimiento: solicitado, aprobado, rechazado, entregado o cancelado.

### 4.5 Perfil y privacidad

- Actualizacion limitada de contacto.
- Cambio de contrasena.
- Solicitud de acceso/correccion de datos.
- Solicitud de cierre de cuenta con advertencia de perdida irreversible.

## 5. Portal del empleado

Disenado primero para telefono y operacion en mostrador/taller.

### 5.1 Busqueda operativa

- Buscar por codigo, cedula, telefono, placa, VIN o email.
- Resultado compacto con cliente, vehiculos, puntos y alertas.
- Acciones rapidas segun permisos.

### 5.2 Cliente y vehiculos

- Validar cuenta pendiente.
- Corregir datos auditables.
- Agregar o editar vehiculos.
- Actualizar kilometraje y registrar ultima visita.

### 5.3 Factura y acreditacion de puntos

1. Buscar cliente.
2. Ingresar numero unico, fecha y total de factura.
3. Backend bloquea duplicados y calcula `floor(total_cents / 1000)`.
4. Empleado revisa el resumen y confirma.
5. Se crean factura, movimiento y auditoria en una sola transaccion.

### 5.4 Instalacion

1. Seleccionar cliente y vehiculo.
2. Seleccionar producto y variante.
3. Asociar factura registrada.
4. Ingresar fecha, kilometraje, serie y observaciones.
5. El servidor copia la version vigente de la politica de garantia.
6. Se muestra comprobante operativo y proximas revisiones.

### 5.5 Revision de garantia

- Ver agenda de revisiones proximas/vencidas.
- Registrar kilometraje, fecha, resultado y observaciones.
- Calcular cumplimiento de tolerancia en servidor.
- Escalar casos de perdida o reclamo para decision de gerencia/superadmin.

### 5.6 Canjes y ajustes

- Aprobar o rechazar solicitudes de canje.
- Confirmar entrega para descontar puntos reservados.
- Ajuste manual con motivo obligatorio y trazabilidad.

## 6. Portal del superadministrador

### 6.1 Control general

- Metricas: clientes, puntos emitidos/canjeados, garantias proximas y operaciones recientes.
- Alertas de facturas duplicadas, intentos fallidos y acciones sensibles.

### 6.2 Usuarios y roles

- Crear, activar, suspender y bloquear empleados.
- Asignar roles sin permitir que un usuario se eleve a si mismo.
- Cerrar sesiones activas y habilitar recuperacion de acceso.

### 6.3 Catalogo operativo

- Familias, productos, variantes y estado activo.
- Regla de puntos por producto cuando se habilite esa excepcion.
- Versiones de politica de garantia sin modificar instalaciones historicas.
- Recompensas, costo en puntos, stock informativo y vigencia.

### 6.4 Auditoria y privacidad

- Filtros por actor, cliente, entidad, accion y fecha.
- Revision de ajustes, anulaciones y decisiones de garantia.
- Bandeja de solicitudes de acceso, correccion y eliminacion.
- Exportacion controlada, nunca descarga masiva abierta.

## 7. Add-ins e integraciones

Los add-ins se implementaran como adaptadores independientes para no acoplar el nucleo:

### MVP

- D1: fuente oficial de usuarios, vehiculos, garantias, facturas de referencia y puntos.
- Catalogo web: fichas estaticas indexables sincronizadas desde datos estructurados del repositorio.
- WhatsApp manual: enlaces prellenados para cotizacion, revision y soporte; no automatizacion.
- Correo transaccional: adaptador futuro para seguridad y recuperacion, desactivado hasta definir proveedor.

### Post-MVP

- Google Sheets: importacion unidireccional de catalogo/inventario, nunca autenticacion ni puntos.
- Sistema contable: consulta o importacion de facturas mediante adaptador, sin reemplazar D1.
- R2: certificados, evidencias y fotos privadas mediante URLs firmadas.
- Turnstile: proteccion de registro, login y formularios publicos cuando exista abuso real.
- WhatsApp Business API: recordatorios de garantia con consentimiento y plantillas aprobadas.
- Pagos/suscripciones: proveedor desacoplado; webhooks idempotentes y sin almacenar tarjetas.
- Analitica: eventos sin datos sensibles para medir activacion, canjes y abandono.

Cada integracion debe incluir interfaz, reintentos, idempotencia, auditoria, limites y modo degradado.

## 8. Backend y migraciones por etapa

### Etapa A - Identidad

- Completar perfiles, consentimientos, control de intentos y recuperacion.
- Endpoints de registro, login, logout, sesion y perfil.

### Etapa B - Vehiculos y catalogo

- Ampliar vehiculos y crear categorias, productos y variantes.
- Endpoints de consulta cliente y administracion empleado.

### Etapa C - Instalaciones y garantias

- Versiones de politicas, instalaciones, reglas y revisiones.
- Calculo de proximas revisiones por fecha y kilometraje.

### Etapa D - Fidelizacion

- Cuenta de puntos, ledger inmutable, recompensas, reservas y canjes.
- Factura unica y operaciones atomicas.

### Etapa E - Administracion

- Roles, auditoria, solicitudes de privacidad y configuracion.

Cada migracion se aplica primero en local, luego `maxmotor-dev` y finalmente `maxmotor-prod`.

## 9. Orden de construccion

1. Sistema visual y rutas protegidas.
2. Registro, login, sesion y primer superadmin.
3. Dashboard cliente y perfil.
4. Vehiculos, instalaciones y garantias del cliente.
5. Busqueda y operaciones del empleado.
6. Facturas y acreditacion de puntos.
7. Recompensas y canjes.
8. Administracion de usuarios, catalogo y garantias.
9. Privacidad, auditoria y cierre de cuenta.
10. QA integral, migracion del dominio y monitoreo.

## 10. Definition of Done por modulo

Un modulo solo se considera terminado cuando:

- Tiene permisos de servidor y no solo ocultamiento visual.
- Incluye validaciones, errores, estados vacios y experiencia movil.
- Registra auditoria cuando modifica datos operativos.
- Tiene pruebas unitarias y al menos un flujo de integracion.
- Pasa `npm run verify` y despliega correctamente en preview.
- No expone PII, secretos ni datos de otros clientes.
- Cuenta con criterio de rollback o migracion reversible cuando aplique.

## 11. Primer ciclo de trabajo

El primer ciclo entregara una vertical completa y verificable:

1. Migracion de identidad ampliada y consentimientos.
2. Layout reutilizable para los tres roles.
3. Registro con primer vehiculo.
4. Login y redireccion por rol.
5. Dashboard inicial de cliente.
6. Creacion controlada del primer superadmin.
7. Pruebas en `maxmotor-platform.pages.dev` antes de tocar el dominio principal.
