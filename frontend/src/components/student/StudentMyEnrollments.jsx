// src/components/student/StudentMyEnrollments.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { enrollmentsAPI, paymentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const StudentMyEnrollments = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
  const [voucherFile, setVoucherFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadEnrollments();
    }
  }, [user]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await enrollmentsAPI.getAll();
      setEnrollments(data);
    } catch (err) {
      console.error('Error cargando matrículas:', err);
      setError('Error al cargar matrículas');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVoucher = async (installmentId) => {
    if (!voucherFile) {
      setError('Selecciona un archivo');
      return;
    }

    try {
      setError('');
      await paymentsAPI.uploadVoucher(installmentId, voucherFile);
      setSuccess('Voucher subido correctamente');
      setOpenVoucherDialog(false);
      setVoucherFile(null);
      loadEnrollments();
    } catch (err) {
      setError(err.message || 'Error al subir voucher');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aceptado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'rechazado':
        return 'error';
      case 'cancelado':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'aceptado':
        return 'Aceptado';
      case 'pendiente':
        return 'Pendiente';
      case 'rechazado':
        return 'Rechazado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mis Matrículas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {enrollments.map((enrollment) => (
          <Grid item xs={12} md={6} key={enrollment.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h6">{enrollment.item_name || 'Curso/Paquete'}</Typography>
                  <Chip
                    label={getStatusLabel(enrollment.status)}
                    color={getStatusColor(enrollment.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Tipo: {enrollment.enrollment_type}
                </Typography>
                {enrollment.cycle_name && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Ciclo: {enrollment.cycle_name}
                  </Typography>
                )}
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  S/. {parseFloat(enrollment.item_price || 0).toFixed(2)}
                </Typography>

                {/* Cuotas */}
                {enrollment.installments && enrollment.installments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Cuotas:
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Monto</TableCell>
                            <TableCell>Vencimiento</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {enrollment.installments.map((installment) => (
                            <TableRow key={installment.id}>
                              <TableCell>{installment.installment_number}</TableCell>
                              <TableCell>S/. {parseFloat(installment.amount || 0).toFixed(2)}</TableCell>
                              <TableCell>
                                {installment.due_date
                                  ? new Date(installment.due_date).toLocaleDateString()
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    installment.status === 'paid'
                                      ? 'Pagado'
                                      : installment.status === 'overdue'
                                      ? 'Vencido'
                                      : 'Pendiente'
                                  }
                                  color={
                                    installment.status === 'paid'
                                      ? 'success'
                                      : installment.status === 'overdue'
                                      ? 'error'
                                      : 'warning'
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {(installment.status === 'pending' || installment.status === 'overdue') && !installment.voucher_url && (
                                  <Button
                                    size="small"
                                    startIcon={<UploadIcon />}
                                    onClick={() => {
                                      setSelectedEnrollment(installment);
                                      setOpenVoucherDialog(true);
                                    }}
                                  >
                                    Subir Voucher
                                  </Button>
                                )}
                                {installment.voucher_url && (
                                  <Button
                                    size="small"
                                    href={`http://localhost:4000${installment.voucher_url}`}
                                    target="_blank"
                                  >
                                    Ver Voucher
                                  </Button>
                                )}
                                {installment.rejection_reason && (
                                  <Alert severity="error" sx={{ mt: 1 }}>
                                    Rechazado: {installment.rejection_reason}
                                  </Alert>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {enrollments.length === 0 && (
        <Box p={3} textAlign="center">
          <Typography color="textSecondary">No tienes matrículas registradas</Typography>
        </Box>
      )}

      {/* Dialog para subir voucher */}
      <Dialog open={openVoucherDialog} onClose={() => setOpenVoucherDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Voucher de Pago</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {selectedEnrollment && (
              <>
                <Typography variant="body2">
                  Cuota #{selectedEnrollment.installment_number} - S/. {parseFloat(selectedEnrollment.amount || 0).toFixed(2)}
                </Typography>
                <TextField
                  type="file"
                  inputProps={{ accept: 'image/*,.pdf' }}
                  onChange={(e) => setVoucherFile(e.target.files[0])}
                  fullWidth
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVoucherDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => handleUploadVoucher(selectedEnrollment?.id)}
            variant="contained"
            disabled={!voucherFile}
          >
            Subir Voucher
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentMyEnrollments;

