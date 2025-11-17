// tests/verificar-y-corregir-bd.js
// Script para verificar la estructura de la BD y mostrar qué falta

const mysql = require('mysql2/promise');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, type = 'info') {
  const prefix = type === 'success' ? `${colors.green}✓` : 
                 type === 'error' ? `${colors.red}✗` : 
                 type === 'warning' ? `${colors.yellow}⚠` : 
                 `${colors.cyan}ℹ`;
  console.log(`${prefix} ${message}${colors.reset}`);
}

async function verificarEstructura() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'TochielVroXd12',
      database: process.env.DB_NAME || 'academia_final'
    });

    console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}  VERIFICACIÓN DE ESTRUCTURA DE BASE DE DATOS${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`);

    // Tablas requeridas según el diseño
    const tablasRequeridas = [
      'users', 'students', 'teachers', 'cycles', 'courses', 'packages',
      'package_courses', 'course_offerings', 'package_offerings', 
      'schedules', 'enrollments', 'payment_plans', 'installments',
      'attendance', 'notifications_log', 'analytics_summary'
    ];

    // Obtener tablas existentes
    const [tables] = await connection.execute('SHOW TABLES');
    const tablasExistentes = tables.map(t => Object.values(t)[0]);

    log('\nTABLAS REQUERIDAS:', 'info');
    console.log('================\n');

    const tablasFaltantes = [];
    const tablasExtras = [];

    for (const tabla of tablasRequeridas) {
      if (tablasExistentes.includes(tabla)) {
        log(`Tabla ${tabla} existe`, 'success');
      } else {
        log(`Tabla ${tabla} NO existe`, 'error');
        tablasFaltantes.push(tabla);
      }
    }

    // Verificar tablas extra
    for (const tabla of tablasExistentes) {
      if (!tablasRequeridas.includes(tabla)) {
        log(`Tabla ${tabla} existe pero no está en el diseño`, 'warning');
        tablasExtras.push(tabla);
      }
    }

    // Verificar vista
    log('\nVISTAS REQUERIDAS:', 'info');
    console.log('=================\n');
    try {
      const [views] = await connection.execute('SHOW FULL TABLES WHERE Table_type = "VIEW"');
      const vistasExistentes = views.map(v => Object.values(v)[0]);
      
      if (vistasExistentes.includes('view_dashboard_admin_extended')) {
        log('Vista view_dashboard_admin_extended existe', 'success');
      } else {
        log('Vista view_dashboard_admin_extended NO existe', 'error');
        log('Ejecuta el script AdminView.txt para crear la vista', 'warning');
      }
    } catch (err) {
      log('Error al verificar vistas', 'error');
    }

    // Verificar triggers
    log('\nTRIGGERS REQUERIDOS:', 'info');
    console.log('==================\n');
    try {
      const [triggers] = await connection.execute('SHOW TRIGGERS');
      const triggersExistentes = triggers.map(t => t.Trigger);
      
      const triggersRequeridos = [
        'trg_update_attendance_summary',
        'trg_update_payment_summary'
      ];

      for (const trigger of triggersRequeridos) {
        if (triggersExistentes.includes(trigger)) {
          log(`Trigger ${trigger} existe`, 'success');
        } else {
          log(`Trigger ${trigger} NO existe`, 'error');
          log('Ejecuta el script Triggers.txt para crear los triggers', 'warning');
        }
      }
    } catch (err) {
      log('Error al verificar triggers', 'error');
    }

    // Verificar eventos
    log('\nEVENTOS REQUERIDOS:', 'info');
    console.log('=================\n');
    try {
      const [events] = await connection.execute('SHOW EVENTS');
      const eventosExistentes = events.map(e => e.Name);
      
      const eventosRequeridos = [
        'ev_notify_3_absences',
        'ev_notify_overdue_payments',
        'ev_cleanup_notifications'
      ];

      for (const evento of eventosRequeridos) {
        if (eventosExistentes.includes(evento)) {
          log(`Evento ${evento} existe`, 'success');
        } else {
          log(`Evento ${evento} NO existe`, 'error');
          log('Ejecuta el script Scheduller.txt para crear los eventos', 'warning');
        }
      }
    } catch (err) {
      log('Error al verificar eventos', 'error');
    }

    // Resumen
    console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}  RESUMEN${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`);

    if (tablasFaltantes.length > 0) {
      console.log(`${colors.red}Tablas faltantes (${tablasFaltantes.length}):${colors.reset}`);
      tablasFaltantes.forEach(t => console.log(`  - ${t}`));
      console.log(`\n${colors.yellow}Ejecuta el script crear-tablas-faltantes.sql para crear las tablas faltantes${colors.reset}`);
    }

    if (tablasExtras.length > 0) {
      console.log(`\n${colors.yellow}Tablas extra encontradas (${tablasExtras.length}):${colors.reset}`);
      tablasExtras.forEach(t => console.log(`  - ${t}`));
      console.log(`\n${colors.yellow}Considera eliminar estas tablas si no son necesarias${colors.reset}`);
    }

    if (tablasFaltantes.length === 0 && tablasExtras.length === 0) {
      console.log(`${colors.green}✓ Todas las tablas requeridas existen${colors.reset}`);
    }

    await connection.end();
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

verificarEstructura();

