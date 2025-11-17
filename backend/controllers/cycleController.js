// controllers/cycleController.js
const Cycle = require('../models/cycleModel');

function isValidDate(value) {
  if (value === undefined) return true;
  if (value === null || value === '') return false;
  const d = new Date(value);
  return !isNaN(d);
}

exports.create = async (req, res) => {
  try {
    const cycleData = req.body;
    if (!isValidDate(cycleData.start_date) || !isValidDate(cycleData.end_date)) {
      return res.status(400).json({ message: 'Fechas inválidas: start_date y/o end_date' });
    }
    if (cycleData.start_date && cycleData.end_date) {
      const sd = new Date(cycleData.start_date);
      const ed = new Date(cycleData.end_date);
      if (sd > ed) {
        return res.status(400).json({ message: 'start_date no puede ser mayor que end_date' });
      }
    }
    const result = await Cycle.create(cycleData);
    res.status(201).json({ message: 'Ciclo creado correctamente', id: result.id });
  } catch (err) {
    console.error('Error al crear ciclo:', err);
    res.status(500).json({ message: 'Error al crear el ciclo' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const cycles = await Cycle.getAll();
    res.json(cycles);
  } catch (err) {
    console.error('Error al obtener ciclos:', err);
    res.status(500).json({ message: 'Error al obtener los ciclos' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const cycle = await Cycle.getOne(req.params.id);
    if (!cycle) return res.status(404).json({ message: 'Ciclo no encontrado' });
    res.json(cycle);
  } catch (err) {
    console.error('Error al obtener ciclo:', err);
    res.status(500).json({ message: 'Error al obtener el ciclo' });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    if (!isValidDate(data.start_date) || !isValidDate(data.end_date)) {
      return res.status(400).json({ message: 'Fechas inválidas: start_date y/o end_date' });
    }
    if (data.start_date && data.end_date) {
      const sd = new Date(data.start_date);
      const ed = new Date(data.end_date);
      if (sd > ed) {
        return res.status(400).json({ message: 'start_date no puede ser mayor que end_date' });
      }
    }
    await Cycle.update(id, data);
    res.json({ message: 'Ciclo actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar ciclo:', err);
    res.status(500).json({ message: 'Error al actualizar el ciclo' });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Cycle.delete(id);
    res.json({ message: 'Ciclo eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar ciclo:', err);
    res.status(500).json({ message: 'Error al eliminar el ciclo' });
  }
};

exports.getActive = async (req, res) => {
  try {
    const cycles = await Cycle.getActive();
    res.json(cycles);
  } catch (err) {
    console.error('Error al obtener ciclos activos:', err);
    res.status(500).json({ message: 'Error al obtener los ciclos activos' });
  }
};
