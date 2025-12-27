const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Configuration MySQL via variables d'environnement
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'testdb',
  port: process.env.DB_PORT || 3306
});

// Connexion à MySQL
db.connect((err) => {
  if (err) {
    console.error('Erreur connexion MySQL:', err.message);
    console.log('Tentative de reconnexion dans 5s...');
    setTimeout(() => db.connect(), 5000);
  } else {
    console.log('✅ Connecté à MySQL');
  }
});

// Route principale
app.get('/', (req, res) => {
  db.query('SELECT NOW() as time', (err, result) => {
    if (err) {
      console.error('Erreur MySQL:', err.message);
      res.status(500).send('Erreur de connexion à la base de données');
    } else {
      res.send(`
        <h1>🚀 Application Node.js + MySQL</h1>
        <p><strong>Connexion MySQL OK !</strong></p>
        <p>Heure serveur MySQL: ${result[0].time}</p>
        <p>Host: ${process.env.DB_HOST}</p>
        <p>Base: ${process.env.DB_NAME}</p>
        <hr>
        <p>Pod: ${process.env.HOSTNAME || 'Inconnu'}</p>
      `);
    }
  });
});

// Route santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'node-app', timestamp: new Date() });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur Node.js démarré sur le port ${PORT}`);
});
