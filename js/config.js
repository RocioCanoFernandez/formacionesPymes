const configCliente = {
  "cliente": {
    "nombre": "Empresa Demo S.L.",
    "logo_url": "https://ui-avatars.com/api/?name=Empresa+Demo&background=F2F2F2&color=D80F2C",
    "sector": "Servicios Profesionales"
  },
  "propuesta": {
    "titulo": "Programa de Formación en IA y Automatización",
    "subtitulo": "Adaptado para los equipos operativos y directivos de Empresa Demo S.L.",
    "fecha": "Octubre 2026",
    "nivel": "Multinivel",
    "formato": "Taller Práctico (4 horas)"
  },
  "modulos": [
    {
      "id": "m1",
      "titulo": "Descubre la IA para tu negocio",
      "tipo": "Saber",
      "duracion": "1 hora",
      "descripcion": "Comprender los conceptos básicos de IA, identificar áreas de aplicación y primeros pasos seguros.",
      "puntos_clave": [
        "Qué es la IA y los LLMs",
        "Herramientas de generación",
        "Casos de uso sectoriales",
        "Gobernanza básica"
      ]
    },
    {
      "id": "m2",
      "titulo": "ChatGPT y LLMs: Del cero a la práctica",
      "tipo": "Hacer",
      "duracion": "2 horas",
      "descripcion": "Configuración y prompting eficaz. Creación de asistentes especializados (GPTs).",
      "puntos_clave": [
        "Ingeniería de prompts",
        "Integración con herramientas diarias",
        "Creación de GPTs personalizados"
      ]
    },
    {
      "id": "m3",
      "titulo": "Automatización de Procesos",
      "tipo": "Ser",
      "duracion": "1 hora",
      "descripcion": "Detectar procesos automatizables y estimar ROI de automatizaciones.",
      "puntos_clave": [
        "Introducción a Make / Zapier",
        "Diseño de flujos de trabajo",
        "Medición de impacto y ahorro de tiempo"
      ]
    }
  ],
  "beneficios": [
    "Capacitación adaptada al flujo de trabajo real",
    "Implantación práctica inmediata",
    "Cumplimiento ético y legal (RGPD y Ley Europea de IA)",
    "Soporte continuo de dudas durante 30 días"
  ],
  "inversion": {
    "precio_base": "1.200€",
    "bonificable_fundae": true,
    "notas": "Formación 100% bonificable a través de los créditos de FUNDAE."
  },
  "webhook_n8n": "https://n8n-n8n.npfusf.easypanel.host/webhook/guardar-propuesta"
};
