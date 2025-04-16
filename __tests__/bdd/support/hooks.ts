import axios from 'axios';

import { After, Before } from '@cucumber/cucumber';

import { CustomWorld } from './world';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

Before(async () => {
	if (process.env.TEST_MODE !== 'true') {
		console.warn(
			'⚠️ TEST_MODE não está definido como "true". Os testes podem falhar ao interagir com serviços AWS.',
		);
	}
});

// eslint-disable-next-line func-names
After(async function (this: CustomWorld) {
	if (!this.fileId) return;

	try {
		// Em modo de teste, pular a limpeza
		if (process.env.TEST_MODE === 'true') {
			console.log('[TEST MODE] Skipping cleanup');
			return;
		}

		// Código original de limpeza...
		await axios.delete(`${API_URL}/${this.fileId}`, {
			headers: {
				Authorization: `Bearer ${this.authToken ?? ''}`,
			},
		});
	} catch (error) {
		console.warn(
			`Failed to clean up file ${this.fileId}:`,
			error instanceof Error ? error.message : String(error),
		);
	}

	// Pular limpeza do S3 em modo de teste
	if (process.env.TEST_MODE === 'true') {
		return;
	}

	try {
		// Código original de limpeza do S3...
	} catch (error) {
		console.warn(
			'Failed to clean up S3 object:',
			error instanceof Error ? error.message : String(error),
		);
	}
});
