import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const file1Id = uuidv4();
	const file2Id = uuidv4();
	const file3Id = uuidv4();

	const file1UserId = uuidv4();
	const file2UserId = uuidv4();
	const file3UserId = uuidv4();

	await prisma.file.createMany({
		data: [
			{
				id: file1Id,
				userId: file1UserId,
				status: 'processed',
				videoUrl: 'https://example.com/video1.mp4',
				imagesCompressedUrl: 'https://example.com/images1.zip',
				screenshotsTime: 30,
			},
			{
				id: file2Id,
				userId: file2UserId,
				status: 'processing',
				videoUrl: 'https://example.com/video2.mp4',
				imagesCompressedUrl: 'https://example.com/images2.zip',
				screenshotsTime: 30,
			},
			{
				id: file3Id,
				userId: file3UserId,
				status: 'error',
				videoUrl: 'https://example.com/video3.mp4',
				imagesCompressedUrl: 'https://example.com/images3.zip',
				screenshotsTime: 30,
			},
		],
	});

	await prisma.notification.createMany({
		data: [
			{
				userId: file1UserId,
				fileId: file1Id,
				notificationType: 'success',
				text: 'Arquivo processado com sucesso.',
			},
			{
				userId: file2UserId,
				fileId: file2Id,
				notificationType: 'error',
				text: 'Erro ao processar o arquivo.',
			},
		],
	});

	console.log('Seed data created successfully!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error('Error seeding data:', e);
		await prisma.$disconnect();
		process.exit(1);
	});
