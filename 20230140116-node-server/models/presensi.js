'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Presensi extends Model {
    static associate(models) {
      // ✅ Kunci perbaikan error 500: Mendefinisikan relasi ke model User
      Presensi.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user' // Alias ini harus SAMA dengan yang di presensiController.js
      });
    }
  }

  Presensi.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: false
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Presensi',
  });
  return Presensi;
};