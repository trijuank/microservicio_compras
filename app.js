const express = require('express');
const { Pago } = require('./models');  // Asegúrate de que la ruta esté correcta
const app = express();

app.use(express.json());

// Ruta para procesar pagos
app.post('/pago', async (req, res) => {
  const { cantidad, metodo } = req.body;

  try {
    // Aquí iría la lógica de tu servicio de pago (puede incluir interacciones con otros servicios)
    const pago = await Pago.create({ cantidad, metodo, estado: 'Completado' });
    
    res.status(201).json(pago);
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
});

module.exports = app;  // Exportamos para que se use en las pruebas
