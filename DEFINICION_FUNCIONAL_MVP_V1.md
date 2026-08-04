# Maxmotor Portal - Definición funcional MVP v1

Fecha: 25 de julio de 2026  
Estado: Borrador operativo basado en `Requerimientos.txt` y `RESPUESTAS_PENDIENTES_MAXMOTOR.txt`

## 1. Objetivo

Construir una aplicación web rápida que integre:

- Sitio público y catálogo Maxmotor/MXR.
- Registro e inicio de sesión de clientes.
- Portal privado "Mi Garaje".
- Gestión de vehículos, accesorios instalados y garantías.
- Programa de fidelización basado en puntos.
- Panel móvil y de escritorio para empleados.
- Panel de control para superadministradores.

El MVP no incluirá todavía pagos de suscripción, SMS, WhatsApp automático,
facturación electrónica, fotografías del vehículo ni integración con el sistema
contable.

## 2. Volumen inicial

- Clientes existentes a importar: 0.
- Clientes nuevos estimados: 200 por mes.
- Clientes fidelizados estimados: 90 por mes.
- Empleados: 6.
- Superadministradores: 2.
- Sucursales operativas en el sistema: 1.
- Tipo de cliente: únicamente personas naturales mayores de 18 años.

Este volumen es compatible inicialmente con una arquitectura de capa gratuita.

## 3. Proveedores técnicos seleccionados

Estado: CONFIRMADO por delegación de selección técnica.

- Frontend y aplicación: Next.js con TypeScript.
- Hosting: Cloudflare Workers Free.
- Base de datos: PostgreSQL mediante Supabase Free.
- Autenticación y sesiones: Supabase Auth.
- Imágenes públicas: Cloudflare R2 existente.
- Analítica publicitaria: no incluida en el MVP.
- Notificaciones externas: no incluidas en el MVP.

Las imágenes no se almacenarán en PostgreSQL. La base de datos conservará
únicamente sus URL y metadatos.

## 4. Roles

### 4.1 Cliente

Puede:

- Registrarse por sí mismo.
- Registrar únicamente su primer vehículo durante el alta.
- Iniciar sesión usando su teléfono como identificador.
- Consultar sus vehículos activos.
- Ver los accesorios instalados.
- Ver estado de garantías y próximas revisiones.
- Ver saldo y movimientos de puntos mientras la cuenta esté activa.
- Ver recompensas disponibles.
- Solicitar un canje.
- Solicitar eliminación de la cuenta.

No puede:

- Agregar un segundo vehículo.
- Modificar marca, modelo, año, placa o VIN después del registro.
- Registrar instalaciones.
- Modificar kilometraje.
- Acreditar o ajustar puntos.
- Aprobar canjes.

### 4.2 Empleado

Puede:

- Consultar todos los clientes.
- Buscar por código de cliente, teléfono, cédula o placa.
- Validar los datos creados durante el registro.
- Agregar o editar vehículos.
- Actualizar el último kilometraje.
- Registrar instalaciones asociadas obligatoriamente a una factura.
- Registrar revisiones de garantía.
- Registrar facturas para acreditar puntos.
- Aprobar canjes.
- Realizar ajustes manuales de puntos.
- Modificar el catálogo de recompensas.

Toda operación sobre puntos, instalaciones o garantías debe registrar el empleado,
fecha, motivo y valores anteriores/nuevos.

### 4.3 Superadministrador

Posee todos los permisos de empleado y además puede:

- Crear, bloquear y gestionar empleados.
- Cambiar roles.
- Restablecer acceso después de verificar presencialmente al cliente.
- Configurar reglas de puntos.
- Configurar reglas de garantía por producto.
- Gestionar el catálogo maestro de productos.
- Consultar auditoría.
- Atender solicitudes de acceso, corrección y eliminación.
- Ejecutar cierres de cuenta.

Responsables de privacidad informados:

- Principal: Juan José Lara Sánchez.
- Reemplazo: Paul Enrique Lara Escobar.

Plazo interno de respuesta: PENDIENTE.

## 5. Registro y autenticación

### 5.1 Datos de registro

Datos solicitados:

- Nombres.
- Apellidos.
- Cédula.
- Fecha de nacimiento.
- Teléfono.
- Email opcional.
- Aceptación de política de privacidad.
- Aceptación de términos del portal.
- Contraseña.

Datos del primer vehículo:

- Marca.
- Modelo.
- Año.
- Placa.
- VIN.
- Color.
- Kilometraje actual.

No se solicitarán fotografías.

### 5.2 Validaciones

- El usuario debe declarar y demostrar una edad mínima de 18 años.
- El teléfono debe ser único.
- La cédula debe ser única.
- La placa debe ser única entre vehículos activos.
- El VIN debe ser único entre vehículos activos.
- La contraseña nunca podrá derivarse de la cédula, fecha de nacimiento, placa,
  teléfono, nombres o apellidos.

### 5.3 Método de acceso

Confirmado:

- El teléfono será el identificador de acceso.

Pendiente:

- Confirmar que la contraseña será creada por el cliente.
- Confirmar longitud mínima y reglas de seguridad.
- Confirmar el procedimiento presencial de restablecimiento.

No se implementará OTP por SMS en el MVP.

## 6. Vehículos

- Un cliente puede tener varios vehículos.
- Cada vehículo pertenece a un solo cliente.
- El cliente crea únicamente el primer vehículo.
- Los vehículos posteriores son creados por empleados.
- Empleados y superadministradores pueden editar vehículos.
- No se almacenará una serie completa del historial de kilometraje.
- Se conservará el kilometraje de instalación de cada accesorio.
- Se conservará el último kilometraje registrado en una visita.
- Cada actualización debe guardar fecha y empleado responsable para auditoría,
  aunque no se muestre como historial al cliente.

## 7. Productos e instalaciones

### 7.1 Catálogo

El catálogo maestro se migrará desde `data.js`, `index.html` y `mxr.html`.

Cada producto debe contener:

- Código interno/SKU.
- Nombre.
- Categoría.
- Marca.
- Estado activo/inactivo.
- URL de imagen.
- Compatible con vehículo o universal.
- Regla de garantía.
- Regla de revisión.
- Genera puntos: sí/no.
- Disponible como recompensa: sí/no.

### 7.2 Instalación

Una instalación debe contener:

- Cliente.
- Vehículo.
- Producto.
- Número único de factura.
- Fecha de instalación.
- Kilometraje de instalación.
- Garantía del producto.
- Garantía de instalación.
- Próxima revisión por fecha.
- Próxima revisión por kilometraje.
- Estado.
- Empleado que registró la instalación.
- Versión de términos aceptada por el cliente.

No se registrará:

- Técnico instalador.
- Fotografías.
- Copia de la factura.
- Certificado adjunto.

La factura permanece en el sistema contable independiente.

## 8. Garantías

Reglas generales confirmadas:

- La garantía inicia en la fecha de instalación.
- Cubre producto e instalación.
- Gerencia acepta o rechaza casos de garantía.
- El cliente debe aceptar digitalmente las condiciones al registrar la instalación.
- El control se realizará mediante revisiones.
- La tolerancia informada es de 1.000 km o 15 días.

Flujo provisional de revisiones:

1. Se programa una primera revisión.
2. Si no asiste, se marca como omitida y se programa la siguiente.
3. Se permiten hasta tres oportunidades de revisión.
4. Si no asiste a la tercera y supera 1.000 km o 15 días de tolerancia, la
   garantía pasa a estado "perdida".

Estado pendiente:

- Los kilometrajes/fechas de cada revisión dependen del producto.
- Debe aclararse si la pérdida aplica a toda la garantía o solo a daños
  relacionados con falta de mantenimiento.
- Debe definirse el costo de cada revisión.
- Deben definirse las causas específicas de exclusión.

Estados propuestos:

- Activa.
- Revisión próxima.
- Revisión vencida.
- En tolerancia.
- Perdida por falta de revisión.
- En evaluación por gerencia.
- Aprobada.
- Rechazada.
- Finalizada.

## 9. Programa de puntos

Nombre de trabajo: "Tacion Points" / "TP's".  
Estado del nombre: PENDIENTE DE CONFIRMACIÓN COMERCIAL.

Reglas confirmadas:

- Se acreditan 100 Traction Points por cada USD 30 del total de factura.
- Cálculo: `floor(total_factura / 30)`.
- Todas las categorías generan puntos inicialmente.
- Los puntos no expiran.
- No se transfieren.
- No se convierten en dinero.
- No se combinan con promociones.
- No existe máximo por compra ni por cliente.
- Un canje no puede mezclar puntos y dinero.
- El canje requiere aprobación manual de un empleado.
- Empleados y superadministradores pueden ajustar puntos.
- Cada acreditación exige número único de factura.
- Una factura usada anteriormente debe quedar bloqueada.

Flujo de acreditación:

1. Empleado inicia sesión.
2. Busca al cliente.
3. Ingresa número de factura y total.
4. El servidor verifica que la factura no haya sido utilizada.
5. El servidor calcula los puntos.
6. El empleado confirma.
7. Se crea el movimiento y se actualiza el saldo.
8. El cliente ve el movimiento dentro del portal.

Los puntos nunca serán calculados en el navegador. La operación debe ejecutarse
en una transacción de base de datos.

Pendientes:

- Recompensas iniciales.
- Cantidad de puntos por recompensa.
- Productos excluidos.
- Tratamiento de notas de crédito/anulaciones.
- Confirmar si un ajuste de empleado requiere motivo obligatorio.

## 10. Canjes

Estados propuestos:

- Solicitado.
- Aprobado.
- Rechazado.
- Entregado.
- Cancelado.

Al solicitar un canje:

- Se valida el saldo.
- Se reservan los puntos.
- Un empleado aprueba o rechaza.
- Al entregar se confirma el descuento definitivo.
- Si se rechaza/cancela, los puntos reservados regresan al saldo.

No se permitirá saldo negativo.

## 11. Notificaciones

MVP:

- Notificaciones únicamente dentro del portal.
- No SMS.
- No WhatsApp automático.
- No campañas por email.

Eventos previstos:

- Revisión próxima.
- Revisión vencida.
- Puntos acreditados.
- Canje aprobado/rechazado.
- Nueva promoción.
- Doble puntuación futura.

Debe existir un indicador de leído/no leído.

## 12. Cierre de cuenta

Regla de negocio informada:

- El cliente puede solicitar eliminación desde el portal.
- Pierde acceso, puntos y datos visibles del vehículo.
- Los movimientos de puntos no se conservarán como historial personal.
- El sistema contable es independiente y conserva sus facturas.
- Las garantías se validan externamente mediante factura.

Implementación propuesta:

1. Confirmación reforzada antes de eliminar.
2. Invalidación inmediata de sesiones.
3. Eliminación de credenciales y datos personales del portal.
4. Eliminación de vehículos y puntos del portal.
5. Conservación de un hash no reversible del número de factura utilizado para
   impedir que una factura se use nuevamente en otra cuenta.
6. Conservación de auditoría mínima seudonimizada de operaciones administrativas.

Los puntos eliminados no podrán recuperarse si el cliente se registra nuevamente.

Esta sección requiere aprobación legal antes de producción.

## 13. Solicitudes de privacidad

Responsable principal: Juan José Lara Sánchez.  
Reemplazo: Paul Enrique Lara Escobar.  
Correo informado: `maxmotordelecuador@gmial.com`.

IMPORTANTE: El dominio `gmial.com` parece un error tipográfico. Debe confirmarse
si el correo correcto es `maxmotordelecuador@gmail.com`.

Solicitudes previstas:

- Acceso.
- Corrección.
- Actualización.
- Eliminación.
- Oposición.
- Revocación de consentimiento.

El plazo interno está pendiente de definición y revisión legal.

## 14. Integración contable

El sistema contable seguirá siendo independiente durante el MVP.

El portal almacenará únicamente:

- Número de factura.
- Fecha.
- Total usado para puntos.
- Cliente asociado mientras la cuenta esté activa.
- Empleado que registró la operación.
- Estado de uso/anulación cuando corresponda.

No será una copia tributaria ni reemplazará el sistema contable.

La integración automática con contabilidad queda fuera del MVP.

## 15. Requisitos no funcionales

- Diseño mobile-first.
- Acciones administrativas utilizables desde teléfono.
- Protección por roles y Row Level Security.
- Contraseñas administradas por proveedor de autenticación.
- Ninguna clave privada enviada al navegador.
- Auditoría de cambios sensibles.
- Validación de datos en servidor.
- Facturas únicas para puntos.
- Accesibilidad básica de formularios y navegación.
- Rendimiento adecuado en conexiones móviles.
- Imágenes servidas desde R2.
- Base de datos sin archivos binarios.
- Copias de seguridad manuales cifradas durante la etapa gratuita.

## 16. Fuera del alcance del MVP

- Suscripciones pagadas.
- Cobros recurrentes.
- 24 lavadas anuales.
- Integración automática con sistema contable.
- WhatsApp Business API.
- SMS.
- Telemetría de kilometraje.
- Aplicación móvil nativa.
- Carga de fotografías.
- Facturas o certificados adjuntos.
- Flotas y personas jurídicas.
- Varias sucursales con aislamiento de información.

## 17. Criterios de aceptación del MVP

El MVP estará funcionalmente completo cuando:

1. Un adulto pueda registrarse con un vehículo y acceder de forma segura.
2. Un empleado pueda validar al cliente, agregar vehículos e instalaciones.
3. Toda instalación esté vinculada a una factura.
4. El cliente pueda ver su vehículo y accesorios instalados.
5. El sistema calcule próximas revisiones por fecha/kilometraje.
6. El sistema aplique la tolerancia configurada.
7. Un empleado pueda acreditar puntos con una factura única.
8. La misma factura no pueda acreditarse dos veces.
9. El cliente pueda ver saldo y movimientos.
10. El cliente pueda solicitar un canje y un empleado aprobarlo.
11. Se pueda cerrar una cuenta según la política aprobada.
12. Toda operación sensible quede auditada.
13. Las políticas legales hayan sido revisadas por abogado y contador.

## 18. Pendientes que bloquean producción, pero no desarrollo inicial

- Identidad legal completa de Maxmotor.
- Confirmación completa de política de contraseñas.
- Correo correcto para privacidad.
- Plazo de respuesta a solicitudes.
- Garantías y revisiones por producto.
- Recompensas y productos excluidos.
- Regla contable para anulaciones/notas de crédito.
- Texto contractual de pérdida de garantía.
- Revisión legal de eliminación de cuenta y auditoría.
