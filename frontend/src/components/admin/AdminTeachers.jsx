// src/components/admin/AdminTeachers.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, RestartAlt as RestartAltIcon } from '@mui/icons-material';
import { teachersAPI } from '../../services/api';

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', dni: '', phone: '', email: '', specialization: '' });

  const fetchTeachers = async () => {
    try {
      const data = await teachersAPI.getAll();
      setTeachers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      await teachersAPI.create(form);
      setOpenDialog(false);
      setForm({ first_name: '', last_name: '', dni: '', phone: '', email: '', specialization: '' });
      await fetchTeachers();
    } catch (err) {
      alert(err.message || 'Error al crear docente');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar docente?')) return;
    try {
      await teachersAPI.delete(id);
      await fetchTeachers();
    } catch (err) {
      alert(err.message || 'Error al eliminar docente');
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm('¿Reiniciar la contraseña del docente a su DNI?')) return;
    try {
      await teachersAPI.resetPassword(id);
      alert('Contraseña restablecida al DNI');
    } catch (err) {
      alert(err.message || 'Error al restablecer contraseña');
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Docentes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>Nuevo Docente</Button>
      </Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Especialidad</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.map(t => (
              <TableRow key={t.id}>
                <TableCell>{t.id}</TableCell>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.dni}</TableCell>
                <TableCell>{t.phone}</TableCell>
                <TableCell>{t.email}</TableCell>
                <TableCell>{t.specialization || '-'}</TableCell>
                <TableCell>
                  <Tooltip title="Reiniciar contraseña a DNI">
                    <IconButton size="small" onClick={() => handleResetPassword(t.id)}>
                      <RestartAltIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Docente</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nombres" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} fullWidth />
            <TextField label="Apellidos" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} fullWidth />
            <TextField label="DNI" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} fullWidth />
            <TextField label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
            <TextField label="Especialidad" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>Crear</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTeachers;
