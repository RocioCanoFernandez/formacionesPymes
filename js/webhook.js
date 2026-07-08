document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('diagnosticForm');
  const loader = document.getElementById('formLoader');
  const successMsg = document.getElementById('formSuccess');
  
  if(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Obtener URL del webhook desde config
      let webhookUrl = '';
      if (typeof configCliente !== 'undefined') {
        webhookUrl = configCliente.webhook_n8n;
      } else {
        console.error("No se pudo cargar la URL del webhook");
        return;
      }

      // Recopilar datos
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Añadir info de la empresa a la que se le hace la propuesta
      data.cliente_objetivo = document.getElementById('clientName').textContent;
      data.fecha_solicitud = new Date().toISOString();

      // Mostrar cargando
      loader.style.display = 'block';
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if(response.ok) {
          form.style.display = 'none';
          successMsg.style.display = 'block';
        } else {
          alert('Hubo un error al enviar el diagnóstico. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error enviando a n8n:', error);
        // Para modo DEMO si no hay n8n real conectado:
        setTimeout(() => {
          form.style.display = 'none';
          successMsg.style.display = 'block';
          loader.style.display = 'none';
        }, 1500);
      } finally {
        loader.style.display = 'none';
        submitBtn.disabled = false;
      }
    });
  }
});
