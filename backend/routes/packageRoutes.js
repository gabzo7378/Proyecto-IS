// routes/packageRoutes.js
const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/', packageController.getAll);

// Rutas de offerings (deben estar antes de /:id para evitar conflictos)
router.get('/offerings', packageController.getOfferings);
router.post('/offerings', verifyToken, restrictTo('admin'), packageController.createOffering);
router.put('/offerings/:id', verifyToken, restrictTo('admin'), packageController.updateOffering);
router.delete('/offerings/:id', verifyToken, restrictTo('admin'), packageController.deleteOffering);
// Mapping: package_offering -> course_offerings
router.get('/offerings/:id/courses', packageController.getOfferingCourses);
router.post('/offerings/:id/courses', verifyToken, restrictTo('admin'), packageController.addOfferingCourse);
router.delete('/offerings/:id/courses/:courseOfferingId', verifyToken, restrictTo('admin'), packageController.removeOfferingCourse);

// Rutas de paquetes individuales
router.get('/:id', packageController.getOne);

// Rutas protegidas por autenticación y rol de administrador
router.post('/', verifyToken, restrictTo('admin'), packageController.create);
router.put('/:id', verifyToken, restrictTo('admin'), packageController.update);
router.delete('/:id', verifyToken, restrictTo('admin'), packageController.delete);
router.post('/:id/courses', verifyToken, restrictTo('admin'), packageController.addCourse);
router.delete('/:id/courses/:courseId', verifyToken, restrictTo('admin'), packageController.removeCourse);

module.exports = router;