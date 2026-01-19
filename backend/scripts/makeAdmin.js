/**
 * Script to promote a user to admin
 * Usage: node scripts/makeAdmin.js <username>
 * Example: node scripts/makeAdmin.js john_doe
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    const username = process.argv[2];

    if (!username) {
      console.error('❌ Error: Please provide a username');
      console.log('Usage: node scripts/makeAdmin.js <username>');
      process.exit(1);
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      console.error(`❌ Error: User "${username}" not found`);
      process.exit(1);
    }

    // Check if already admin
    if (user.userType === 1) {
      console.log(`ℹ️  User "${username}" is already an admin`);
      process.exit(0);
    }

    // Update user to admin
    await prisma.user.update({
      where: { username },
      data: { userType: 1 }
    });

    console.log(`✅ Success! User "${username}" is now an admin`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   UserType: 1 (Admin)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
