# Plan de implementacion

## 1. Repositorio y despliegue continuo

- Crear un repositorio privado en GitHub y enlazar este repositorio local.
- Proteger `main` y exigir el workflow `Verify`.
- Crear un proyecto nuevo de Cloudflare Pages conectado a GitHub.
- Configurar build `npm run build`, salida `dist` y Node.js 22.

## 2. Datos y ambientes

- Crear D1 `maxmotor-dev` y `maxmotor-prod`.
- Aplicar `migrations/0001_initial.sql` en ambos ambientes.
- Enlazar `DB` en Preview y Production dentro de Pages.
- Crear el primer superadministrador por procedimiento controlado.

## 3. MVP backend

- Completar autenticacion, recuperacion de acceso y cierre de sesiones.
- Implementar perfiles, vehiculos, instalaciones y garantias.
- Implementar facturas y libro mayor inmutable de puntos.
- Crear operaciones administrativas con auditoria y control de roles.

## 4. Portales

- Portal cliente: vehiculos, accesorios, garantias, puntos y movimientos.
- Portal empleado: busqueda de cliente, factura, instalacion y garantia.
- Portal superadmin: usuarios, roles, catalogo, reglas y auditoria.

## 5. Paso a produccion

- Ejecutar pruebas funcionales, seguridad, accesibilidad y SEO.
- Verificar textos legales y politicas de conservacion pendientes.
- Migrar el dominio al nuevo proyecto Pages y validar DNS, cache y SSL.
- Monitorear errores, autenticacion y movimientos de puntos tras publicar.
