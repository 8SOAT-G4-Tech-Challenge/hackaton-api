import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	// Criando usuários com upsert para evitar duplicação
	const adminUser = await prisma.user.upsert({
		where: { email: 'admin@example.com' },
		update: {},
		create: {
			name: 'Admin User',
			email: 'admin@example.com',
			password: 'password123',
			isAdmin: true,
		},
	});

	const regularUser = await prisma.user.upsert({
		where: { email: 'user@example.com' },
		update: {},
		create: {
			name: 'Regular User',
			email: 'user@example.com',
			password: 'password123',
			isAdmin: false,
		},
	});

	await prisma.file.createMany({
		data: [
			{
				userId: adminUser.id,
				status: 'processed',
				videoUrl: 'https://example.com/video1.mp4',
				imagesCompressedUrl: 'https://example.com/images1.zip',
			},
			{
				userId: adminUser.id,
				status: 'processing',
				videoUrl: 'https://example.com/video2.mp4',
				imagesCompressedUrl: 'https://example.com/images2.zip',
			},
			{
				userId: regularUser.id,
				status: 'error',
				videoUrl: 'https://example.com/video3.mp4',
				imagesCompressedUrl: 'https://example.com/images3.zip',
			},
		],
	});

	console.log('✅ Seed data created successfully!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error('❌ Error seeding data:', e);
		await prisma.$disconnect();
		process.exit(1);
	});
