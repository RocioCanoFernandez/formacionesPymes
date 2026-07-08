document.addEventListener('DOMContentLoaded', () => {
  // Cargar datos dinámicos desde configCliente solo si estamos en la plantilla de propuesta
  if (typeof configCliente !== 'undefined' && document.getElementById('clientName')) {
    populateDashboard(configCliente);
  } else if (!document.getElementById('clientName')) {
    console.log('Modo catálogo: No se requiere config.js para poblar datos.');
  } else {
    console.error('No se ha encontrado la configuración del cliente.');
  }

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
