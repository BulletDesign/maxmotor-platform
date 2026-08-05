import { requireUser } from "../../../_lib/auth.js";
import { assertSameOrigin, handleError, HttpError } from "../../../_lib/http.js";

export async function onRequestPost({ request, env }) {
  try {
    assertSameOrigin(request);
    await requireUser(request, env.DB, ["employee", "superadmin"]);
    throw new HttpError(409, "Usa el registro de venta completa para vincular factura, puntos, instalacion y garantia");
  } catch (error) {
    return handleError(error);
  }
}
