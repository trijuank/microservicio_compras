const request = require('supertest');
const app = require('./app'); // Asegúrate de que esta ruta apunte correctamente a tu app.js
const { Pago } = require('./models');

// Mock de la función 'create' del modelo Pago
jest.mock('./models', () => {
  return {
    Pago: {
      create: jest.fn()
    }
  };
});

describe('POST /pago', () => {
  it('debería procesar un pago correctamente', async () => {
    // Simulamos que el método 'create' crea un nuevo pago
    Pago.create.mockResolvedValue({ id: 1, cantidad: 100, metodo: 'Tarjeta', estado: 'Completado' });

    const response = await request(app)
      .post('/pago')
      .send({
        cantidad: 100,
        metodo: 'Tarjeta'
      });
      

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 1, cantidad: 100, metodo: 'Tarjeta', estado: 'Completado' });
  });

  it('debería devolver un error si no se puede procesar el pago', async () => {
    // Simulamos un error en la creación del pago
    Pago.create.mockRejectedValue(new Error('Error al procesar el pago'));

    const response = await request(app)
      .post('/pago')
      .send({
        cantidad: 100,
        metodo: 'Tarjeta'
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Error al procesar el pago');
  });
});
