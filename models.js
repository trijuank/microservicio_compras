// models/pago.js
module.exports = (sequelize, DataTypes) => {
    const Pago = sequelize.define('Pago', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cantidad: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      metodo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });
  
    return Pago;
  };
  