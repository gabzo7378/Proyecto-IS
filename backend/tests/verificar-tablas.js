// tests/verificar-tablas.js
// Script para verificar qué tablas existen en la base de datos

const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificarTablas() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'TochielVroXd12',
      database: process.env.DB_NAME || 'academia_final'
    });

    console.log('Tablas existentes en la base de datos:\n');
    
    const [tables] = await connection.execute('SHOW TABLES');
    
    console.log('LISTA DE TABLAS:');
    console.log('================');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });

    console.log(`\nTotal: ${tables.length} tablas\n`);

    // Verificar vistas
    console.log('VISTAS EXISTENTES:');
    console.log('==================');
    try {
      const [views] = await connection.execute('SHOW FULL TABLES WHERE Table_type = "VIEW"');
      if (views.length > 0) {
        views.forEach((view, index) => {
          const viewName = Object.values(view)[0];
          console.log(`${index + 1}. ${viewName}`);
        });
      } else {
        console.log('No se encontraron vistas');
      }
    } catch (err) {
      console.log('Error al obtener vistas:', err.message);
    }

    console.log('\nEVENTOS PROGRAMADOS:');
    console.log('====================');
    try {
      const [events] = await connection.execute('SHOW EVENTS');
      if (events.length > 0) {
        events.forEach((event, index) => {
          console.log(`${index + 1}. ${event.Name}`);
        });
      } else {
        console.log('No se encontraron eventos programados');
      }
    } catch (err) {
      console.log('Error al obtener eventos:', err.message);
    }

    console.log('\nTRIGGERS:');
    console.log('=========');
    try {
      const [triggers] = await connection.execute('SHOW TRIGGERS');
      if (triggers.length > 0) {
        triggers.forEach((trigger, index) => {
          console.log(`${index + 1}. ${trigger.Trigger}`);
        });
      } else {
        console.log('No se encontraron triggers');
      }
    } catch (err) {
      console.log('Error al obtener triggers:', err.message);
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verificarTablas();

