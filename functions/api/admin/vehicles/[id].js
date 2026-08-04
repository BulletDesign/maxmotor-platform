import { requireUser } from "../../../_lib/auth.js";
import { deleteVehicleData } from "../../../_lib/customer-data.js";
import { assertSameOrigin, handleError, HttpError, json, readJson } from "../../../_lib/http.js";

export async function onRequestDelete({ request, env, params }) {
  try {
    assertSameOrigin(request);
    const actor = await requireUser(request, env.DB, ["employee", "superadmin"]);
    const body = await readJson(request);
    if (String(body.confirmation || "") !== "ELIMINAR VEHICULO") throw new HttpError(400, "Confirmacion requerida");
    await deleteVehicleData(env.DB, params.id, String(body.customerId || ""), actor.id);
    return json({ ok: true });
  } catch (error) { return handleError(error); }
}
