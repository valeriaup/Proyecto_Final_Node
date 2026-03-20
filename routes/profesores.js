const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - Obtener profesores
router.get('/profesores', (req, res) => {
    const { nombre, apellido, especialidad, email } = req.query;

    let query = "SELECT * FROM Profesores WHERE 1=1";
    let params = [];
    const filtros = { nombre, apellido, especialidad, email };
    Object.entries(filtros).forEach(([key, value]) => {
        if (value) {
            query += ` AND ${key} LIKE ?`;
            params.push(`%${value}%`);
        }
    });

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, total: rows.length, data: rows });
    });
});

// GET - Obtener un profesor por ID
router.get('/profesores/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Profesores WHERE ProfesorId = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
        res.json({ success: true, data: row });
    });
});

// POST - Agregar un nuevo profesor
router.post('/profesores', (req, res) => {
    const { nombre, apellido, especialidad, email } = req.body;

    if (!nombre || !apellido || !especialidad || !email) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }
    if (!email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Email inválido' });
}

    db.get("SELECT * FROM Profesores WHERE LOWER(email) = LOWER(?)", [email], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (row) return res.status(400).json({ success: false, message: 'Ya existe un profesor asociado a ese correo electronico' });

        db.run(
            "INSERT INTO Profesores (nombre, apellido, especialidad, email) VALUES (?, ?, ?, ?)",
            [nombre, apellido, especialidad, email],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.status(201).json({ success: true, data: { id: this.lastID, nombre, apellido, especialidad, email } });
            }
        );
    });
});

// PUT - Actualizar un profesor por ID
router.put('/profesores/:id', (req, res) => {
    if (isNaN(req.params.id)) {
    return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);
    const { nombre, apellido, especialidad, email } = req.body;

    if (!nombre || !apellido || !especialidad || !email) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }
    if (!email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Email inválido' });
    }

    db.get("SELECT * FROM Profesores WHERE ProfesorId = ?", [id], (err, profesor) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!profesor) return res.status(404).json({ success: false, message: 'Profesor no encontrado' });

        db.get("SELECT * FROM Profesores WHERE LOWER(email) = LOWER(?) AND ProfesorId != ?", [email, id], (err, existente) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (existente) return res.status(400).json({ success: false, message: 'El email ya está en uso' });

            db.run("UPDATE Profesores SET nombre = ?, apellido = ?, especialidad = ?, email = ? WHERE ProfesorId = ?", [nombre, apellido, especialidad, email, id], function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true, data: 'Profesor actualizado' });
                    }
                );
            }
        );
    });
});

// DELETE - Eliminar un profesor por ID
router.delete('/profesores/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Profesores WHERE ProfesorId = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Profesor no encontrado' });

        db.run("DELETE FROM Profesores WHERE ProfesorId = ?", [id], function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.status(200).json({ success: true, data: 'El profesor se ha eliminado correctamente' });
        });
    });
});

module.exports = router;