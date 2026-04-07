# Despliegue Frontend - Documentación XpertiaPlus

## Configuración
- **URL Frontend:** `https://documentacion.xpertiaplus.com`
- **URL API:** `https://api.documentacion.xpertiaplus.com/api`
- **Framework:** Quasar (Vue 3) + Vite
- **Modo Router:** Hash (no requiere configuraciones especiales de servidor)

## Variables de Entorno

### Desarrollo (`.env.development`)
```env
VITE_API_BASE_URL=/api
```

### Producción (`.env.production`)
```env
VITE_API_BASE_URL=https://api.documentacion.xpertiaplus.com/api
```

## Pasos de Despliegue

### 1. Construcción
```bash
# Instalar dependencias
npm install

# Construir para producción
npm run build
```

### 2. Contenido a Subir
Los archivos generados se encuentran en `dist/spa/`:
- `index.html`
- `assets/`
- `unitepc-logo-clean.png` (recursos estáticos)

### 3. Configuración del Servidor Web
- Subir contenido de `dist/spa/` al directorio raíz del servidor
- Configurar virtual host para `documentacion.xpertiaplus.com`
- Asegurar que todas las rutas redirijan a `index.html` (SPA)
- Configurar SSL/TLS para HTTPS

### 4. Verificación
1. Acceder a `https://documentacion.xpertiaplus.com`
2. Verificar que la aplicación carga correctamente
3. Probar login y conexión con API
4. Verificar que las peticiones API apunten a `https://api.documentacion.xpertiaplus.com/api`

## Configuración de Desarrollo Local
```bash
# Iniciar servidor de desarrollo con proxy
npm run dev

# El proxy redirige /api a https://api.documentacion.xpertiaplus.com
# Evita problemas de CORS en desarrollo
```

## Notas Importantes
- El modo hash del router (`/#/ruta`) funciona sin configuración especial de servidor
- Las variables de entorno se inyectan en tiempo de construcción
- Los cambios en `.env.production` requieren reconstrucción
- Asegurar que el servidor tenga CORS configurado para aceptar peticiones desde `https://documentacion.xpertiaplus.com`