# Usar Node.js como base
FROM node:16

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de la aplicación
COPY . .

# Instalar dependencias
RUN npm install

# Exponer el puerto que usará la aplicación
EXPOSE 3002

# Ejecutar la aplicación
CMD ["node", "server.js"]
