import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	await prisma.notification.deleteMany({});
	await prisma.file.deleteMany({});

	console.log('Database cleaned successfully!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error('Error cleaning database:', e);
		await prisma.$disconnect();
		process.exit(1);
	});
