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
      modulos: [], beneficios: [], inversion: {precio_base: "", notas: "", bonificable_fundae: true}
    };
    
    configOverride.cliente.nombre = magicData.empresa;
    // Generar avatar dinámico con las iniciales de la empresa
    configOverride.cliente.logo_url = "https://ui-avatars.com/api/?name=" + encodeURIComponent(magicData.empresa) + "&background=F2F2F2&color=D80F2C";
    configOverride.inversion.precio_base = magicData.precio;
    
    // Inyectar el texto libre de la IA como un módulo principal
    // Usamos regex para respetar los saltos de línea del texto de la IA
    const textoFormateado = magicData.texto.replace(/\n/g, '<br><br>').replace(/- /g, '• ');
    
    configOverride.modulos = [{
      titulo: "Análisis y Plan de Acción",
      tipo: "Hacer",
      duracion: "A medida",
      descripcion: textoFormateado,
      puntos_clave: []
    }];
    
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
  benefitsContainer.innerHTML = '';
  data.beneficios.forEach(ben => {
    benefitsContainer.insertAdjacentHTML('beforeend', `<li>${ben}</li>`);
  });

  // Rellenar Inversión
  document.getElementById('priceBase').textContent = data.inversion.precio_base;
  document.getElementById('priceNotes').textContent = data.inversion.notas;
  if(data.inversion.bonificable_fundae) {
    document.getElementById('fundaeBadge').style.display = 'inline-block';
  } else {
    document.getElementById('fundaeBadge').style.display = 'none';
  }
}
