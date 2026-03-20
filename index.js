require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    const apiKey = req.headers['password'];
    const role = req.headers['x-user-role'];
    if (!apiKey) {return res.status(401).json({ message: 'API key requerida' });}

    // rutas GET
    if (req.method === 'GET') {
        if (apiKey !== process.env.API_PASSWORD_GET) {return res.status(403).json({ message: 'Password incorrecta' });}
        return next();}
    // rutas admin
    if (apiKey !== process.env.API_PASSWORD_ADMIN || role !== 'admin') {return res.status(403).json({ message: 'No autorizado' });}
    next();
});

const estudiantesRoutes = require('./routes/estudiantes');
const profesoresRoutes = require('./routes/profesores');
const cursosRoutes = require('./routes/cursos');

app.use('/Api', estudiantesRoutes)
app.use('/Api', profesoresRoutes)
app.use('/Api', cursosRoutes)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {console.log(`Servidor corriendo en el puerto ${PORT}`);});