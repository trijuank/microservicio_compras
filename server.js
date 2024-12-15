const express = require('express');
const { Pool } = require('pg');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');  // Asegúrate de tener swagger.json en el directorio
const dotenv = require('dotenv');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3002;

dotenv.config(); // Cargar variables de entorno desde el archivo .env

// Configuración del pool de conexiones
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'pagos_db',
  password: process.env.POSTGRES_PASSWORD || '123456',
  port: 5433
});

// Función para realizar consultas a la base de datos
async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res.rows;
  } catch (err) {
    console.error('Error al ejecutar la consulta:', err);
    throw err;
  }
}

// Middleware
app.use(express.json());
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Configurar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Crear un pago
app.post('/pagos', async (req, res) => {
  const { compraId, monto } = req.body;
  const query = 'INSERT INTO pagos(compra_id, monto, estado) VALUES($1, $2, $3) RETURNING *';
  try {
    const result = await pool.query(query, [compraId, monto, 'pendiente']); // El estado se establece como 'pendiente' por defecto
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el pago' });
  }
});

// Obtener todos los pagos
app.get('/pagos', async (req, res) => {
  const query = 'SELECT * FROM pagos';
  try {
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los pagos' });
  }
});

// Obtener un pago por su ID
app.get('/pagos/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM pagos WHERE id = $1';
  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el pago' });
  }
});

// Procesar un pago
app.post('/pagos/:id/procesar', async (req, res) => {
  const { id } = req.params;
  const checkQuery = 'SELECT estado FROM pagos WHERE id = $1';
  const updateQuery = 'UPDATE pagos SET estado = $1 WHERE id = $2 RETURNING *';

  try {
    // Verificar el estado actual del pago
    const result = await pool.query(checkQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const pago = result.rows[0];

    // Si el pago ya está procesado, no lo procesamos de nuevo
    if (pago.estado === 'procesado') {
      return res.status(400).json({ error: 'El pago ya ha sido procesado' });
    }

    // Procesar el pago
    const processedResult = await pool.query(updateQuery, ['procesado', id]);

    res.status(200).json(processedResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
});

// Iniciar el servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Microservicio de pagos escuchando en puerto ${port}`);
});
