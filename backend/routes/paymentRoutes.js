// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const paymentController = require('../controllers/paymentController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Rutas
// Obtener installments (solo admin)
router.get('/', verifyToken, restrictTo('admin'), paymentController.getAll);

// Subir voucher asociado a un installment
router.post('/upload', verifyToken, upload.single('voucher'), paymentController.uploadVoucher);

// Aprobar installment (admin)
router.post('/approve', verifyToken, restrictTo('admin'), paymentController.approveInstallment);

// Rechazar installment (admin)
router.post('/reject', verifyToken, restrictTo('admin'), paymentController.rejectInstallment);

module.exports = router;
