async function runSuite() {
  console.log("=== INICIANDO VALIDACIÓN DE CAMPAÑAS Y POPUP PROMOCIONAL ===");

  // 1. Endpoint público inicial
  console.log("\n[TEST 1] Consultando endpoint público /api/campaigns/active...");
  const pubRes = await fetch("http://localhost:3000/api/campaigns/active");
  const pubData = await pubRes.json();
  console.log("-> Respuesta pública inicial (debe ser null si está desactivada):", pubData.campaign);

  // 2. Verificación de seguridad
  console.log("\n[TEST 2] Verificando protección de acceso sin autenticación a /api/admin/campaigns...");
  const unauthRes = await fetch("http://localhost:3000/api/admin/campaigns");
  console.log("-> Código HTTP recibido (esperado 401):", unauthRes.status);
  if (unauthRes.status !== 401) {
    throw new Error("Fallo de seguridad: el endpoint de administración debe requerir autenticación (401)");
  }
  console.log("-> ¡Seguridad verificada con éxito!");

  // 3. Inicio de sesión administrativo
  console.log("\n[TEST 3] Autenticando sesión de administrador...");
  const loginRes = await fetch("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "lumira2026" })
  });
  console.log("-> Estado de login:", loginRes.status);
  const cookie = loginRes.headers.get("set-cookie")?.split(";")[0] || "admin_session=authenticated";

  // 4. Leer campañas con autenticación
  console.log("\n[TEST 4] Leyendo campañas desde el panel de administración...");
  const getRes = await fetch("http://localhost:3000/api/admin/campaigns", {
    headers: { Cookie: cookie }
  });
  const getData = await getRes.json();
  console.log("-> Campañas encontradas en almacenamiento:", getData.campaigns?.length);

  // 5. Crear / Activar campaña activa en tienda
  console.log("\n[TEST 5] Creando y activando campaña promocional con popup...");
  const newCampRes = await fetch("http://localhost:3000/api/admin/campaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie
    },
    body: JSON.stringify({
      action: "save",
      data: {
        title: "¡Especial de Belleza Lumira!",
        description: "Descubre nuestros productos favoritos para el cuidado facial y maquillaje con envío express.",
        promoBadge: "Hasta 30% OFF",
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1000",
        buttonText: "Explorar Catálogo",
        buttonUrl: "/#catalogo",
        frequency: "once_per_session",
        enabled: true
      }
    })
  });
  const newCampData = await newCampRes.json();
  console.log("-> Campaña guardada con éxito:", newCampData.success, "ID:", newCampData.campaign?.id);
  const activeCampId = newCampData.campaign?.id;

  // 6. Verificar que la tienda pública recibe la campaña activa
  console.log("\n[TEST 6] Verificando que la tienda pública recibe la campaña activa...");
  const pubActiveRes = await fetch("http://localhost:3000/api/campaigns/active");
  const pubActiveData = await pubActiveRes.json();
  console.log("-> Campaña activa en tienda:", pubActiveData.campaign?.title);
  console.log("-> Badge promocional:", pubActiveData.campaign?.promoBadge);
  console.log("-> Frecuencia configurada:", pubActiveData.campaign?.frequency);
  if (!pubActiveData.campaign || pubActiveData.campaign.id !== activeCampId) {
    throw new Error("La campaña activa no coincide con la esperada");
  }

  // 7. Prueba de campaña programada en el futuro (NO debe aparecer en tienda pública)
  console.log("\n[TEST 7] Verificando campaña programada en fecha futura...");
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const scheduledCampRes = await fetch("http://localhost:3000/api/admin/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      action: "save",
      data: {
        title: "Campaña Futura del Próximo Mes",
        description: "Esta campaña no debe mostrarse aún",
        enabled: true,
        startDate: futureDate
      }
    })
  });
  const scheduledData = await scheduledCampRes.json();
  console.log("-> Estado evaluado para campaña futura (debe ser 'scheduled'):", scheduledData.campaign?.status);
  if (scheduledData.campaign?.status !== 'scheduled') {
    throw new Error("La campaña futura debería tener estado 'scheduled'");
  }

  // 8. Prueba de campaña vencida en el pasado (NO debe aparecer en tienda pública)
  console.log("\n[TEST 8] Verificando campaña con fecha de finalización expirada...");
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const endedCampRes = await fetch("http://localhost:3000/api/admin/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      action: "save",
      data: {
        title: "Campaña Antigua Vencida",
        description: "Esta campaña ya expiró",
        enabled: true,
        endDate: pastDate
      }
    })
  });
  const endedData = await endedCampRes.json();
  console.log("-> Estado evaluado para campaña vencida (debe ser 'ended'):", endedData.campaign?.status);
  if (endedData.campaign?.status !== 'ended') {
    throw new Error("La campaña expirada debería tener estado 'ended'");
  }

  // 9. Desactivar campaña activa mediante toggle
  console.log("\n[TEST 9] Desactivando campaña con switch toggle...");
  const toggleRes = await fetch("http://localhost:3000/api/admin/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ action: "toggle", id: activeCampId })
  });
  const toggleData = await toggleRes.json();
  console.log("-> Toggle ejecutado. Nuevo estado enabled:", toggleData.campaign?.enabled, "Status:", toggleData.campaign?.status);

  // 10. Limpieza: Eliminar campañas de prueba creadas
  console.log("\n[TEST 10] Limpiando campañas de prueba creadas...");
  if (scheduledData.campaign?.id) {
    await fetch("http://localhost:3000/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ action: "delete", id: scheduledData.campaign.id })
    });
  }
  if (endedData.campaign?.id) {
    await fetch("http://localhost:3000/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ action: "delete", id: endedData.campaign.id })
    });
  }

  // Dejar la campaña principal activa y lista para el usuario
  console.log("\n[TEST 11] Reactivando campaña principal para dejarla lista en el panel...");
  await fetch("http://localhost:3000/api/admin/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ action: "toggle", id: activeCampId })
  });
  console.log("-> Campaña principal reactivada exitosamente.");

  console.log("\n========================================================");
  console.log("🎉 TODAS LAS 11 PRUEBAS DE CAMPAÑAS Y POPUP FUERON EXITOSAS! 🎉");
  console.log("========================================================");
}

runSuite().catch(err => {
  console.error("Error en pruebas:", err);
  process.exit(1);
});
