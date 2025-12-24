require('module-alias/register');

const AdminUserData = require('@seeders/AdminUser');
const PageSeederData = require('@seeders/PageSeeder');
const ListingCategorySeederData = require('@seeders/ListingCategorySeeder');

const runSeeders = async () => {
    try {
        console.log("Seeding database...");

        // Call each seeder function in sequence
        // await AdminUserData();
        console.log("Database has been seeded successfully.");
    } catch (error) {
        console.error("Error during seeding:", error);
    }
};

runSeeders();