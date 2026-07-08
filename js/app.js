document.addEventListener('DOMContentLoaded', () => {
  // --- INICIO MAGIA ---
  // Comprobar si hay un "Enlace Mágico" con datos incrustados en la URL
  const hashStr = window.location.hash;
  let magicData = null;
  if(hashStr && hashStr.startsWith('#data=')) {
    try {
      const base64Str = hashStr.replace('#data=', '');
      const decodedStr = decodeURIComponent(atob(base64Str));
      magicData = JSON.parse(decodedStr);
    } catch(e) {
      console.error("Error desencriptando el enlace mágico:", e);
    }
  }

  // Cargar datos dinámicos
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
    configOverride.inversion.precio_base = magicData.precio;
    configOverride.propuesta.subtitulo = magicData.subtitulo || configOverride.propuesta.subtitulo;
    configOverride.propuesta.formato = magicData.formato || configOverride.propuesta.formato;
    
    // Forzar beneficios por si se perdieron
    configOverride.beneficios = [
      "Capacitación adaptada al flujo de trabajo real",
      "Implantación práctica inmediata",
      "Cumplimiento ético y legal (RGPD y Ley Europea de IA)",
      "Soporte continuo de dudas durante 30 días"
    ];

    // Formatear Resumen inicial como el primer módulo (Saber)
    const resumenFormateado = (magicData.resumen || magicData.texto || "").replace(/\n/g, '<br><br>').replace(/- /g, '• ');
    
    configOverride.modulos = [{
      titulo: "Análisis y Plan de Acción",
      tipo: "Saber",
      duracion: "Fase 1",
      descripcion: resumenFormateado,
      puntos_clave: []
    }];

    // Añadir los módulos opcionales (Hacer)
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
    
    populateDashboard(configOverride);
    
    // Limpiamos la URL para que no se vea el chorizo largo arriba (opcional pero estético)
    window.history.replaceState(null, null, ' '); 

  } else if (typeof configCliente !== 'undefined' && document.getElementById('clientName')) {
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

function populateDashboard(data) {
  // Rellenar datos del cliente
  document.getElementById('clientName').textContent = data.cliente.nombre;
  document.getElementById('clientSector').textContent = data.cliente.sector;
  document.getElementById('clientAvatar').src = data.cliente.logo_url;

  // Rellenar Hero de la propuesta
  document.getElementById('heroBadge').textContent = data.propuesta.fecha + " · " + data.propuesta.formato;
  document.getElementById('heroTitle').textContent = data.propuesta.titulo;
  document.getElementById('heroSubtitle').textContent = data.propuesta.subtitulo;

  // Rellenar Módulos
  const modulesContainer = document.getElementById('modulesContainer');
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
          <div style="background:var(--bg-color); border:1px solid #e5e7eb; padding: 2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem; border-radius:4px; margin-bottom:1rem;">
            <div>
              <div class="card-badge" style="background:#1f2937; color:white; margin-bottom:1rem; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">${p.badge || 'BONIFICABLE FUNDAE'}</div>
              <h3 style="font-size: 2.5rem; color:var(--primary); font-family:'Roboto', sans-serif; margin-bottom:0.5rem;">${p.precio}€</h3>
              <p style="color:var(--text-muted); font-size:0.9rem; max-width:400px; line-height:1.4;">
                ${p.desc} <br><br>
                <span style="font-size:0.85rem; opacity:0.8;">Formación bonificable a través de los créditos de FUNDAE hasta un máximo de <strong>${p.fundae}€</strong>.</span>
              </p>
            </div>
            
            <div style="text-align:right;">
              <a href="https://cal.com/rocio-cano-seviai" target="_blank" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem; display:inline-block; font-weight:bold; letter-spacing:0.5px;">AGENDAR REUNIÓN DE INICIO</a>
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
