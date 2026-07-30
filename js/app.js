document.addEventListener('DOMContentLoaded', () => {
  // --- INICIO MAGIA ---
  const hashStr = window.location.hash;
  const urlParams = new URLSearchParams(window.location.search);
  const proposalId = urlParams.get('id');

  if (proposalId) {
    // 1. Cargar desde Base de Datos (n8n Webhook GET)
    // Rocío, cambia esta URL por la del webhook GET que crees en n8n
    const webhookGetUrl = 'https://n8n-n8n.npfusf.easypanel.host/webhook/ver-propuesta';
    
    if (webhookGetUrl === 'URL_DEL_WEBHOOK_GET_DE_N8N') {
      alert("Aviso: Aún no has configurado el Webhook GET de n8n en app.js");
    } else {
      fetch(webhookGetUrl + '?id=' + proposalId)
        .then(res => res.json())
        .then(data => {
          renderizarPropuesta(data);
        })
        .catch(err => {
          console.error("Error cargando la propuesta desde n8n:", err);
          alert("Error: No se pudo cargar la propuesta. Es posible que el enlace haya caducado o sea incorrecto.");
        });
    }
  } else if(hashStr && hashStr.startsWith('#data=')) {
    // 2. Cargar desde Base64 (Legacy o Fallback)
    try {
      const base64Str = hashStr.replace('#data=', '');
      const decodedStr = decodeURIComponent(atob(base64Str));
      const magicData = JSON.parse(decodedStr);
      renderizarPropuesta(magicData);
    } catch(e) {
      console.error("Error desencriptando el enlace mágico:", e);
    }
  } else if (typeof configCliente !== 'undefined' && document.getElementById('clientName')) {
    // 3. Cargar desde config.js (Pruebas locales)
    populateDashboard(configCliente);
  } else if (!document.getElementById('clientName')) {
    console.log('Modo catálogo: No se requiere config.js para poblar datos.');
  } else {
    console.error('No se ha encontrado la configuración del cliente.');
  }
  // --- FIN MAGIA ---

  // Manejo del Modal

  const modal = document.getElementById('diagnosticModal');
  const btnOpen = document.getElementById('btnOpenDiagnostic');
  const btnClose = document.getElementById('btnCloseDiagnostic');

  if(btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if(btnClose && modal) {
    btnClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  // Cerrar modal al clickear fuera
  if(modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
});

function renderizarPropuesta(magicData) {
  if (magicData && document.getElementById('clientName')) {
    // Si venimos de un enlace mágico, clonamos la configuración base (si existe) y la sobrescribimos
    let configOverride = typeof configCliente !== 'undefined' ? JSON.parse(JSON.stringify(configCliente)) : {
      cliente: {nombre: "", logo_url: "https://ui-avatars.com/api/?name=Cliente", sector: "Empresa"},
      propuesta: {titulo: "Programa de Formación en IA", subtitulo: "Adaptado a las necesidades de la empresa", fecha: new Date().getFullYear(), formato: "Consultoría y Formación"},
      modulos: [], beneficios: [], inversion: {precio_base: "", notas: "", bonificable_fundae: true, precios: []}
    };
    
    configOverride.cliente.nombre = magicData.empresa;
    // Generar avatar dinámico con las iniciales de la empresa
    configOverride.cliente.logo_url = "https://ui-avatars.com/api/?name=" + encodeURIComponent(magicData.empresa) + "&background=F2F2F2&color=D80F2C";
    configOverride.inversion.precios = magicData.precios || [];
    configOverride.inversion.precio_base = magicData.precio || "";
    
    // El formato antiguo usa subtitulo, el nuevo usa subtitulo_propuesta
    configOverride.propuesta.subtitulo = magicData.subtitulo_propuesta || magicData.subtitulo || configOverride.propuesta.subtitulo;
    configOverride.propuesta.formato = magicData.formato || configOverride.propuesta.formato;
    
    // Forzar beneficios por si se perdieron
    configOverride.beneficios = [
      "Capacitación adaptada al flujo de trabajo real",
      "Implantación práctica inmediata",
      "Cumplimiento ético y legal (RGPD y Ley Europea de IA)",
      "Soporte continuo de dudas durante 30 días"
    ];

    configOverride.modulos = [];
    
    // ==========================================
    // NUEVA ESTRUCTURA (NODO REDACTOR N8N)
    // ==========================================
    if (magicData.formacion_recomendada) {
      
      // Resumen
      let resumenHtml = "";
      if (magicData.resumen_parrafo_1) resumenHtml += `<p>${magicData.resumen_parrafo_1}</p>`;
      if (magicData.resumen_parrafo_2) resumenHtml += `<p>${magicData.resumen_parrafo_2}</p>`;
      configOverride.resumen = resumenHtml;
      
      // Guardamos los textos extra en la configuración para inyectarlos en cajas bonitas después
      configOverride.extra = {
        consultoria: magicData.consultoria_texto || null,
        implementacion: magicData.implementacion_texto || null,
        gobernanza: magicData.gobernanza_texto || null
      };
      
      // Módulo 1 (Recomendada)
      configOverride.modulos.push({
        titulo: magicData.formacion_recomendada.titulo,
        tipo: "Fase 1",
        duracion: "Recomendado para empezar",
        descripcion: magicData.formacion_recomendada.descripcion,
        puntos_clave: magicData.formacion_recomendada.contenidos || []
      });
      
      // Módulo 2 (Ampliación 1)
      if (magicData.ampliacion_1 && magicData.ampliacion_1.visible) {
        configOverride.modulos.push({
          titulo: magicData.ampliacion_1.titulo,
          tipo: "Fase 2",
          duracion: "Ampliación opcional",
          descripcion: magicData.ampliacion_1.descripcion,
          puntos_clave: magicData.ampliacion_1.contenidos || []
        });
      }
      
      // Módulo 3 (Ampliación 2)
      if (magicData.ampliacion_2 && magicData.ampliacion_2.visible) {
        configOverride.modulos.push({
          titulo: magicData.ampliacion_2.titulo,
          tipo: "Fase 3",
          duracion: "Ampliación opcional",
          descripcion: magicData.ampliacion_2.descripcion,
          puntos_clave: magicData.ampliacion_2.contenidos || []
        });
      }
      
    // ==========================================
    // ESTRUCTURA ANTIGUA (LEGACY / BASE64)
    // ==========================================
    } else {
      const resumenFormateado = (magicData.resumen || magicData.texto || "").replace(/\n/g, '<br><br>').replace(/- /g, '• ');
      configOverride.resumen = resumenFormateado;
      
      if(magicData.modulos && magicData.modulos.length > 0) {
        magicData.modulos.forEach((mod, index) => {
          configOverride.modulos.push({
            titulo: mod.titulo,
            tipo: "Hacer",
            duracion: "Módulo " + (index + 1),
            descripcion: mod.desc.replace(/\n/g, '<br>').replace(/- /g, '• '),
            puntos_clave: []
          });
        });
      }
    }
    
    populateDashboard(configOverride);
    
    // Limpiamos la URL para que no se vea el chorizo largo arriba (opcional pero estético)
    window.history.replaceState(null, null, ' '); 
  }
}

function populateDashboard(data) {
  // Rellenar datos del cliente
  document.getElementById('clientName').textContent = data.cliente.nombre;
  document.getElementById('clientSector').textContent = data.cliente.sector;
  document.getElementById('clientAvatar').src = data.cliente.logo_url;

  // Rellenar Hero de la propuesta
  document.getElementById('heroBadge').textContent = data.propuesta.fecha + " · " + data.propuesta.formato;
  document.getElementById('heroTitle').textContent = data.propuesta.titulo;
  document.getElementById('heroSubtitle').textContent = data.propuesta.subtitulo;

  // Rellenar Resumen
  const resumenContainer = document.getElementById('resumenContainer');
  if (resumenContainer && data.resumen) {
    resumenContainer.innerHTML = data.resumen;
  }

  // Rellenar Módulos
  const modulesContainer = document.getElementById('modulesContainer');
  if (modulesContainer) {
    modulesContainer.innerHTML = '';
  
  data.modulos.forEach(mod => {
    let badgeClass = '';
    if(mod.tipo === 'Saber') badgeClass = 'badge-saber';
    else if(mod.tipo === 'Hacer') badgeClass = 'badge-hacer';
    else if(mod.tipo === 'Ser') badgeClass = 'badge-ser';

    const pointsList = mod.puntos_clave.map(p => `<li>${p}</li>`).join('');

    const modHTML = `
      <div class="card">
        <div class="card-badge ${badgeClass}">${mod.tipo}</div>
        <h3 class="card-title">${mod.titulo} <span style="color:var(--text-muted); font-size:0.85rem; font-weight:normal">(${mod.duracion})</span></h3>
        <p class="card-desc">${mod.descripcion}</p>
        <ul class="card-list">
          ${pointsList}
        </ul>
      </div>
    `;
    modulesContainer.insertAdjacentHTML('beforeend', modHTML);
  });
  }

  // Rellenar Servicios Extra
  const serviciosExtraContainer = document.getElementById('serviciosExtraContainer');
  if (serviciosExtraContainer && data.extra) {
    serviciosExtraContainer.innerHTML = '';
    
    if (data.extra.consultoria) {
      serviciosExtraContainer.insertAdjacentHTML('beforeend', `
          <div class="card" style="background:white; border-left: 4px solid #f59e0b;">
            <div class="card-badge" style="background:#fef3c7; color:#b45309; margin-bottom:1rem; font-weight:bold; letter-spacing:0.5px;">Fase Estratégica</div>
            <h3 class="card-title">Consultoría y Roadmap</h3>
            <p class="card-desc" style="margin-bottom: 0;">${data.extra.consultoria}</p>
          </div>
      `);
    }
    if (data.extra.implementacion) {
      serviciosExtraContainer.insertAdjacentHTML('beforeend', `
          <div class="card" style="background:white; border-left: 4px solid #3b82f6;">
            <div class="card-badge" style="background:#dbeafe; color:#1d4ed8; margin-bottom:1rem; font-weight:bold; letter-spacing:0.5px;">Fase Técnica</div>
            <h3 class="card-title">Implementación y Desarrollo</h3>
            <p class="card-desc" style="margin-bottom: 0;">${data.extra.implementacion}</p>
          </div>
      `);
    }
    if (data.extra.gobernanza) {
      serviciosExtraContainer.insertAdjacentHTML('beforeend', `
          <div class="card span-2-desktop" style="background:white; border-left: 4px solid #10b981;">
            <div class="card-badge" style="background:#d1fae5; color:#047857; margin-bottom:1rem; font-weight:bold; letter-spacing:0.5px;">Seguridad y Auditoría</div>
            <h3 class="card-title">Uso Seguro, Ciberseguridad y Gobernanza</h3>
            <p class="card-desc" style="margin-bottom: 0;">${data.extra.gobernanza}</p>
          </div>
      `);
    }
  }

  // Rellenar Beneficios
  const benefitsContainer = document.getElementById('benefitsContainer');
  if (benefitsContainer) {
    benefitsContainer.innerHTML = '';
    data.beneficios.forEach(ben => {
      benefitsContainer.insertAdjacentHTML('beforeend', `<li>${ben}</li>`);
    });
  }

  // Rellenar Inversión
  const inversionContainer = document.getElementById('inversionContainer');
  if (inversionContainer) {
    inversionContainer.innerHTML = '';
    if (data.inversion.precios && data.inversion.precios.length > 0) {
      data.inversion.precios.forEach(p => {
        const boxHTML = `
          <div style="background:var(--bg-color); border:1px solid #e5e7eb; padding: 2.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:2rem; border-radius:8px; margin-bottom:1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="flex: 1; min-width: 300px;">
              <div class="card-badge" style="background:var(--primary); color:white; margin-bottom:1rem; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; font-size: 0.9rem; padding: 0.5rem 1rem;">${p.badge || 'BONIFICABLE FUNDAE'}</div>
              <h3 style="font-size: 3.5rem; color:var(--text-main); font-weight: 800; font-family:'Roboto', sans-serif; margin-bottom:1rem; line-height: 1;">${p.precio}</h3>
              
              <div style="color:var(--text-muted); font-size:1rem; max-width:600px; line-height:1.6; margin-bottom: 1.5rem;">
                ${p.desc}
              </div>
              
              <div style="background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 1rem 1.5rem; border-radius: 4px; display: inline-block;">
                <span style="color: #2E7D32; font-size: 0.95rem; font-weight: 600;">
                  ✓ Formación bonificable por FUNDAE hasta un máximo de ${p.fundae}€
                </span>
              </div>
            </div>
            
            <div style="text-align:right; align-self: center;">
              <a href="https://cal.com/rocio-cano-seviai" target="_blank" class="btn btn-primary" style="font-size: 1.2rem; padding: 1.2rem 2.5rem; display:inline-block; font-weight:bold; letter-spacing:0.5px; box-shadow: 0 4px 12px rgba(216, 15, 44, 0.3);">AGENDAR REUNIÓN DE INICIO</a>
            </div>
          </div>
        `;
        inversionContainer.insertAdjacentHTML('beforeend', boxHTML);
      });
    } else {
      // Legacy fallback por si usan un enlace antiguo
      inversionContainer.innerHTML = `
        <div style="background:var(--bg-color); border:1px solid #e5e7eb; padding: 2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem; border-radius:4px;">
          <div>
            <div class="card-badge" style="background:#1f2937; color:white; margin-bottom:1rem; font-weight:600;">BONIFICABLE FUNDAE</div>
            <h3 style="font-size: 2.5rem; color:var(--primary); font-family:'Roboto', sans-serif; margin-bottom:0.5rem;">${data.inversion.precio_base}</h3>
            <p style="color:var(--text-muted); font-size:0.9rem; max-width:400px; line-height:1.4;">${data.inversion.notas}</p>
          </div>
          <div style="text-align:right;">
            <a href="https://cal.com/rocio-cano-seviai" target="_blank" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem; display:inline-block; font-weight:bold; letter-spacing:0.5px;">AGENDAR REUNIÓN DE INICIO</a>
          </div>
        </div>
      `;
    }
  }
}
