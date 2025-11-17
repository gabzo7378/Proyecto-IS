// src/components/admin/AdminPackages.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { packagesAPI, cyclesAPI, coursesAPI } from '../../services/api';
import { Checkbox, ListItemText } from '@mui/material';
import { MenuItem } from '@mui/material';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [editing, setEditing] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [openPackageDialog, setOpenPackageDialog] = useState(false);
  const [packageForm, setPackageForm] = useState({ name: '', description: '', base_price: '' });
  const [openOfferingDialog, setOpenOfferingDialog] = useState(false);
  const [cycles, setCycles] = useState([]);
  const [offeringForm, setOfferingForm] = useState({ package_id: '', cycle_id: '' });
  const [courses, setCourses] = useState([]);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [assignForm, setAssignForm] = useState({ package_id: '', course_id: '' });
  
  // Manage mapping: package_offering -> course_offerings
  const [openOfferingCoursesDialog, setOpenOfferingCoursesDialog] = useState(false);
  const [selectedPackageOffering, setSelectedPackageOffering] = useState(null);
  const [availableCourseOfferings, setAvailableCourseOfferings] = useState([]);
  const [selectedCourseOfferingIds, setSelectedCourseOfferingIds] = useState([]);
  const [currentOfferingCourses, setCurrentOfferingCourses] = useState([]);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/packages', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setPackages(data);
    } catch (err) { console.error(err); }
  };

  const fetchOfferings = async () => {
    try {
      const data = await packagesAPI.getOfferings();
      setOfferings(data || []);
    } catch (err) {
      console.error('Error fetching package offerings', err);
    }
  };

  const fetchCycles = async () => {
    try {
      const data = await cyclesAPI.getAll();
      setCycles(data || []);
    } catch (err) {
      console.error('Error loading cycles', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(data || []);
    } catch (err) {
      console.error('Error loading courses', err);
    }
  };

  useEffect(() => { fetchPackages(); fetchOfferings(); fetchCycles(); fetchCourses(); }, []);

  const startEdit = (p) => setEditing({ ...p });
  const save = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editing)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setEditing({});
      fetchPackages();
    } catch (err) { console.error(err); }
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar paquete?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/packages/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      fetchPackages();
    } catch (err) { console.error(err); }
  };

  const handleCreatePackage = async () => {
    try {
      const created = await packagesAPI.create(packageForm);
      const newId = created?.id;
      setOpenPackageDialog(false);
      setPackageForm({ name: '', description: '', base_price: '' });
      await fetchPackages();
    } catch (err) {
      console.error('Error creating package', err);
      alert(err.message || 'Error al crear paquete');
    }
  };

  const openAssignForPackage = (pkg) => {
    setAssignForm({ package_id: pkg.id, course_id: '' });
    setOpenAssignDialog(true);
  };

  const handleAssignCourse = async () => {
    try {
      if (!assignForm.package_id || !assignForm.course_id) return alert('Selecciona paquete y curso');
      await packagesAPI.addCourse(assignForm.package_id, assignForm.course_id);
      setOpenAssignDialog(false);
      setAssignForm({ package_id: '', course_id: '' });
      await fetchPackages();
    } catch (err) {
      console.error('Error asignando curso', err);
      alert(err.message || 'Error al asignar curso');
    }
  };

  const handleRemoveCourse = async () => {
    try {
      if (!assignForm.package_id || !assignForm.course_id) return alert('Selecciona paquete y curso');
      await packagesAPI.removeCourse(assignForm.package_id, assignForm.course_id);
      setOpenAssignDialog(false);
      setAssignForm({ package_id: '', course_id: '' });
      await fetchPackages();
    } catch (err) {
      console.error('Error removiendo curso', err);
      alert(err.message || 'Error al remover curso');
    }
  };

  const handleCreateOffering = async () => {
    try {
      // No price_override ni capacity para ofertas de paquetes
      const payload = {
        package_id: offeringForm.package_id,
        cycle_id: offeringForm.cycle_id,
      };
      await packagesAPI.createOffering(payload);
      setOpenOfferingDialog(false);
      setOfferingForm({ package_id: '', cycle_id: '' });
      await fetchOfferings();
    } catch (err) {
      console.error('Error creating package offering', err);
      alert(err.message || 'Error al crear oferta de paquete');
    }
  };

  const handleDeleteOffering = async (id) => {
    if (!confirm('¿Eliminar oferta de paquete?')) return;
    try {
      await packagesAPI.deleteOffering(id);
      await fetchOfferings();
    } catch (err) {
      console.error('Error deleting offering', err);
    }
  };

  const openManageOfferingCourses = async (off) => {
    try {
      setSelectedPackageOffering(off);
      setOpenOfferingCoursesDialog(true);
      // Flatten course offerings filtered by cycle of the package offering
      const cycleId = off.cycle_id;
      const flattened = [];
      for (const c of courses) {
        const offs = Array.isArray(c.offerings) ? c.offerings : [];
        for (const co of offs) {
          if (!cycleId || co.cycle_id === cycleId) {
            flattened.push({
              id: co.id,
              label: `${c.name} · ${co.group_label || 'Grupo'}${co.first_name ? ' · ' + co.first_name + ' ' + co.last_name : ''}`,
            });
          }
        }
      }
      setAvailableCourseOfferings(flattened);
      // Load current mappings
      const mapped = await packagesAPI.getOfferingCourses(off.id).catch(() => []);
      setCurrentOfferingCourses(mapped || []);
      setSelectedCourseOfferingIds((mapped || []).map(m => m.course_offering_id));
    } catch (e) {
      console.error('Error opening manage offering courses', e);
    }
  };

  const saveOfferingCourses = async () => {
    if (!selectedPackageOffering) return;
    try {
      const mappedIds = new Set((currentOfferingCourses || []).map(m => m.course_offering_id));
      // Add new selections
      for (const coId of selectedCourseOfferingIds) {
        if (!mappedIds.has(coId)) {
          await packagesAPI.addOfferingCourse(selectedPackageOffering.id, coId);
        }
      }
      // Remove unselected
      for (const m of currentOfferingCourses) {
        if (!selectedCourseOfferingIds.includes(m.course_offering_id)) {
          await packagesAPI.removeOfferingCourse(selectedPackageOffering.id, m.course_offering_id);
        }
      }
      setOpenOfferingCoursesDialog(false);
      setSelectedPackageOffering(null);
      setSelectedCourseOfferingIds([]);
      setCurrentOfferingCourses([]);
      await fetchOfferings();
    } catch (e) {
      console.error('Error saving offering courses', e);
      alert('Error guardando cursos de la oferta');
    }
  };

  

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Gestión de Paquetes</Typography>
        <Box>
          {tabValue === 0 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenPackageDialog(true)}>
              Nuevo Paquete
            </Button>
          )}
          {tabValue === 1 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenOfferingDialog(true)} sx={{ ml: 1 }}>
              Nueva Oferta
            </Button>
          )}
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="Paquetes" />
        <Tab label="Ofertas" />
      </Tabs>

      {tabValue === 0 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Precio base</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{editing.id === p.id ? (
                    <TextField size="small" type="number" value={editing.base_price} onChange={(e) => setEditing({ ...editing, base_price: e.target.value })} />
                  ) : (`S/. ${p.base_price}`)}</TableCell>
                  <TableCell>{editing.id === p.id ? (
                    <TextField size="small" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                  ) : (p.description || '-')}</TableCell>
                  <TableCell>
                    {editing.id === p.id ? (
                      <>
                        <Button size="small" onClick={() => save(p.id)}>Guardar</Button>
                        <Button size="small" onClick={() => setEditing({})}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Button size="small" onClick={() => startEdit(p)}>Editar</Button>
                        <Button size="small" color="error" onClick={() => remove(p.id)}>Eliminar</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tabValue === 1 && (
        <Box>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Paquete</TableCell>
                  <TableCell>Ciclo</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offerings.map(o => (
                  <TableRow key={o.id}>
                    <TableCell>{o.id}</TableCell>
                    <TableCell>{o.package_name || '-'}</TableCell>
                    <TableCell>{o.cycle_name || '-'}</TableCell>
                    <TableCell>S/. {parseFloat(o.base_price || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => openManageOfferingCourses(o)}>Cursos ofrecidos</Button>
                      <IconButton size="small" color="error" onClick={() => handleDeleteOffering(o.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* Dialog: Crear Paquete */}
      <Dialog open={openPackageDialog} onClose={() => setOpenPackageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Paquete</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nombre" value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} fullWidth />
            <TextField label="Descripción" value={packageForm.description} onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })} fullWidth />
            <TextField label="Precio base" type="number" value={packageForm.base_price} onChange={(e) => setPackageForm({ ...packageForm, base_price: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPackageDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreatePackage}>Crear</Button>
        </DialogActions>
      </Dialog>

      

      {/* Dialog: Asignar/Quitar Cursos a Paquete */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar o Quitar Curso</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select label="Paquete" value={assignForm.package_id} onChange={(e) => setAssignForm({ ...assignForm, package_id: e.target.value })} fullWidth>
              {packages.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Curso" value={assignForm.course_id} onChange={(e) => setAssignForm({ ...assignForm, course_id: e.target.value })} fullWidth>
              {courses.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <Typography variant="body2" color="text.secondary">
              Cursos actuales del paquete seleccionado: {packages.find(p => p.id === assignForm.package_id)?.courses || '-'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cerrar</Button>
          <Button onClick={handleRemoveCourse}>Quitar</Button>
          <Button variant="contained" onClick={handleAssignCourse}>Asignar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Crear Oferta de Paquete */}
      <Dialog open={openOfferingDialog} onClose={() => setOpenOfferingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Oferta de Paquete</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select label="Paquete" value={offeringForm.package_id} onChange={(e) => setOfferingForm({ ...offeringForm, package_id: e.target.value })} fullWidth>
              {packages.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Ciclo" value={offeringForm.cycle_id} onChange={(e) => setOfferingForm({ ...offeringForm, cycle_id: e.target.value })} fullWidth>
              {cycles.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOfferingDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateOffering}>Crear</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Vincular course_offerings a una package_offering */}
      <Dialog open={openOfferingCoursesDialog} onClose={() => setOpenOfferingCoursesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Seleccionar cursos ofrecidos para el paquete</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Paquete: {selectedPackageOffering?.package_name || selectedPackageOffering?.package_id} · Ciclo: {selectedPackageOffering?.cycle_name || selectedPackageOffering?.cycle_id}
          </Typography>
          <TextField
            label="Cursos ofrecidos"
            select
            fullWidth
            SelectProps={{ multiple: true, renderValue: (selected) => `${selected.length} seleccionados` }}
            value={selectedCourseOfferingIds}
            onChange={(e) => setSelectedCourseOfferingIds(typeof e.target.value === 'string' ? e.target.value.split(',').map(Number) : e.target.value)}
            helperText="Selecciona los course_offerings (grupo/docente) que conforman este paquete"
            sx={{ mt: 1 }}
          >
            {availableCourseOfferings.map(opt => (
              <MenuItem key={opt.id} value={opt.id}>
                <Checkbox checked={selectedCourseOfferingIds.indexOf(opt.id) > -1} />
                <ListItemText primary={opt.label} />
              </MenuItem>
            ))}
          </TextField>
          {currentOfferingCourses && currentOfferingCourses.length > 0 && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Actualmente vinculados: {currentOfferingCourses.map(m => m.course_offering_id).join(', ')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOfferingCoursesDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveOfferingCourses}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPackages;
