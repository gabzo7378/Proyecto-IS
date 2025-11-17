// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

// Rutas protegidas por autenticación
router.use(verifyToken);

// Rutas públicas para cualquier usuario autenticado
router.get('/', teacherController.getAll);
router.get('/:id', teacherController.getOne);

// Rutas solo para administradores
router.post('/', restrictTo('admin'), teacherController.create);
router.put('/:id', restrictTo('admin'), teacherController.update);
router.delete('/:id', restrictTo('admin'), teacherController.delete);

// Resetear contraseña del docente a su DNI
router.post('/:id/reset-password', restrictTo('admin'), teacherController.resetPassword);

// Rutas específicas para profesores
router.get('/:id/students', restrictTo('admin', 'teacher'), teacherController.getStudents);
router.post('/:id/attendance', restrictTo('teacher'), teacherController.markAttendance);

module.exports = router;