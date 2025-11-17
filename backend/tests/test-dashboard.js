// tests/test-dashboard.js
// Script para probar el dashboard admin directamente

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDashboard() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'TochielVroXd12',
      database: process.env.DB_NAME || 'academia_final'
    });

    console.log('=== Probando Vista Dashboard ===\n');

    // Test 1: Verificar que la vista existe
    try {
      const [views] = await connection.execute("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
      const vistasExistentes = views.map(v => Object.values(v)[0]);
      
      if (vistasExistentes.includes('view_dashboard_admin_extended')) {
        console.log('✓ Vista view_dashboard_admin_extended existe\n');
      } else {
        console.log('✗ Vista view_dashboard_admin_extended NO existe\n');
        await connection.end();
        return;
      }
    } catch (err) {
      console.error('Error verificando vista:', err.message);
      await connection.end();
      return;
    }

    // Test 2: Probar consulta simple a la vista
    console.log('Test 2: Consulta simple a la vista');
    try {
      const [rows] = await connection.execute('SELECT * FROM view_dashboard_admin_extended LIMIT 1');
      console.log('✓ Consulta simple exitosa');
      console.log('Resultados:', rows.length, 'filas\n');
    } catch (err) {
      console.error('✗ Error en consulta simple:', err.message);
      console.error('Código de error:', err.code);
      console.error('SQL State:', err.sqlState);
      console.error('SQL Message:', err.sqlMessage);
      console.log('');
    }

    // Test 3: Probar consulta con ORDER BY
    console.log('Test 3: Consulta con ORDER BY');
    try {
      const [rows] = await connection.execute('SELECT * FROM view_dashboard_admin_extended ORDER BY student_id DESC LIMIT 10');
      console.log('✓ Consulta con ORDER BY exitosa');
      console.log('Resultados:', rows.length, 'filas');
      if (rows.length > 0) {
        console.log('Primera fila:', Object.keys(rows[0]));
      }
      console.log('');
    } catch (err) {
      console.error('✗ Error en consulta con ORDER BY:', err.message);
      console.error('Código de error:', err.code);
      console.error('SQL State:', err.sqlState);
      console.error('SQL Message:', err.sqlMessage);
      console.log('');
    }

    // Test 4: Verificar estructura de la vista
    console.log('Test 4: Estructura de la vista');
    try {
      const [columns] = await connection.execute('DESCRIBE view_dashboard_admin_extended');
      console.log('✓ Estructura de la vista:');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
      console.log('');
    } catch (err) {
      console.error('✗ Error obteniendo estructura:', err.message);
      console.log('');
    }

    // Test 5: Probar consulta directa (fallback)
    console.log('Test 5: Consulta directa (fallback)');
    try {
      const [rows] = await connection.execute(`
        SELECT 
          s.id AS student_id,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          s.dni,
          s.phone,
          s.parent_name,
          s.parent_phone,
          c.id AS cycle_id,
          c.name AS cycle_name,
          c.start_date,
          c.end_date,
          e.id AS enrollment_id,
          e.enrollment_type,
          e.status AS enrollment_status,
          COALESCE(co.group_label, po.group_label) AS grupo,
          COALESCE(courses.name, packages.name) AS enrolled_item,
          COALESCE(a.attendance_pct, 0) AS attendance_pct,
          COALESCE(a.total_paid, 0) AS total_paid,
          COALESCE(pp.total_amount, 0) - COALESCE(a.total_paid, 0) AS total_pending
        FROM enrollments e
        JOIN students s ON s.id = e.student_id
        LEFT JOIN course_offerings co ON e.course_offering_id = co.id
        LEFT JOIN package_offerings po ON e.package_offering_id = po.id
        LEFT JOIN courses ON courses.id = co.course_id
        LEFT JOIN packages ON packages.id = po.package_id
        LEFT JOIN cycles c ON c.id = COALESCE(co.cycle_id, po.cycle_id)
        LEFT JOIN analytics_summary a ON a.student_id = s.id AND a.cycle_id = c.id
        LEFT JOIN payment_plans pp ON pp.enrollment_id = e.id
        ORDER BY s.id DESC
        LIMIT 10
      `);
      console.log('✓ Consulta directa exitosa');
      console.log('Resultados:', rows.length, 'filas');
      if (rows.length > 0) {
        console.log('Primera fila:', JSON.stringify(rows[0], null, 2));
      }
      console.log('');
    } catch (err) {
      console.error('✗ Error en consulta directa:', err.message);
      console.error('Código de error:', err.code);
      console.error('SQL State:', err.sqlState);
      console.error('SQL Message:', err.sqlMessage);
      console.log('');
    }

    // Test 6: Verificar datos en tablas relacionadas
    console.log('Test 6: Verificar datos en tablas relacionadas');
    try {
      const [enrollments] = await connection.execute('SELECT COUNT(*) as count FROM enrollments');
      const [students] = await connection.execute('SELECT COUNT(*) as count FROM students');
      const [cycles] = await connection.execute('SELECT COUNT(*) as count FROM cycles');
      const [analytics] = await connection.execute('SELECT COUNT(*) as count FROM analytics_summary');
      
      console.log('✓ Datos en tablas:');
      console.log(`  - Enrollments: ${enrollments[0].count}`);
      console.log(`  - Students: ${students[0].count}`);
      console.log(`  - Cycles: ${cycles[0].count}`);
      console.log(`  - Analytics: ${analytics[0].count}`);
      console.log('');
    } catch (err) {
      console.error('✗ Error verificando datos:', err.message);
      console.log('');
    }

    await connection.end();
  } catch (error) {
    console.error('Error fatal:', error.message);
    process.exit(1);
  }
}

testDashboard();

