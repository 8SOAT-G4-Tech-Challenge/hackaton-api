export const SwaggerGetFiles = {
	schema: {
		summary: 'Get all files',
		description: 'Returns a list of all files stored in the system',
		tags: ['File'],
		response: {
			200: {
				description: 'Success - List of files retrieved',
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							format: 'uuid',
						},
						userId: {
							type: 'string',
							format: 'uuid',
						},
						videoUrl: {
							type: 'string',
						},
						imagesCompressedUrl: {
							type: 'string',
							nullable: true,
						},
						status: {
							type: 'string',
							enum: ['initialized', 'processing', 'processed', 'error'],
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
						},
					},
				},
			},
			500: {
				description: 'Unexpected error when retrieving files',
				type: 'object',
				properties: {
					path: {
						type: 'string',
					},
					status: {
						type: 'string',
					},
					message: {
						type: 'string',
					},
					details: {
						type: 'array',
						items: {
							type: 'string',
						},
					},
				},
			},
		},
	},
};

export const SwaggerGetFileById = {
	schema: {
		summary: 'Get file by ID',
		description: 'Returns a single file based on the provided ID',
		tags: ['File'],
		params: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
					description: 'Unique identifier for the file',
				},
			},
			required: ['id'],
		},
		response: {
			200: {
				description: 'Success - File found',
				type: 'object',
				properties: {
					id: {
						type: 'string',
						format: 'uuid',
					},
					userId: {
						type: 'string',
						format: 'uuid',
					},
					videoUrl: {
						type: 'string',
					},
					imagesCompressedUrl: {
						type: 'string',
						nullable: true,
					},
					status: {
						type: 'string',
						enum: ['initialized', 'processing', 'processed', 'error'],
					},
					createdAt: {
						type: 'string',
						format: 'date-time',
					},
					updatedAt: {
						type: 'string',
						format: 'date-time',
					},
				},
			},
			400: {
				description: 'Invalid ID format',
				type: 'object',
				properties: {
					statusCode: {
						type: 'integer',
						example: 400,
					},
					error: {
						type: 'string',
						example: 'Bad Request',
					},
					message: {
						type: 'string',
						example: 'Invalid file ID format',
					},
				},
			},
			404: {
				description: 'File not found',
				type: 'object',
				properties: {
					statusCode: {
						type: 'integer',
						example: 404,
					},
					error: {
						type: 'string',
						example: 'Not Found',
					},
					message: {
						type: 'string',
						example: 'File not found',
					},
				},
			},
			500: {
				description: 'Unexpected error when retrieving file',
				type: 'object',
				properties: {
					path: {
						type: 'string',
					},
					status: {
						type: 'string',
					},
					message: {
						type: 'string',
					},
					details: {
						type: 'array',
						items: {
							type: 'string',
						},
					},
				},
			},
		},
	},
};

export const SwaggerGetFilesByUserId = {
	schema: {
		summary: 'Get files by user ID',
		description: 'Returns a list of files associated with a specific user ID',
		tags: ['File'],
		params: {
			type: 'object',
			properties: {
				userId: {
					type: 'string',
					format: 'uuid',
					description: 'Unique identifier for the user',
				},
			},
			required: ['userId'],
		},
		response: {
			200: {
				description: 'Success - List of files retrieved',
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							format: 'uuid',
							description: 'Unique identifier for the file',
						},
						userId: {
							type: 'string',
							format: 'uuid',
							description: 'ID of the user who uploaded the file',
						},
						videoUrl: {
							type: 'string',
							description: 'URL where the video file is stored',
						},
						imagesCompressedUrl: {
							type: 'string',
							nullable: true,
							description:
								'URL where the compressed images are stored (optional)',
						},
						status: {
							type: 'string',
							enum: ['initialized', 'processing', 'processed', 'error'],
							description: 'Current status of the file processing',
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
							description: 'Timestamp when the file was created',
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
							description: 'Timestamp when the file was last updated',
						},
					},
				},
			},
			400: {
				description: 'Invalid user ID format',
				type: 'object',
				properties: {
					statusCode: {
						type: 'integer',
						example: 400,
					},
					error: {
						type: 'string',
						example: 'Bad Request',
					},
					message: {
						type: 'string',
						example: 'Invalid user ID format',
					},
				},
			},
			404: {
				description: 'No files found for the given user ID',
				type: 'object',
				properties: {
					statusCode: {
						type: 'integer',
						example: 404,
					},
					error: {
						type: 'string',
						example: 'Not Found',
					},
					message: {
						type: 'string',
						example: 'No files found for this user',
					},
				},
			},
			500: {
				description: 'Unexpected error when retrieving files by user ID',
				type: 'object',
				properties: {
					path: {
						type: 'string',
					},
					status: {
						type: 'string',
					},
					message: {
						type: 'string',
					},
					details: {
						type: 'array',
						items: {
							type: 'string',
						},
					},
				},
			},
		},
	},
};