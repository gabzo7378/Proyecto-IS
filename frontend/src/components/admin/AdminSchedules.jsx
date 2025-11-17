// src/components/admin/AdminSchedules.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    course_offering_id: '',
    day_of_week: [], // allow multiple when creating
    start_time: '',
    end_time: '',
    classroom: ''
  });

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/schedules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSchedules(data);
      else throw new Error(data.message || 'Error al cargar horarios');
    } catch (err) {
      console.error(err);
      setError('Error al cargar los horarios');
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCourses(data);
      else throw new Error(data.message || 'Error al cargar cursos');
    } catch (err) {
      console.error(err);
      setError('Error al cargar los cursos');
    }
  };

  // build a flat list of offerings from courses
  useEffect(() => {
    if (!courses || courses.length === 0) return;
    const offs = [];
    courses.forEach((c) => {
      if (Array.isArray(c.offerings)) {
        c.offerings.forEach((o) => {
          offs.push({
            ...o,
            course_name: c.name,
            course_id: c.id,
          });
        });
      }
    });
    setOfferings(offs);
  }, [courses]);

  useEffect(() => {
    fetchSchedules();
    fetchCourses();
  }, []);

  const handleOpen = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        course_offering_id: schedule.course_offering_id,
        day_of_week: schedule.day_of_week, // single value in edit
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        classroom: schedule.classroom
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        course_offering_id: '',
        day_of_week: [],
        start_time: '',
        end_time: '',
        classroom: ''
      });
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
    setFormData({
      course_offering_id: '',
      day_of_week: [],
      start_time: '',
      end_time: '',
      classroom: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingSchedule) {
        const res = await fetch(`http://localhost:4000/api/schedules/${editingSchedule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            course_offering_id: formData.course_offering_id,
            day_of_week: formData.day_of_week, // single value in edit
            start_time: formData.start_time,
            end_time: formData.end_time,
            classroom: formData.classroom
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error en la operación');
      } else {
        // create one schedule per selected day
        const days = Array.isArray(formData.day_of_week) ? formData.day_of_week : [formData.day_of_week];
        for (const day of days) {
          const res = await fetch('http://localhost:4000/api/schedules', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              course_offering_id: formData.course_offering_id,
              day_of_week: day,
              start_time: formData.start_time,
              end_time: formData.end_time,
              classroom: formData.classroom
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Error en la operación');
        }
      }

      await fetchSchedules();
      handleClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al guardar el horario');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este horario?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/schedules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar');

      fetchSchedules();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al eliminar el horario');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Gestión de Horarios</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Nuevo Horario
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Curso / Oferta</TableCell>
              <TableCell>Día</TableCell>
              <TableCell>Hora Inicio</TableCell>
              <TableCell>Hora Fin</TableCell>
              <TableCell>Aula</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.id}</TableCell>
                <TableCell>
                  {/* backend returns course_name and group_label for each schedule */}
                  {schedule.course_name ? (
                    <>
                      <strong>{schedule.course_name}</strong>
                      {schedule.group_label ? ` — ${schedule.group_label}` : ''}
                      {schedule.cycle_name ? ` (${schedule.cycle_name})` : ''}
                    </>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>{schedule.day_of_week}</TableCell>
                <TableCell>{schedule.start_time}</TableCell>
                <TableCell>{schedule.end_time}</TableCell>
                <TableCell>{schedule.classroom}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(schedule)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(schedule.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={handleClose} fullWidth>
        <DialogTitle>
          {editingSchedule ? 'Editar Horario' : 'Nuevo Horario'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Curso</InputLabel>
              <Select
                value={formData.course_offering_id}
                label="Curso / Oferta"
                onChange={(e) => setFormData({ ...formData, course_offering_id: e.target.value })}
              >
                {offerings.length === 0 && (
                  <MenuItem value="">No hay ofertas disponibles</MenuItem>
                )}
                {offerings.map((off) => (
                  <MenuItem key={off.id} value={off.id}>
                    {off.course_name} {off.group_label ? `- ${off.group_label}` : ''} {off.cycle_name ? `(${off.cycle_name})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{editingSchedule ? 'Día' : 'Días'}</InputLabel>
              <Select
                multiple={!editingSchedule}
                value={formData.day_of_week}
                label={editingSchedule ? 'Día' : 'Días'}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                renderValue={(selected) => Array.isArray(selected) ? selected.join(', ') : selected}
              >
                {DAYS.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Hora de inicio"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Hora de fin"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Aula"
              value={formData.classroom}
              onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSchedule ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSchedules;