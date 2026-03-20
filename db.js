const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error conectando:', err.message);
  } else {
    console.log('Base de datos conectada');
  }
});

db.run(`PRAGMA foreign_key = ON`)

db.run(`CREATE TABLE IF NOT EXISTS Estudiantes(
  estudianteId INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre       TEXT    NOT NULL,
  apellido     TEXT    NOT NULL,
  genero       TEXT    NOT NULL,
  email        TEXT    NOT NULL UNIQUE
  )`);

db.run(`CREATE TABLE IF NOT EXISTS Profesores(
  profesorId INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre       TEXT    NOT NULL,
  apellido     TEXT    NOT NULL,
  especialidad TEXT    NOT NULL,
  email        TEXT    NOT NULL UNIQUE
  )`);

db.run(`CREATE TABLE IF NOT EXISTS Cursos(
  cursoId     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL,
  profesorId  INTEGER NOT NULL,
  FOREIGN KEY (profesorId) REFERENCES Profesores(profesorId)
  )`)

db.run(`CREATE TABLE IF NOT EXISTS Inscripciones(
  inscripcionId INTEGER PRIMARY KEY AUTOINCREMENT,
  estudianteId  INTEGER NOT NULL,
  cursoId       INTEGER NOT NULL,
  FOREIGN KEY   (estudianteId) REFERENCES Estudiantes(estudianteId),
  FOREIGN KEY   (cursoId)      REFERENCES Cursos(cursoId)
  )`)

db.run(`CREATE TABLE IF NOT EXISTS Notas(
  notaId        INTEGER PRIMARY KEY AUTOINCREMENT,
  inscripcionId INTEGER NOT NULL,
  valor         REAL NOT NULL,
  FOREIGN KEY   (inscripcionId) REFERENCES Inscripciones(inscripcionId)
  )`)
  
  module.exports = db;