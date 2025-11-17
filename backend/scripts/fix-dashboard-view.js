// scripts/fix-dashboard-view.js
// Script para corregir la vista del dashboard admin

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixDashboardView() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'TochielVroXd12',
      database: process.env.DB_NAME || 'academia_final',
      multipleStatements: true
    });

    console.log('Corrigiendo vista del dashboard admin...\n');

    // Leer el script SQL
    const sqlPath = path.join(__dirname, '../tests/crear-vista-corregida.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar el script
    await connection.query(sql);

    console.log('✓ Vista corregida exitosamente\n');

    // Verificar que la vista funciona
    console.log('Verificando que la vista funciona...\n');
    try {
      const [rows] = await connection.execute('SELECT * FROM view_dashboard_admin_extended LIMIT 5');
      console.log(`✓ Vista funciona correctamente. Se encontraron ${rows.length} registros.\n`);
      
      if (rows.length > 0) {
        console.log('Ejemplo de datos:');
        console.log(JSON.stringify(rows[0], null, 2));
      }
    } catch (err) {
      console.error('✗ Error al probar la vista:', err.message);
      await connection.end();
      process.exit(1);
    }

    await connection.end();
    console.log('\n✓ Proceso completado exitosamente');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.sqlMessage) {
      console.error('SQL Error:', error.sqlMessage);
    }
    process.exit(1);
  }
}

fixDashboardView();

