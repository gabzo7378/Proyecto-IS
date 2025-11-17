// models/enrollmentModel.js
const db = require('../db');

const Enrollment = {
  // items: [{ type: 'course'|'package', id: <offering_id> }]
  async createForStudent(studentId, items) {
    const created = [];

    for (const item of items) {
      const { type, id: offering_id } = item;

      // Regla 1: evitar duplicados exactos
      if (type === 'course') {
        const [dupCourse] = await db.query(
          'SELECT id FROM enrollments WHERE student_id = ? AND course_offering_id = ? AND enrollment_type = ? AND status != ? LIMIT 1',
          [studentId, offering_id, 'course', 'cancelado']
        );
        if (dupCourse.length) {
          throw new Error('El estudiante ya está matriculado en este curso');
        }
      } else if (type === 'package') {
        const [dupPack] = await db.query(
          'SELECT id FROM enrollments WHERE student_id = ? AND package_offering_id = ? AND enrollment_type = ? AND status != ? LIMIT 1',
          [studentId, offering_id, 'package', 'cancelado']
        );
        if (dupPack.length) {
          throw new Error('El estudiante ya está matriculado en este paquete');
        }
      }

      // Obtener contexto necesario
      let cycle_id = null;
      if (type === 'course') {
        const [coCtx] = await db.query('SELECT course_id, cycle_id FROM course_offerings WHERE id = ? LIMIT 1', [offering_id]);
        if (!coCtx.length) throw new Error('Course offering no encontrado');
        cycle_id = coCtx[0].cycle_id;

        // Regla 2: si ya tiene paquete que incluye este course_offering, bloquear
        // Intentar vía tabla de mapeo específica package_offering_courses
        const [pkgCoverExact] = await db.query(
          `SELECT e.id
           FROM enrollments e
           JOIN package_offering_courses poc ON poc.package_offering_id = e.package_offering_id
           WHERE e.student_id = ?
             AND e.enrollment_type = 'package'
             AND e.status != 'cancelado'
             AND poc.course_offering_id = ?
           LIMIT 1`,
          [studentId, offering_id]
        );
        if (pkgCoverExact.length) {
          throw new Error('Ya existe una matrícula de paquete que cubre este curso');
        }
        // Fallback: si no existe la tabla o no hay mapeo, usar lógica por curso/ciclo
        try {
          const [pkgCoverFallback] = await db.query(
            `SELECT e.id
             FROM enrollments e
             JOIN package_offerings po ON e.package_offering_id = po.id
             JOIN packages pk ON po.package_id = pk.id
             JOIN package_courses pc ON pc.package_id = pk.id
             JOIN course_offerings co ON co.id = ?
             WHERE e.student_id = ?
               AND e.enrollment_type = 'package'
               AND e.status != 'cancelado'
               AND po.cycle_id = co.cycle_id
               AND pc.course_id = co.course_id
             LIMIT 1`,
            [offering_id, studentId]
          );
          if (pkgCoverFallback.length) {
            throw new Error('Ya existe una matrícula de paquete que cubre este curso');
          }
        } catch (_) {
          // Ignorar si el fallback falla por esquema diferente
        }
      } else if (type === 'package') {
        const [poCtx] = await db.query('SELECT package_id, cycle_id FROM package_offerings WHERE id = ? LIMIT 1', [offering_id]);
        if (!poCtx.length) throw new Error('Package offering no encontrado');
        const { package_id } = poCtx[0];
        cycle_id = poCtx[0].cycle_id;

        // Regla 3: si ya tiene cursos individuales que están en este paquete (mapeo exacto), bloquear
        const [conflictExact] = await db.query(
          `SELECT e.id
           FROM enrollments e
           JOIN package_offering_courses poc ON poc.course_offering_id = e.course_offering_id
           WHERE e.student_id = ?
             AND e.enrollment_type = 'course'
             AND e.status != 'cancelado'
             AND poc.package_offering_id = ?
           LIMIT 1`,
          [studentId, offering_id]
        );
        if (conflictExact.length) {
          throw new Error('El estudiante ya está matriculado en cursos que pertenecen a este paquete');
        }
        // Fallback por paquete/ciclo si no hay mapeo exacto
        try {
          const [conflictCourses] = await db.query(
            `SELECT e.id
             FROM enrollments e
             JOIN course_offerings co ON e.course_offering_id = co.id
             JOIN package_courses pc ON pc.course_id = co.course_id
             WHERE e.student_id = ?
               AND e.enrollment_type = 'course'
               AND e.status != 'cancelado'
               AND co.cycle_id = ?
               AND pc.package_id = ?
             LIMIT 1`,
            [studentId, cycle_id, package_id]
          );
          if (conflictCourses.length) {
            throw new Error('El estudiante ya está matriculado en cursos que pertenecen a este paquete');
          }
        } catch (_) {
          // Ignorar si el fallback falla
        }
      }

      // insertar enrollment con referencia a course_offering o package_offering
      const course_offering_id = type === 'course' ? offering_id : null;
      const package_offering_id = type === 'package' ? offering_id : null;

      const [res] = await db.query(
        'INSERT INTO enrollments (student_id, course_offering_id, package_offering_id, enrollment_type, status) VALUES (?, ?, ?, ?, ?)',
        [studentId, course_offering_id, package_offering_id, type, 'pendiente']
      );

      const enrollmentId = res.insertId;

      // calcular monto según oferta (usar override si existe)
      let amount = 0;
      if (type === 'course') {
        const [rows] = await db.query(
          `SELECT COALESCE(co.price_override, c.base_price) as price
           FROM course_offerings co
           JOIN courses c ON co.course_id = c.id
           WHERE co.id = ?`,
          [offering_id]
        );
        amount = rows.length ? Number(rows[0].price) : 0;
      } else if (type === 'package') {
        const [rows] = await db.query(
          `SELECT COALESCE(po.price_override, p.base_price) as price
           FROM package_offerings po
           JOIN packages p ON po.package_id = p.id
           WHERE po.id = ?`,
          [offering_id]
        );
        amount = rows.length ? Number(rows[0].price) : 0;
      }

      // crear payment_plan y una cuota (installment) por ahora en una sola cuota
      const [pp] = await db.query(
        'INSERT INTO payment_plans (enrollment_id, total_amount, installments) VALUES (?, ?, ?)',
        [enrollmentId, amount, 1]
      );

      const paymentPlanId = pp.insertId;

      // crear una cuota única con due_date a 7 días
      const [inst] = await db.query(
        'INSERT INTO installments (payment_plan_id, installment_number, amount, due_date, status) VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY), ?) ',
        [paymentPlanId, 1, amount, 'pending']
      );

      created.push({ enrollmentId, type, offering_id, amount, payment_plan_id: paymentPlanId, installment_id: inst.insertId });

      // Si es paquete, crear también matrículas por course_offerings exactos del paquete para que los docentes vean a los alumnos
      if (type === 'package') {
        try {
          // 1) Intentar obtener mapeo exacto: course_offerings vinculados al package_offering
          const [pocRows] = await db.query(
            'SELECT course_offering_id FROM package_offering_courses WHERE package_offering_id = ?',
            [offering_id]
          );

          if (pocRows.length) {
            for (const row of pocRows) {
              const coId = row.course_offering_id;
              const [existsCourseForPkg] = await db.query(
                'SELECT id FROM enrollments WHERE student_id = ? AND course_offering_id = ? AND enrollment_type = ? AND status != ? LIMIT 1',
                [studentId, coId, 'course', 'cancelado']
              );
              if (existsCourseForPkg.length) continue;
              const [resCourse] = await db.query(
                'INSERT INTO enrollments (student_id, course_offering_id, package_offering_id, enrollment_type, status) VALUES (?, ?, ?, ?, ?)',
                [studentId, coId, offering_id, 'course', 'pendiente']
              );
              created.push({ enrollmentId: resCourse.insertId, type: 'course', offering_id: coId });
            }
          } else {
            // 2) Fallback: comportamiento anterior basado en package_courses y ciclo
            const [poRows] = await db.query(
              'SELECT package_id, cycle_id FROM package_offerings WHERE id = ? LIMIT 1',
              [offering_id]
            );
            if (poRows.length) {
              const { package_id, cycle_id } = poRows[0];
              const [pcRows] = await db.query(
                'SELECT course_id FROM package_courses WHERE package_id = ?',
                [package_id]
              );
              for (const pc of pcRows) {
                const courseId = pc.course_id;
                const [coRows] = await db.query(
                  'SELECT id FROM course_offerings WHERE course_id = ? AND cycle_id = ? ORDER BY id ASC LIMIT 1',
                  [courseId, cycle_id]
                );
                if (coRows.length) {
                  const coId = coRows[0].id;
                  const [existsCourseForPkg] = await db.query(
                    'SELECT id FROM enrollments WHERE student_id = ? AND course_offering_id = ? AND enrollment_type = ? AND status != ? LIMIT 1',
                    [studentId, coId, 'course', 'cancelado']
                  );
                  if (existsCourseForPkg.length) continue;
                  const [resCourse] = await db.query(
                    'INSERT INTO enrollments (student_id, course_offering_id, package_offering_id, enrollment_type, status) VALUES (?, ?, ?, ?, ?)',
                    [studentId, coId, offering_id, 'course', 'pendiente']
                  );
                  created.push({ enrollmentId: resCourse.insertId, type: 'course', offering_id: coId });
                }
              }
            }
          }
        } catch (expErr) {
          // No bloquear la creación por fallos en la expansión; registrar y continuar
          console.error('Error expandiendo paquete a cursos:', expErr);
        }
      }
    }

    return created;
  },

  async getByStudent(studentId) {
    // devolver información de la matrícula junto con info del item y estado del payment plan
    const [rows] = await db.query(
      `SELECT e.*,
        COALESCE(c.name, p.name) as item_name,
        COALESCE(COALESCE(co.price_override, c.base_price), COALESCE(po.price_override, p.base_price)) as item_price,
        pp.id as payment_plan_id, pp.total_amount, pp.installments as total_installments,
        COALESCE(cyc.name, cyc2.name) as cycle_name,
        COALESCE(cyc.start_date, cyc2.start_date) as cycle_start_date,
        COALESCE(cyc.end_date, cyc2.end_date) as cycle_end_date
      FROM enrollments e
      LEFT JOIN course_offerings co ON e.course_offering_id = co.id
      LEFT JOIN courses c ON co.course_id = c.id
      LEFT JOIN cycles cyc ON co.cycle_id = cyc.id
      LEFT JOIN package_offerings po ON e.package_offering_id = po.id
      LEFT JOIN packages p ON po.package_id = p.id
      LEFT JOIN cycles cyc2 ON po.cycle_id = cyc2.id
      LEFT JOIN payment_plans pp ON pp.enrollment_id = e.id
      WHERE e.student_id = ?
      ORDER BY e.registered_at DESC`,
      [studentId]
    );

    // Para cada enrollment, obtener sus installments
    for (const enrollment of rows) {
      if (enrollment.payment_plan_id) {
        const [installments] = await db.query(
          'SELECT * FROM installments WHERE payment_plan_id = ? ORDER BY installment_number',
          [enrollment.payment_plan_id]
        );
        enrollment.installments = installments;
      } else {
        enrollment.installments = [];
      }
    }

    return rows;
  }
};

module.exports = Enrollment;
