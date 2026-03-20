const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - Obtener cursos
router.get('/cursos', (req, res) => {
    const { nombre, profesorId } = req.query;

    let query = "SELECT * FROM Cursos WHERE 1=1";
    let params = [];
    
    const filtros = { nombre, profesorId };
    Object.entries(filtros).forEach(([key, value]) => {
        if (value) {
            if (key === 'nombre') {query += ` AND nombre LIKE ?`; params.push(`%${value}%`);} 
            else if (key === 'profesorId') {query += ` AND profesorId = ?`; params.push(value);}
        }
    });

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, total: rows.length, data: rows });
    });
});

// GET - Obtener un curso por ID
router.get('/cursos/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Cursos WHERE CursoId = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Curso no encontrado' });
        res.json({ success: true, data: row });
    });
});

// POST - Agregar un nuevo curso
router.post('/cursos', (req, res) => {
    const { nombre, profesorId } = req.body;

    if (!nombre || nombre.trim() === ''|| profesorId === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }
    if (isNaN(profesorId)) {
        return res.status(400).json({ success: false, message: 'El ID del profesor es invalido'})
    }
    const profesorNUM = parseInt(profesorId)
    const nombreLimpio = nombre.trim();

    db.get("SELECT * FROM Cursos WHERE LOWER(nombre) = LOWER(?)", [nombreLimpio], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (row) return res.status(400).json({ success: false, message: 'Ya existe un curso con ese nombre' });

        db.run(
            "INSERT INTO Cursos (nombre, profesorId) VALUES (?, ?)",
            [nombreLimpio, profesorNUM],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.status(201).json({ success: true, data: { id: this.lastID, nombreLimpio, profesorId: profesorNUM } });
            }
        );
    });
});

// PUT - Actualizar un profesor por ID
router.put('/cursos/:id', (req, res) => {
    if (isNaN(req.params.id)) {
    return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);
    const { nombre, profesorId } = req.body;

    if (!nombre || nombre.trim() === '' || profesorId === undefined ) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }
    if (isNaN(profesorId)) {
    return res.status(400).json({ success: false, message: 'El ID del profesor es invalido' });
    }

    const profesorNUM2 = parseInt(profesorId);
    const nombreLimpio = nombre.trim();

    db.get("SELECT * FROM Cursos WHERE CursoId = ?", [id], (err, curso) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!curso) return res.status(404).json({ success: false, message: 'Curso no encontrado' });

        db.get("SELECT * FROM Cursos WHERE LOWER(nombre) = LOWER(?) AND CursoId != ?", [nombreLimpio, id], (err, existente) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (existente) return res.status(400).json({ success: false, message: 'Ya existe un curso con ese nombre' });

            db.run("UPDATE Cursos SET nombre = ?, profesorId = ? WHERE CursoId = ?", [nombreLimpio, profesorNUM2, id], function (err) {
                if (err) return res.status(500).json({ success: false, error: err.message });
                res.json({ success: true, data: 'Curso actualizado' });
                    }
                );
            }
        );
    });
});

// DELETE - Eliminar un curso por ID
router.delete('/cursos/:id', (req, res) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ success: false, message: 'El ID debe ser un número válido' });
    }

    const id = parseInt(req.params.id);

    db.get("SELECT * FROM Cursos WHERE CursoId = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Curso no encontrado' });

        db.run("DELETE FROM Cursos WHERE CursoId = ?", [id], function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.status(200).json({ success: true, data: 'El curso se ha eliminado correctamente' });
        });
    });
});

module.exports = router;