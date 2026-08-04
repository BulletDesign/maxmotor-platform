# Maxmotor Portal - Modelo de datos conceptual MVP v1

Fecha: 25 de julio de 2026  
Estado: Diseño previo a migraciones SQL

## 1. Principios

- PostgreSQL será la fuente de verdad del portal.
- El sistema contable seguirá siendo independiente.
- Los archivos e imágenes permanecerán fuera de PostgreSQL.
- Los clientes solo podrán leer sus propios datos.
- Los empleados podrán operar sobre todos los clientes.
- Las operaciones de puntos y garantías se ejecutarán en el servidor.
- Las reglas comerciales tendrán versión para no modificar ventas históricas.
- No se almacenarán contraseñas directamente.
- La cédula no se utilizará como contraseña.
- Se minimizarán cédula y fecha de nacimiento.

## 2. Esquema general

```text
auth.users
    |
    +-- profiles
          |
          +-- customers
          |     |
          |     +-- vehicles
          |     |     |
          |     |     +-- installations
          |     |            |
          |     |            +-- installation_reviews
          |     |
          |     +-- points_accounts
          |     |     |
          |     |     +-- points_ledger
          |     |
          |     +-- redemptions
          |     +-- notifications
          |     +-- consents
          |
          +-- employee_profiles

product_categories
    |
    +-- products
          |
          +-- product_variants
          +-- warranty_policy_versions
                    |
                    +-- warranty_review_rules

invoice_claims
rewards
audit_logs
account_deletion_requests
invoice_use_registry
```

## 3. Identidad y acceso

### `profiles`

Representa cualquier usuario autenticado.

Campos:

- `id`: UUID, igual a `auth.users.id`.
- `role`: `customer`, `employee` o `superadmin`.
- `phone_normalized`: teléfono en formato internacional.
- `display_name`.
- `account_status`: `pending`, `active`, `blocked`, `deletion_pending`, `deleted`.
- `created_at`.
- `updated_at`.
- `last_login_at`.

Restricciones:

- Teléfono único entre cuentas activas.
- El cliente no puede modificar su rol.

### `customers`

Datos específicos del cliente.

Campos:

- `id`.
- `profile_id`.
- `customer_code`: código público generado por el servidor.
- `first_name`.
- `last_name`.
- `national_id_hash`: hash para detectar duplicados y verificar coincidencia.
- `national_id_last4`: únicamente para confirmación visual.
- `adult_verified_at`.
- `email`: opcional.
- `privacy_status`.
- `created_at`.

Decisión de minimización:

- La fecha completa de nacimiento se usa para validar mayoría de edad durante el
  registro, pero no se conserva después de completar la verificación.
- La cédula completa no necesita mostrarse ni recuperarse; se conserva hash y
  últimos cuatro dígitos.

### `employee_profiles`

Campos:

- `profile_id`.
- `employee_code`.
- `job_title`.
- `active`.
- `can_adjust_points`.
- `can_manage_rewards`.
- `created_by`.

Los dos superadministradores se identifican mediante `profiles.role`.

## 4. Vehículos

### `vehicles`

Campos:

- `id`.
- `customer_id`.
- `make`.
- `model`.
- `year`.
- `plate_normalized`.
- `vin_normalized`.
- `color`.
- `current_odometer_km`.
- `current_odometer_recorded_at`.
- `created_by_profile_id`.
- `status`: `active`, `archived`.
- `created_at`.
- `updated_at`.

Restricciones:

- Cada vehículo pertenece a un solo cliente.
- Placa única entre vehículos activos.
- VIN único entre vehículos activos.
- Kilometraje nuevo no puede ser inferior al kilometraje de una instalación
  registrada, salvo corrección auditada por superadministrador.

No se creará una tabla pública de fotografías.

## 5. Catálogo

### `product_categories`

Campos:

- `id`.
- `slug`.
- `name`.
- `sort_order`.
- `active`.

### `products`

Campos:

- `id`.
- `category_id`.
- `sku`.
- `slug`.
- `name`.
- `brand`.
- `description`.
- `universal`.
- `image_url`.
- `active`.
- `earns_points`.
- `reward_eligible`.

### `product_variants`

Permite representar talla, acabado, capacidad o versión sin duplicar el producto.

Campos:

- `id`.
- `product_id`.
- `variant_code`.
- `name`.
- `attributes`: JSON con capacidad, color, material, talla o acabado.
- `price_reference_cents`.
- `active`.

Los precios de referencia del catálogo no constituyen factura.

## 6. Garantías configurables

### `warranty_policy_versions`

Cada cambio crea una nueva versión. Las instalaciones antiguas conservan la regla
que aceptó el cliente.

Campos:

- `id`.
- `product_id`.
- `product_variant_id`: opcional.
- `version`.
- `product_warranty_months`.
- `installation_warranty_months`.
- `tolerance_km`.
- `tolerance_days`.
- `maintenance_required`.
- `maintenance_instructions`.
- `review_cost_cents`.
- `exclusions`.
- `terms_text`.
- `active_from`.
- `active_until`.
- `approved_by_profile_id`.

### `warranty_review_rules`

Representa primera, segunda y tercera revisión.

Campos:

- `id`.
- `warranty_policy_version_id`.
- `sequence_number`.
- `due_after_install_km`.
- `due_after_install_days`.
- `label`.
- `mandatory`.

Esto permite que una suspensión tenga revisiones por kilometraje y una tapa por
tiempo sin modificar código.

## 7. Instalaciones y revisiones

### `installations`

Campos:

- `id`.
- `customer_id`.
- `vehicle_id`.
- `product_id`.
- `product_variant_id`: opcional.
- `invoice_claim_id`.
- `warranty_policy_version_id`.
- `installed_at`.
- `installed_odometer_km`.
- `warranty_status`.
- `current_review_sequence`.
- `next_review_due_at`.
- `next_review_due_odometer_km`.
- `terms_accepted_at`.
- `terms_version`.
- `created_by_profile_id`.
- `created_at`.

Restricciones:

- No existe instalación sin factura.
- La fecha y kilometraje no pueden quedar vacíos.
- El cliente no puede crear ni modificar instalaciones.

### `installation_reviews`

Campos:

- `id`.
- `installation_id`.
- `sequence_number`.
- `scheduled_at`.
- `scheduled_odometer_km`.
- `performed_at`.
- `performed_odometer_km`.
- `status`: `scheduled`, `completed`, `missed`, `in_tolerance`, `expired`.
- `notes`.
- `recorded_by_profile_id`.
- `created_at`.

## 8. Referencias de factura

### `invoice_claims`

No reemplaza el sistema contable.

Campos:

- `id`.
- `customer_id`.
- `vehicle_id`: opcional.
- `invoice_number`.
- `invoice_number_hash`.
- `invoice_date`.
- `total_cents`.
- `status`: `active`, `voided`, `credited`.
- `recorded_by_profile_id`.
- `created_at`.

Restricciones:

- `invoice_number_hash` debe ser único.
- El dinero se guarda en centavos enteros, nunca como decimal flotante.
- El número debe normalizarse antes de calcular el hash.

### `invoice_use_registry`

Registro mínimo no personal para impedir reutilización después de cerrar cuentas.

Campos:

- `invoice_number_hash`.
- `first_used_at`.
- `purpose`: `points`, `installation` o ambos.
- `inactive`.

No contiene nombre, teléfono, cédula, placa ni VIN.

## 9. Puntos

### `points_accounts`

Campos:

- `customer_id`.
- `available_points`.
- `reserved_points`.
- `updated_at`.

El saldo es una proyección rápida. Los movimientos son la fuente de verdad
mientras la cuenta está activa.

### `points_ledger`

Campos:

- `id`.
- `customer_id`.
- `invoice_claim_id`: opcional.
- `redemption_id`: opcional.
- `type`: `earn`, `adjustment`, `reserve`, `redeem`, `release`, `reversal`.
- `points_delta`.
- `balance_after`.
- `reason`.
- `created_by_profile_id`.
- `created_at`.

Reglas:

- Una factura genera `floor(total_cents / 3000)` puntos.
- No se aceptan movimientos directos desde el navegador.
- Cada ajuste manual requiere empleado y auditoría.
- El saldo no puede quedar negativo.
- Los movimientos se eliminan al ejecutar el cierre definitivo aprobado, según
  la regla informada por Maxmotor.

### Función `award_purchase_points`

Operación atómica:

1. Verifica rol de empleado/superadmin.
2. Normaliza y bloquea número de factura.
3. Comprueba que no exista.
4. Calcula puntos.
5. Crea `invoice_claims`.
6. Crea `invoice_use_registry`.
7. Crea movimiento.
8. Actualiza saldo.
9. Registra auditoría.

Si cualquier paso falla, no se guarda ninguno.

## 10. Recompensas y canjes

### `rewards`

Campos:

- `id`.
- `name`.
- `description`.
- `points_cost`.
- `stock_mode`: `unlimited` o `controlled`.
- `stock_quantity`.
- `active_from`.
- `active_until`.
- `active`.
- `created_by_profile_id`.

### `redemptions`

Campos:

- `id`.
- `customer_id`.
- `reward_id`.
- `points_cost_snapshot`.
- `status`.
- `requested_at`.
- `approved_at`.
- `delivered_at`.
- `approved_by_profile_id`.
- `notes`.

Los puntos se reservan al solicitar y se descuentan definitivamente al entregar.

## 11. Notificaciones internas

### `notifications`

Campos:

- `id`.
- `customer_id`.
- `type`.
- `title`.
- `body`.
- `action_url`.
- `read_at`.
- `created_at`.
- `expires_at`.

No se almacena información de WhatsApp o SMS en el MVP.

## 12. Consentimientos

### `consents`

Campos:

- `id`.
- `customer_id`.
- `type`: `privacy`, `terms`, `warranty`, `marketing`.
- `document_version`.
- `accepted`.
- `accepted_at`.
- `revoked_at`.
- `ip_address`: opcional y con retención limitada.
- `user_agent`: opcional y con retención limitada.

El consentimiento de marketing debe ser independiente aunque no se activen
campañas durante el MVP.

## 13. Eliminación de cuenta

### `account_deletion_requests`

Campos:

- `id`.
- `customer_id`.
- `requested_at`.
- `confirmed_at`.
- `executed_at`.
- `status`.
- `executed_by_profile_id`.
- `legal_hold_reason`: opcional.

Flujo:

1. Cliente solicita eliminación.
2. El sistema muestra pérdida definitiva de puntos y datos del portal.
3. Cliente confirma.
4. Se bloquean sesiones.
5. Superadministrador ejecuta o revisa si existe garantía/reclamo.
6. Se eliminan datos del portal según política aprobada.
7. Se conserva únicamente el hash no reversible de facturas usadas.

La factura fiscal permanece en el sistema contable externo.

## 14. Auditoría

### `audit_logs`

Campos:

- `id`.
- `actor_profile_id`.
- `action`.
- `entity_type`.
- `entity_id`.
- `before_data`: JSON filtrado.
- `after_data`: JSON filtrado.
- `reason`.
- `created_at`.

Nunca registrar:

- Contraseñas.
- Tokens.
- Cédula completa.
- VIN completo en texto de auditoría.

Acciones obligatorias:

- Cambio de rol.
- Ajuste de puntos.
- Registro/anulación de factura.
- Cambio de vehículo.
- Registro/cambio de instalación.
- Decisión de garantía.
- Aprobación/rechazo de canje.
- Eliminación de cuenta.

## 15. Matriz de acceso RLS

| Tabla | Cliente | Empleado | Superadmin |
|---|---|---|---|
| `profiles` | Lee/edita campos propios permitidos | Lee clientes | Total |
| `customers` | Lee datos propios | Lee/edita | Total |
| `vehicles` | Lee propios | Crea/edita | Total |
| `products` | Lee activos | Lee | Crea/edita |
| `installations` | Lee propias | Crea/edita | Total |
| `installation_reviews` | Lee propias | Crea/edita | Total |
| `invoice_claims` | Lee resumen propio | Crea/edita estado | Total |
| `points_ledger` | Lee propio | Crea vía función | Total vía función |
| `rewards` | Lee activos | Gestiona | Total |
| `redemptions` | Crea/lee propios | Aprueba/entrega | Total |
| `notifications` | Lee propias | Crea operativas | Total |
| `audit_logs` | Sin acceso | Sin acceso general | Lee |

## 16. Operaciones de servidor

Funciones mínimas:

- `register_customer`.
- `create_customer_vehicle`.
- `create_employee_vehicle`.
- `update_vehicle_odometer`.
- `record_installation`.
- `record_warranty_review`.
- `evaluate_warranty_status`.
- `award_purchase_points`.
- `adjust_points`.
- `request_redemption`.
- `approve_redemption`.
- `complete_redemption`.
- `request_account_deletion`.
- `execute_account_deletion`.

Las funciones críticas deben validar el rol dentro de PostgreSQL, no confiar
únicamente en botones ocultos en la interfaz.

## 17. Índices mínimos

- Teléfono normalizado único.
- Hash de cédula único.
- Código de cliente único.
- Placa normalizada.
- VIN normalizado.
- SKU y slug de producto.
- Hash de número de factura único.
- Instalaciones por vehículo/fecha.
- Revisiones por estado/fecha.
- Movimientos por cliente/fecha.
- Notificaciones por cliente/leído.

## 18. Pendientes antes de convertir este modelo a SQL

- Confirmar contraseña creada por cliente.
- Confirmar si fecha de nacimiento se descarta tras validar edad.
- Confirmar si cédula completa nunca necesita recuperarse.
- Garantías por producto.
- Regla exacta de tres revisiones.
- Tratamiento contable de anulaciones/notas de crédito.
- Política legal de eliminación y auditoría.
- Confirmar correo de privacidad.
