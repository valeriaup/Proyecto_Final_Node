const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - Obtener estudiantes
router.get('/estudiantes', (req, res) => {
    const { nombre, apellido, genero, email } = req.query;

    let query = "SELECT * FROM Estudiantes WHERE 1=1";
    let params = [];
    const filtros = { nombre, apellido, genero, email };
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

// GET - Obtener un estudiante por ID
router.get('/estudiantes/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Estudiantes WHERE EstudianteId = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        res.json({ success: true, data: row });
    });
});

// POST - Agregar un nuevo estudiante
router.post('/estudiantes', (req, res) => {
    const { nombre, apellido, genero, email } = req.body;

    if (!nombre || !apellido || !genero || !email) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }
    if (!email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Email inválido' });
}

    db.get("SELECT * FROM Estudiantes WHERE LOWER(email) = LOWER(?)", [email], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (row) return res.status(400).json({ success: false, message: 'Ya existe un estudiante asociado a ese correo electronico' });

        db.run(
            "INSERT INTO Estudiantes (nombre, apellido, genero, email) VALUES (?, ?, ?, ?)",
            [nombre, apellido, genero, email],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.status(201).json({ success: true, data: { id: this.lastID, nombre, apellido, genero, email } });
            }
        );
    });
});

// PUT - Actualizar un estudiante por ID
router.put('/estudiantes/:id', (req, res) => {
    if (isNaN(req.params.id)) {
    return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);
    const { nombre, apellido, genero, email } = req.body;

    if (!nombre || !apellido || !genero || !email) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }
    if (!email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Email inválido' });
    }

    db.get("SELECT * FROM Estudiantes WHERE EstudianteId = ?", [id], (err, estudiante) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!estudiante) return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });

        db.get("SELECT * FROM Estudiantes WHERE LOWER(email) = LOWER(?) AND EstudianteId != ?", [email, id], (err, existente) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (existente) return res.status(400).json({ success: false, message: 'El email ya está en uso' });

            db.run("UPDATE Estudiantes SET nombre = ?, apellido = ?, genero = ?, email = ? WHERE EstudianteId = ?", [nombre, apellido, genero, email, id], function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true, data: 'Estudiante actualizado' });
                    }
                );
            }
        );
    });
});

// DELETE - Eliminar un estudiante por ID
router.delete('/estudiantes/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Estudiantes WHERE EstudianteId = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });

        db.run("DELETE FROM Estudiantes WHERE EstudianteId = ?", [id], function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.status(200).json({ success: true, data: 'El estudiante se ha eliminado correctamente' });
        });
    });
});

module.exports = router;