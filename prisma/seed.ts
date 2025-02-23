import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	await Promise.all([
		prisma.user.upsert({
			where: { email: 'admin@example.com' },
			update: {},
			create: {
				name: 'Admin User',
				email: 'admin@example.com',
				password: 'password123',
				isAdmin: true,
			},
		}),
		prisma.user.upsert({
			where: { email: 'user@example.com' },
			update: {},
			create: {
				name: 'Regular User',
				email: 'user@example.com',
				password: 'password123',
				isAdmin: false,
			},
		}),
	]);

	console.log('Seed data created successfully!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
