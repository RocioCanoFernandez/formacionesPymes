# Usa una imagen súper ligera y rápida de Nginx (servidor web)
FROM nginx:alpine

# Copia todo el contenido de nuestra carpeta web al directorio público de Nginx
COPY . /usr/share/nginx/html/

# Exponemos el puerto 80 por el que entrará el tráfico de internet
EXPOSE 80

# Comando por defecto para iniciar el servidor en segundo plano
CMD ["nginx", "-g", "daemon off;"]
