const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected for seeding...');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@company.com' });

        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists:');
            console.log(`   Email: admin@company.com`);
            console.log(`   Role: ${existingAdmin.role}`);
        } else {
            const admin = await User.create({
                name: 'System Admin',
                email: 'admin@company.com',
                password: 'admin123',
                role: 'Admin',
            });

            console.log('✅ Default Admin user created:');
            console.log(`   Name: ${admin.name}`);
            console.log(`   Email: admin@company.com`);
            console.log(`   Password: admin123`);
            console.log(`   Role: ${admin.role}`);
        }

        await mongoose.connection.close();
        console.log('\n✅ Seeding complete. MongoDB connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
