// src/components/admin/AdminPaymentsComplete.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { paymentsAPI } from '../../services/api';

const AdminPaymentsComplete = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? null : statusFilter;
      const data = await paymentsAPI.getAll(status);
      setPayments(data);
    } catch (err) {
      console.error('Error cargando pagos:', err);
      alert('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (installmentId) => {
    if (!window.confirm('¿Rechazar este pago?')) return;
    const reason = window.prompt('Ingresa la razón del rechazo (opcional):', 'Voucher ilegible / no coincide el monto / fuera de fecha');
    try {
      await paymentsAPI.rejectInstallment(installmentId, reason || null);
      alert('Pago rechazado');
      loadPayments();
    } catch (err) {
      alert(err.message || 'Error al rechazar pago');
    }
  };

  const handleApprove = async (installmentId) => {
    if (!window.confirm('¿Aprobar este pago?')) return;
    try {
      const res = await paymentsAPI.approveInstallment(installmentId);
      const { cycle_start_date, cycle_end_date } = res || {};
      const datesMsg = (cycle_start_date && cycle_end_date)
        ? `\nCiclo: ${new Date(cycle_start_date).toLocaleDateString()} - ${new Date(cycle_end_date).toLocaleDateString()}`
        : '';
      alert(`Pago aprobado correctamente.${datesMsg}`);
      loadPayments();
    } catch (err) {
      alert(err.message || 'Error al aprobar pago');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'rejected':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencido';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Pagos
      </Typography>

      <Box mb={2}>
        <TextField
          select
          label="Filtrar por estado"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="pending">Pendientes</MenuItem>
          <MenuItem value="paid">Pagados</MenuItem>
          <MenuItem value="overdue">Vencidos</MenuItem>
          <MenuItem value="rejected">Rechazados</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Estudiante</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Curso/Paquete</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Fecha Vencimiento</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Voucher</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.id}</TableCell>
                <TableCell>
                  {payment.first_name} {payment.last_name}
                </TableCell>
                <TableCell>{payment.dni}</TableCell>
                <TableCell>{payment.item_name || '-'}</TableCell>
                <TableCell>S/. {parseFloat(payment.amount || 0).toFixed(2)}</TableCell>
                <TableCell>
                  {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(payment.status_ui || payment.status)}
                    color={getStatusColor(payment.status_ui || payment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {payment.voucher_url ? (
                    <Button
                      size="small"
                      href={`http://localhost:4000${payment.voucher_url}`}
                      target="_blank"
                      startIcon={<VisibilityIcon />}
                    >
                      Ver
                    </Button>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Sin voucher
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {payment.status === 'pending' && (
                    <>
                      {payment.voucher_url && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleApprove(payment.id)}
                          title="Aprobar pago"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleReject(payment.id)}
                        title="Rechazar pago"
                        sx={{ ml: 1 }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </>
                  )}
                  {payment.status === 'overdue' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Vencido" color="error" size="small" />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleReject(payment.id)}
                        title="Rechazar pago"
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {payments.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography color="textSecondary">No hay pagos</Typography>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
};

export default AdminPaymentsComplete;

