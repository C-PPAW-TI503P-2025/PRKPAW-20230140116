'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hapus kolom nama karena sudah ada relasi ke User
    await queryInterface.removeColumn('Presensis', 'nama');
    
    // Tambah kolom latitude dan longitude
    await queryInterface.addColumn('Presensis', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true, // Boleh null jika user tolak izin lokasi
    });
    
    await queryInterface.addColumn('Presensis', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback: tambahkan kembali kolom nama
    await queryInterface.addColumn('Presensis', 'nama', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    
    // Hapus kolom latitude dan longitude
    await queryInterface.removeColumn('Presensis', 'latitude');
    await queryInterface.removeColumn('Presensis', 'longitude');
  }
};