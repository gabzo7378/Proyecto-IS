# Resumen de Pruebas del Flujo del Sistema

## Estado Actual

Se han creado los siguientes archivos de prueba:

1. **`tests/flujo-test.js`**: Script de pruebas automatizadas que verifica el flujo completo del sistema
2. **`tests/verificar-setup.js`**: Script para verificar la configuración antes de ejecutar las pruebas
3. **`tests/README.md`**: Documentación sobre cómo ejecutar las pruebas

## Prerequisitos Necesarios

Antes de ejecutar las pruebas, asegúrate de:

### 1. Base de Datos Inicializada

Ejecuta el script SQL del archivo `academia_final.txt` para crear todas las tablas:

```sql
-- Ejecuta el contenido completo de academia_final.txt en MySQL
```

### 2. Vista Admin Creada

Ejecuta el script SQL del archivo `AdminView.txt` para crear la vista del dashboard:

```sql
-- Ejecuta el contenido completo de AdminView.txt en MySQL
```

### 3. Triggers y Eventos

Ejecuta los scripts de `Triggers.txt` y `Scheduller.txt` para crear los triggers y eventos programados.

### 4. Usuario Admin

Crea el usuario administrador:

```bash
npm run create:admin
```

O ejecuta manualmente:

```bash
node scripts/createAdmin.js
```

### 5. Variables de Entorno

Asegúrate de tener un archivo `.env` con:

```
JWT_SECRET=tu_secreto_jwt_aqui
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=academia_final
```

### 6. Servidor Corriendo

Inicia el servidor:

```bash
npm start
```

## Ejecutar las Pruebas

### Paso 1: Verificar Configuración

```bash
npm run test:setup
```

Este comando verifica:
- ✓ Archivo .env y JWT_SECRET
- ✓ Conexión a la base de datos
- ✓ Existencia de todas las tablas
- ✓ Vista admin
- ✓ Usuario admin
- ✓ Dependencias instaladas
- ✓ Servidor corriendo

### Paso 2: Ejecutar Pruebas del Flujo

```bash
npm test
```

O directamente:

```bash
node tests/flujo-test.js
```

## Flujo de Pruebas Implementado

Las pruebas verifican el siguiente flujo:

1. **PASO 0**: Verificar que el servidor esté funcionando
2. **PASO 1**: Admin crea ciclo
3. **PASO 2**: Admin agrega cursos y docentes
4. **PASO 3**: Admin publica ofertas
5. **PASO 4**: Admin define horarios
6. **PASO 5**: Alumno se registra
7. **PASO 6**: Alumno se matricula
8. **PASO 7**: Admin revisa matrículas
9. **PASO 8**: Admin acepta matrícula
10. **PASO 9**: Docente marca asistencias
11. **PASO 10**: Verificar dashboard admin
12. **PASO 11**: Verificar analytics

## Correcciones Realizadas

### 1. Controladores y Modelos
- ✓ `scheduleController.js`: Corregido para usar `course_offering_id`
- ✓ `packageController.js`: Corregido para usar `base_price`
- ✓ `enrollmentController.js`: Mejorada obtención de `studentId`
- ✓ `authController.js`: Agregado soporte para `related_id` en registro
- ✓ `teacherController.js`: Corregida inserción de asistencia
- ✓ `enrollmentModel.js`: Mejorado para obtener todas las cuotas

### 2. Nuevos Archivos
- ✓ `models/cycleModel.js`: Modelo para ciclos
- ✓ `controllers/cycleController.js`: Controlador para ciclos
- ✓ `routes/cycleRoutes.js`: Rutas para ciclos
- ✓ `controllers/adminController.js`: Controlador para dashboard admin
- ✓ `routes/adminRoutes.js`: Rutas para admin
- ✓ `models/paymentModel.js`: Modelo para pagos

### 3. Mejoras de Funcionalidad
- ✓ Endpoint para aceptar/rechazar matrículas
- ✓ Dashboard admin con vista extendida
- ✓ Analytics para admin
- ✓ Notificaciones para admin
- ✓ Sistema de notificaciones mejorado

### 4. Rutas
- ✓ `packageRoutes.js`: Reordenadas rutas para evitar conflictos
- ✓ `studentRoutes.js`: Protegida ruta GET para solo administradores

## Próximos Pasos

1. **Inicializar Base de Datos**: Ejecuta los scripts SQL necesarios
2. **Crear Admin**: Ejecuta `npm run create:admin`
3. **Iniciar Servidor**: Ejecuta `npm start`
4. **Ejecutar Pruebas**: Ejecuta `npm test`

## Notas Importantes

- Las pruebas crean datos de prueba en la base de datos
- Después de las pruebas, puedes limpiar los datos de prueba manualmente
- Las pruebas usan datos específicos (DNIs, nombres, etc.)
- El servidor debe estar corriendo antes de ejecutar las pruebas

## Solución de Problemas

### Error: "Tablas no existen"
- Ejecuta el script SQL de `academia_final.txt`
- Verifica que la base de datos `academia_final` esté creada

### Error: "Vista no existe"
- Ejecuta el script SQL de `AdminView.txt`
- Verifica que todas las tablas estén creadas primero

### Error: "Admin no existe"
- Ejecuta `npm run create:admin`
- O crea el admin manualmente en la base de datos

### Error: "Servidor no responde"
- Verifica que el servidor esté corriendo en `http://localhost:4000`
- Verifica que no haya errores en la consola del servidor
- Verifica que el puerto 4000 no esté en uso por otro proceso

### Error: "JWT_SECRET no configurado"
- Crea un archivo `.env` en el directorio `backend`
- Agrega `JWT_SECRET=tu_secreto_aqui` al archivo `.env`

