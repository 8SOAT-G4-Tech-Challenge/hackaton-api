import fs from 'fs';
import JSZip from 'jszip';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(__dirname, '../../driven/infra/storage/uploads');
const OUTPUT_DIR = path.join(__dirname, '../../driven/infra/storage/images');

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

export const fileHelper = {
	saveFile: (fileBuffer: Buffer, originalFilename: string): string => {
		const filePath = path.join(TEMP_DIR, `${uuidv4()}-${originalFilename}`);
		fs.writeFileSync(filePath, fileBuffer);
		return filePath;
	},

	createZip: async (imageFiles: string[]): Promise<string> => {
		const zip = new JSZip();
		const zipFilePath = path.join(OUTPUT_DIR, `${uuidv4()}.zip`);

		for (const image of imageFiles) {
			const imagePath = path.join(OUTPUT_DIR, image);
			const imageData = fs.readFileSync(imagePath);
			zip.file(image, imageData);
			fs.unlinkSync(imagePath);
		}

		const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
		fs.writeFileSync(zipFilePath, zipContent);

		return zipFilePath;
	},

	deleteFile: (filePath: string) => {
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	},
};
