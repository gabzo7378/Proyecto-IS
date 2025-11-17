// routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Rutas protegidas solo para administradores
router.post('/', restrictTo('admin'), scheduleController.create);
router.put('/:id', restrictTo('admin'), scheduleController.update);
router.delete('/:id', restrictTo('admin'), scheduleController.delete);

// Rutas accesibles para todos los usuarios autenticados
router.get('/offering/:courseOfferingId', scheduleController.getByCourseOffering);
router.get('/package-offering/:packageOfferingId', scheduleController.getByPackageOffering);

// Obtener todos los horarios (admin)
router.get('/', restrictTo('admin'), scheduleController.getAll);

module.exports = router;