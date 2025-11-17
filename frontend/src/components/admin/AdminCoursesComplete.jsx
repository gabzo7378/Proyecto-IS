// src/components/admin/AdminCoursesComplete.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { MenuItem } from '@mui/material';
import { coursesAPI, cyclesAPI, teachersAPI } from '../../services/api';

const AdminCoursesComplete = () => {
  const [courses, setCourses] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [openOfferingDialog, setOpenOfferingDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [openEditOfferingDialog, setOpenEditOfferingDialog] = useState(false);
  const [editOfferingForm, setEditOfferingForm] = useState({ cycle_id: '', group_label: '', teacher_id: '', capacity: '' });
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    base_price: '',
  });
  const [offeringForm, setOfferingForm] = useState({
    course_id: '',
    cycle_id: '',
    group_label: '',
    teacher_id: '',
    capacity: '',
  });
  // schedule management moved to AdminSchedules

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, cyclesData, teachersData] = await Promise.all([
        coursesAPI.getAll(),
        cyclesAPI.getAll(),
        teachersAPI.getAll(),
      ]);
      setCourses(coursesData);
      setCycles(cyclesData);
      setTeachers(teachersData);
      
      // Las ofertas vienen en los cursos, extraerlas
      const offeringsList = [];
      for (const course of coursesData) {
        if (course.offerings && course.offerings.length > 0) {
          for (const offering of course.offerings) {
            offeringsList.push({
              ...offering,
              course_name: course.name,
              base_price: course.base_price,
            });
          }
        }
      }
      setOfferings(offeringsList);
    } catch (err) {
      console.error('Error cargando datos:', err);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      await coursesAPI.create(courseForm);
      setOpenCourseDialog(false);
      setCourseForm({ name: '', description: '', base_price: '' });
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al crear curso');
    }
  };

  const handleCreateOffering = async () => {
    try {
      await coursesAPI.createOffering({
        course_id: offeringForm.course_id,
        cycle_id: offeringForm.cycle_id,
        group_label: offeringForm.group_label || null,
        teacher_id: offeringForm.teacher_id || null,
        capacity: offeringForm.capacity || null,
      });
      setOpenOfferingDialog(false);
      setOfferingForm({
        course_id: '',
        cycle_id: '',
        group_label: '',
        teacher_id: '',
        capacity: '',
      });
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al crear oferta');
    }
  };

  // schedule creation removed from this page

  const openEditOffering = (offering) => {
    setSelectedOffering(offering);
    setEditOfferingForm({
      cycle_id: offering.cycle_id || '',
      group_label: offering.group_label || '',
      teacher_id: offering.teacher_id || '',
      capacity: offering.capacity || '',
    });
    setOpenEditOfferingDialog(true);
  };

  const handleUpdateOffering = async () => {
    try {
      if (!selectedOffering) return;
      await coursesAPI.updateOffering(selectedOffering.id, {
        cycle_id: editOfferingForm.cycle_id || null,
        group_label: editOfferingForm.group_label || null,
        teacher_id: editOfferingForm.teacher_id || null,
        capacity: editOfferingForm.capacity || null,
      });
      setOpenEditOfferingDialog(false);
      setSelectedOffering(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al actualizar oferta');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este curso?')) return;
    try {
      await coursesAPI.delete(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al eliminar curso');
    }
  };

  const handleDeleteOffering = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta oferta?')) return;
    try {
      await coursesAPI.deleteOffering(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al eliminar oferta');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Cursos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCourseDialog(true)}
        >
          Nuevo Curso
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Cursos" />
        <Tab label="Ofertas" />
      </Tabs>

      {/* Tab de Cursos */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Precio Base</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.id}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.description || '-'}</TableCell>
                  <TableCell>S/. {parseFloat(course.base_price || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab de Ofertas */}
      {tabValue === 1 && (
        <Box>
          <Box mb={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenOfferingDialog(true)}
            >
              Nueva Oferta
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Curso</TableCell>
                  <TableCell>Ciclo</TableCell>
                  <TableCell>Grupo</TableCell>
                  <TableCell>Docente</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Capacidad</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offerings.map((offering) => (
                  <TableRow key={offering.id}>
                    <TableCell>{offering.id}</TableCell>
                    <TableCell>{offering.course_name || '-'}</TableCell>
                    <TableCell>{offering.cycle_name || '-'}</TableCell>
                    <TableCell>{offering.group_label || '-'}</TableCell>
                    <TableCell>
                      {offering.first_name && offering.last_name
                        ? `${offering.first_name} ${offering.last_name}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      S/. {parseFloat(offering.base_price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{offering.capacity || '-'}</TableCell>
                    <TableCell>
                      {/* Horarios se gestionan en la pestaña de Horarios */}
                      <IconButton size="small" onClick={() => openEditOffering(offering)} title="Editar oferta">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteOffering(offering.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Dialog Crear Curso */}
      <Dialog open={openCourseDialog} onClose={() => setOpenCourseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Curso</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={3}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            />
            <TextField
              label="Precio Base"
              type="number"
              fullWidth
              value={courseForm.base_price}
              onChange={(e) => setCourseForm({ ...courseForm, base_price: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCourseDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateCourse} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Crear Oferta */}
      <Dialog open={openOfferingDialog} onClose={() => setOpenOfferingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Oferta de Curso</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Curso"
              select
              fullWidth
              value={offeringForm.course_id}
              onChange={(e) => setOfferingForm({ ...offeringForm, course_id: e.target.value })}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Ciclo"
              select
              fullWidth
              value={offeringForm.cycle_id}
              onChange={(e) => setOfferingForm({ ...offeringForm, cycle_id: e.target.value })}
            >
              {cycles.map((cycle) => (
                <MenuItem key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Grupo"
              fullWidth
              value={offeringForm.group_label}
              onChange={(e) => setOfferingForm({ ...offeringForm, group_label: e.target.value })}
            />
            <TextField
              label="Docente"
              select
              fullWidth
              value={offeringForm.teacher_id}
              onChange={(e) => setOfferingForm({ ...offeringForm, teacher_id: e.target.value })}
            >
              <MenuItem value="">Sin asignar</MenuItem>
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name}
                </MenuItem>
              ))}
            </TextField>
            {/* Sin precio de oferta: se usa el precio base del curso */}
            <TextField
              label="Capacidad"
              type="number"
              fullWidth
              value={offeringForm.capacity}
              onChange={(e) => setOfferingForm({ ...offeringForm, capacity: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOfferingDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateOffering} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Horarios: gestione en Admin > Horarios */}

      {/* Dialogo: Editar oferta de curso */}
      <Dialog open={openEditOfferingDialog} onClose={() => setOpenEditOfferingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar oferta de curso</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select label="Ciclo" value={editOfferingForm.cycle_id}
              onChange={(e) => setEditOfferingForm({ ...editOfferingForm, cycle_id: e.target.value })} fullWidth>
              {cycles.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Grupo" value={editOfferingForm.group_label}
              onChange={(e) => setEditOfferingForm({ ...editOfferingForm, group_label: e.target.value })} fullWidth />
            <TextField select label="Docente" value={editOfferingForm.teacher_id}
              onChange={(e) => setEditOfferingForm({ ...editOfferingForm, teacher_id: e.target.value })} fullWidth>
              {teachers.map(t => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Capacidad" type="number" value={editOfferingForm.capacity}
              onChange={(e) => setEditOfferingForm({ ...editOfferingForm, capacity: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditOfferingDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateOffering}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCoursesComplete;

