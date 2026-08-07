# Estrategia de notificaciones a clientes

## Fuente de verdad

La notificacion se crea una sola vez en el portal Maxmotor. El portal conserva el mensaje durante 30 dias y registra su lectura. Los canales externos solo deben llevar al cliente de regreso a MiMaxmotor.

## Canales recomendados

1. `Portal`: inmediato y sin costo; siempre disponible.
2. `WhatsApp Channel y Estados`: promocion masiva de bajo riesgo y sin automatizar numeros personales.
3. `Correo`: respaldo para mensajes de cuenta o resumenes, dentro de cuotas.
4. `WhatsApp Business Platform oficial`: fase posterior para plantillas, imagenes y segmentacion individual.

## WhatsApp

No utilizar librerias que imitan WhatsApp Web ni proyectos genericos llamados `APIWHATSAPP` para produccion. Requieren mantener una sesion y un servidor, pueden exponer los chats y arriesgan el bloqueo del numero comercial.

La integracion correcta es la API oficial de Meta. Para iniciar promociones necesita:

- consentimiento separado y demostrable del cliente;
- fecha, origen y alcance del consentimiento;
- plantilla de marketing aprobada;
- opcion clara de dejar de recibir mensajes;
- control de frecuencia y registro de entregas.

## Arquitectura futura

1. El empleado publica titulo, texto, imagen, audiencia y vigencia.
2. D1 guarda la notificacion del portal.
3. Un proceso selecciona unicamente clientes con consentimiento de WhatsApp.
4. La API oficial envia una plantilla con enlace a `https://maxmotor4x4.com/MiMaxmotor`.
5. Estados de entrega, lectura y baja se almacenan en una bitacora.

El CRM de prospectos y MiMaxmotor deben mantener consentimientos separados. Haber solicitado una cotizacion no autoriza automaticamente promociones recurrentes.
