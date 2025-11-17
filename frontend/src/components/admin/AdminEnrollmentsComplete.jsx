// src/components/admin/AdminEnrollmentsComplete.jsx
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { enrollmentsAPI } from '../../services/api';

const AdminEnrollmentsComplete = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter] = useState('aceptado');

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await enrollmentsAPI.getAllAdmin();
      setEnrollments(data);
    } catch (err) {
      console.error('Error cargando matrículas:', err);
      alert('Error al cargar matrículas');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (enrollmentId, status) => {
    try {
      await enrollmentsAPI.updateStatus(enrollmentId, status);
      alert(`Matrícula ${status} correctamente`);
      loadEnrollments();
    } catch (err) {
      alert(err.message || 'Error al actualizar estado');
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

  const filteredEnrollments = enrollments.filter(e => e.status === 'aceptado');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Matrículas
      </Typography>

      {/* Vista solo de matrículas aceptadas por pago */}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Estudiante</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Curso/Paquete</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEnrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>{enrollment.id}</TableCell>
                <TableCell>
                  {enrollment.first_name} {enrollment.last_name}
                </TableCell>
                <TableCell>{enrollment.dni}</TableCell>
                <TableCell>{enrollment.item_name || '-'}</TableCell>
                <TableCell>{enrollment.enrollment_type === 'course' ? 'curso' : (enrollment.enrollment_type === 'package' ? 'paquete' : enrollment.enrollment_type)}</TableCell>
                <TableCell>
                  <Chip
                    label={'aceptado'}
                    color={getStatusColor(enrollment.status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredEnrollments.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography color="textSecondary">No hay matrículas</Typography>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
};

export default AdminEnrollmentsComplete;

