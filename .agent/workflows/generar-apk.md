---
description: Guía paso a paso para generar el archivo APK de la aplicación móvil (Android)
---

Para generar el APK de la aplicación utilizando Quasar y Capacitor, sigue estos pasos:

### 1. Requisitos Previos
Asegúrate de tener instalado:
- **Android Studio**: Descarga la última versión estable (Ladybug o posterior) desde [developer.android.com/studio](https://developer.android.com/studio). 
  - *Mínimo requerido por Capacitor 6: Android Studio Hedgehog (2023.1.1)*.
- **Android SDK**: Se instala automáticamente con Android Studio. Asegúrate de configurar la **API 34** (Android 14) o superior.
- **Java JDK 17**: Android Studio ya incluye su propia versión de Java (jbr), por lo que normalmente no necesitas instalarla aparte.

### 2. Preparar el Entorno
Si es la primera vez que vas a compilar para Android, asegúrate de que Capacitor reconozca tu entorno:
```powershell
npx cap add android
```
*(Este paso ya se realizó parcialmente al agregar el modo capacitor, pero es bueno recordarlo si el proyecto es nuevo en otro equipo).*

### 3. Compilar la Aplicación (Quasar)
Ejecuta el comando de construcción de Quasar para el modo Capacitor con destino Android:
```powershell
quasar build -m capacitor -T android
```
> [!NOTE]
> Este comando compilará el frontend de Vue, lo copiará a la carpeta `src-capacitor` y abrirá automáticamente **Android Studio**.

### 4. Generar el APK en Android Studio
Una vez que Android Studio abra el proyecto:
1. Espera a que termine la sincronización de Gradle (barra de progreso en la parte inferior).
2. Ve al menú superior: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Android Studio comenzará a compilar. Al finalizar, aparecerá un globo de notificación en la esquina inferior derecha con un enlace que dice **"locate"**.
4. Haz clic en **"locate"** para abrir la carpeta donde se encuentra tu archivo `app-debug.apk`.

### 5. Generar APK para Producción (Firmado)
Si deseas generar un APK listo para publicar o distribuir oficialmente:
1. En Android Studio: **Build** > **Generate Signed Bundle / APK...**
2. Selecciona **APK**.
3. Sigue los pasos para crear o seleccionar tu almacén de claves (KeyStore).
4. Selecciona el tipo de construcción **release**.

### Comandos Útiles
- **Sincronizar cambios**: Si haces cambios solo en el código de Vue y quieres verlos en Android sin reconstruir todo:
  ```powershell
  quasar build -m capacitor -T android
  ```
  O manualmente:
  ```powershell
  npx cap sync android
  ```
- **Abrir Android Studio manualmente**:
  ```powershell
  npx cap open android
  ```
