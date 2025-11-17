# 🔐 Datos de Prueba para el Sistema de Academia

Este documento contiene las credenciales de los usuarios de prueba para acceder al sistema.

## 📋 Cómo Crear los Usuarios de Prueba

Ejecuta el siguiente comando en la carpeta `backend`:

```bash
node scripts/createTestUsers.js
```

Este script creará automáticamente todos los usuarios de prueba en la base de datos.

---

## 🔑 CREDENCIALES DE ACCESO

### 👨‍💼 ADMINISTRADOR

**Usuario:** `admin`  
**Contraseña:** `admin123`  
**Rol:** Administrador  
**Acceso:** Dashboard administrativo completo

**Funcionalidades:**
- Crear y gestionar ciclos
- Crear y gestionar cursos
- Crear y gestionar paquetes
- Asignar docentes a cursos
- Revisar y aceptar matrículas
- Aprobar pagos
- Ver dashboard con estadísticas
- Gestionar estudiantes y docentes

---

### 👨‍🏫 DOCENTES

#### Docente 1: Juan Pérez
**DNI (Usuario):** `12345678`  
**Contraseña:** `docente123`  
**Especialización:** Matemáticas  
**Email:** juan.perez@academia.edu

#### Docente 2: María García
**DNI (Usuario):** `87654321`  
**Contraseña:** `docente123`  
**Especialización:** Física  
**Email:** maria.garcia@academia.edu

#### Docente 3: Carlos López
**DNI (Usuario):** `11223344`  
**Contraseña:** `docente123`  
**Especialización:** Química  
**Email:** carlos.lopez@academia.edu

**Funcionalidades:**
- Ver estudiantes asignados
- Marcar asistencias
- Ver dashboard personal

---

### 👨‍🎓 ESTUDIANTES

#### Estudiante 1: Ana Martínez
**DNI (Usuario):** `76543210`  
**Contraseña:** `estudiante123`  
**Apoderado:** Pedro Martínez  
**Teléfono Apoderado:** 987654325

#### Estudiante 2: Luis Rodríguez
**DNI (Usuario):** `65432109`  
**Contraseña:** `estudiante123`  
**Apoderado:** Carmen Rodríguez  
**Teléfono Apoderado:** 987654327

#### Estudiante 3: Sofía Fernández
**DNI (Usuario):** `54321098`  
**Contraseña:** `estudiante123`  
**Apoderado:** Miguel Fernández  
**Teléfono Apoderado:** 987654329

#### Estudiante 4: Diego González
**DNI (Usuario):** `43210987`  
**Contraseña:** `estudiante123`  
**Apoderado:** Laura González  
**Teléfono Apoderado:** 987654331

#### Estudiante 5: Valentina Sánchez
**DNI (Usuario):** `32109876`  
**Contraseña:** `estudiante123`  
**Apoderado:** Roberto Sánchez  
**Teléfono Apoderado:** 987654333

**Funcionalidades:**
- Ver cursos disponibles
- Matricularse en cursos o paquetes
- Ver estado de matrículas
- Subir vouchers de pago
- Ver cuotas y pagos

---

## 🚀 Flujo de Prueba Recomendado

### 1. Como Administrador

1. **Inicia sesión** con:
   - Usuario: `admin`
   - Contraseña: `admin123`

2. **Crea un ciclo:**
   - Ve a "Ciclos" → "Nuevo Ciclo"
   - Nombre: "Ciclo 2024-1"
   - Fechas: Inicio y fin del ciclo
   - Estado: "Abierto"

3. **Crea cursos:**
   - Ve a "Cursos" → "Nuevo Curso"
   - Crea cursos como "Matemáticas Básicas", "Física I", etc.

4. **Crea ofertas:**
   - Ve a "Cursos" → Pestaña "Ofertas" → "Nueva Oferta"
   - Asigna cursos a ciclos
   - Asigna docentes a las ofertas
   - Define grupos y precios

5. **Define horarios:**
   - Ve a "Cursos" → Pestaña "Ofertas"
   - Haz clic en el icono de horario para cada oferta
   - Define días y horas de clase

### 2. Como Estudiante

1. **Inicia sesión** con uno de los estudiantes:
   - DNI: `76543210`
   - Contraseña: `estudiante123`

2. **Explora cursos disponibles:**
   - Ve a "Cursos Disponibles"
   - Selecciona cursos o paquetes

3. **Matricúlate:**
   - Selecciona los cursos/paquetes deseados
   - Haz clic en "Matricularme"
   - Confirma la matrícula

4. **Sube voucher de pago:**
   - Ve a "Mis Matrículas"
   - Sube el voucher de pago para cada cuota

### 3. Como Docente

1. **Inicia sesión** con uno de los docentes:
   - DNI: `12345678`
   - Contraseña: `docente123`

2. **Ver estudiantes:**
   - Ve a "Mis Estudiantes"
   - Verás los estudiantes asignados a tus cursos

3. **Marcar asistencias:**
   - Ve a "Marcar Asistencias"
   - Selecciona un horario
   - Marca la asistencia de cada estudiante

### 4. Volver como Administrador

1. **Revisar matrículas:**
   - Ve a "Matrículas"
   - Revisa las matrículas pendientes
   - Acepta o rechaza matrículas

2. **Aprobar pagos:**
   - Ve a "Pagos"
   - Revisa los vouchers subidos
   - Aprueba los pagos verificados

3. **Ver dashboard:**
   - Ve a "Dashboard"
   - Revisa las estadísticas del sistema

---

## 📝 Notas Importantes

1. **Contraseñas:** Todas las contraseñas de prueba son simples para facilitar las pruebas. En producción, usa contraseñas seguras.

2. **DNI como Usuario:** Para estudiantes y docentes, el DNI se usa como nombre de usuario para iniciar sesión.

3. **Usuarios Duplicados:** Si ejecutas el script múltiples veces, los usuarios duplicados se ignorarán (no se crearán nuevamente).

4. **Base de Datos:** Asegúrate de que la base de datos `academia_final` esté creada y configurada correctamente antes de ejecutar el script.

5. **Backend en Ejecución:** El backend debe estar corriendo en `http://localhost:4000` para que el frontend funcione correctamente.

---

## 🛠️ Solución de Problemas

### Error: "Usuario ya existe"
- Esto es normal si ya ejecutaste el script anteriormente.
- Los usuarios duplicados se ignoran automáticamente.

### Error: "No se puede conectar a la base de datos"
- Verifica que MySQL esté corriendo.
- Verifica las credenciales en el archivo `.env`.
- Asegúrate de que la base de datos `academia_final` exista.

### Error: "Usuario no encontrado" al iniciar sesión
- Verifica que el script se ejecutó correctamente.
- Verifica que estás usando el DNI correcto como usuario.
- Verifica que la contraseña sea correcta.

---

## 📞 Soporte

Si tienes problemas para crear los usuarios de prueba, verifica:

1. Que la base de datos esté creada
2. Que las tablas existan (ejecuta el script de creación de tablas)
3. Que las credenciales de MySQL sean correctas en `.env`
4. Que el backend esté configurado correctamente

---

**¡Listo para probar el sistema!** 🎉

