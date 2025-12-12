'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('specialists', [
      {
        name: 'Dr. Priya Sharma',
        designation: 'Dermatologist',
        image: 'uploads/specialists/priya.jpg',
        clinic_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Dr. Rahul Mehta',
        designation: 'Cosmetic Surgeon',
        image: 'uploads/specialists/rahul.jpg',
        clinic_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Dr. Anjali Rao',
        designation: 'Laser Specialist',
        image: 'uploads/specialists/anjali.jpg',
        clinic_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('specialists', null, {});
  }
};
