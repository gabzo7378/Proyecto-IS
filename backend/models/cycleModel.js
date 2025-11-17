// models/cycleModel.js
const db = require('../db');

function formatDateForMySQL(value) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0, 10);
}

const Cycle = {
  async create(data) {
    const { name, start_date, end_date, duration_months, status } = data;
    const sql = `
      INSERT INTO cycles (name, start_date, end_date, duration_months, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      name,
      formatDateForMySQL(start_date),
      formatDateForMySQL(end_date),
      duration_months || null,
      status || 'open'
    ]);
    return { id: result.insertId };
  },

  async getAll() {
    const [rows] = await db.query('SELECT * FROM cycles ORDER BY id DESC');
    return rows;
  },

  async getOne(id) {
    const [rows] = await db.query('SELECT * FROM cycles WHERE id = ?', [id]);
    return rows[0];
  },

  async update(id, data) {
    const { name, start_date, end_date, duration_months, status } = data;
    const sql = `
      UPDATE cycles 
      SET name = ?, start_date = ?, end_date = ?, duration_months = ?, status = ?
      WHERE id = ?
    `;
    await db.query(sql, [
      name,
      formatDateForMySQL(start_date),
      formatDateForMySQL(end_date),
      duration_months || null,
      status || 'open',
      id
    ]);
    return true;
  },

  async delete(id) {
    await db.query('DELETE FROM cycles WHERE id = ?', [id]);
    return true;
  },

  async getActive() {
    const [rows] = await db.query(
      "SELECT * FROM cycles WHERE status = 'open' OR status = 'in_progress' ORDER BY id DESC"
    );
    return rows;
  }
};

module.exports = Cycle;
