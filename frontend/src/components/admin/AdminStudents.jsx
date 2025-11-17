// src/components/admin/AdminStudents.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, MenuItem, Button, Divider } from '@mui/material';
import { coursesAPI, packagesAPI, enrollmentsAPI } from '../../services/api';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [filterType, setFilterType] = useState('course');
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [packageOfferings, setPackageOfferings] = useState([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/students', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOfferingsData = async () => {
    try {
      // Curso: obtener todas las ofertas desde coursesAPI.getAll
      const courses = await coursesAPI.getAll();
      const co = [];
      (courses || []).forEach(c => {
        (c.offerings || []).forEach(o => {
          co.push({
            id: o.id,
            label: `${c.name} - ${o.cycle_name || ''} ${o.group_label ? '(' + o.group_label + ')' : ''}`.trim(),
          });
        });
      });
      setCourseOfferings(co);

      // Paquete: obtener ofertas
      const poRaw = await packagesAPI.getOfferings();
      const po = (poRaw || []).map(o => ({
        id: o.id,
        label: `${o.package_name || ''} - ${o.cycle_name || ''} ${o.group_label ? '(' + o.group_label + ')' : ''}`.trim(),
      }));
      setPackageOfferings(po);
    } catch (err) {
      console.error('Error cargando ofertas', err);
    }
  };

  const applyFilter = async () => {
    try {
      if (!selectedOfferingId) return setFilteredStudents([]);
      const data = await enrollmentsAPI.getByOffering(filterType, selectedOfferingId, 'aceptado');
      setFilteredStudents(data || []);
    } catch (err) {
      console.error('Error filtrando estudiantes', err);
      setFilteredStudents([]);
    }
  };

  useEffect(() => { fetchStudents(); fetchOfferingsData(); }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Estudiantes</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Filtrar matriculados por oferta</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField select label="Tipo" value={filterType} onChange={(e) => { setFilterType(e.target.value); setSelectedOfferingId(''); setFilteredStudents([]); }} size="small">
            <MenuItem value="course">Curso</MenuItem>
            <MenuItem value="package">Paquete</MenuItem>
          </TextField>
          <TextField select label={filterType === 'course' ? 'Oferta de curso' : 'Oferta de paquete'} value={selectedOfferingId} onChange={(e) => setSelectedOfferingId(e.target.value)} size="small" sx={{ minWidth: 320 }}>
            {(filterType === 'course' ? courseOfferings : packageOfferings).map(o => (
              <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={applyFilter}>Aplicar</Button>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Resultados</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>DNI</TableCell>
              <TableCell>Nombre</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map(s => (
              <TableRow key={s.enrollment_id}>
                <TableCell>{s.dni}</TableCell>
                <TableCell>{s.first_name} {s.last_name}</TableCell>
              </TableRow>
            ))}
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center">Sin resultados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Teléfono</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>{s.dni}</TableCell>
                <TableCell>{s.first_name} {s.last_name}</TableCell>
                <TableCell>{s.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AdminStudents;
