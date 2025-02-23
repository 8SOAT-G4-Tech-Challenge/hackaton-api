export const SwaggerHealthCheck = {
	schema: {
		summary: 'Health Check',
		description: 'Returns the health status of the API',
		tags: ['Health'],
		response: {
			200: {
				description: 'API is running successfully',
				type: 'object',
				properties: {
					message: {
						type: 'string',
						example: 'Health Check - Ok',
					},
				},
			},
		},
	},
};
