export const SwaggerGetUsers = {
	schema: {
		summary: 'Get users',
		description: 'Returns users data',
		tags: ['User'],
		response: {
			200: {
				description: 'Success get users data',
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							format: 'uuid',
						},
						name: {
							type: 'string',
						},
						email: {
							type: 'string',
							format: 'email',
						},
						password: {
							type: 'string',
						},
						sessionToken: {
							type: 'string',
						},
						isAdmin: {
							type: 'boolean',
						},
						createdAt: {
							type: 'string',
							format: 'datetime',
						},
						updatedAt: {
							type: 'string',
							format: 'datetime',
						},
					},
				},
			},
			500: {
				description: 'Unexpected error when listing for users',
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

export const SwaggerGetUserById = {
	schema: {
		summary: 'Get user by ID',
		description: 'Returns a single user based on the provided ID',
		tags: ['User'],
		params: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
					description: 'User ID',
				},
			},
			required: ['id'],
		},
		response: {
			200: {
				description: 'Success - User found',
				type: 'object',
				properties: {
					id: {
						type: 'string',
						format: 'uuid',
					},
					name: {
						type: 'string',
					},
					email: {
						type: 'string',
						format: 'email',
					},
					sessionToken: {
						type: 'string',
					},
					isAdmin: {
						type: 'boolean',
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
						example: 'Invalid user ID format',
					},
				},
			},
			404: {
				description: 'User not found',
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
						example: 'User not found',
					},
				},
			},
			500: {
				description: 'Unexpected error when retrieving user',
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

export const SwaggerGetUserByEmail = {
	schema: {
		summary: 'Get user by email',
		description: 'Returns a single user based on the provided email',
		tags: ['User'],
		params: {
			type: 'object',
			properties: {
				email: {
					type: 'string',
					format: 'email',
					description: 'User email',
				},
			},
			required: ['email'],
		},
		response: {
			200: {
				description: 'Success - User found',
				type: 'object',
				properties: {
					id: {
						type: 'string',
						format: 'uuid',
					},
					name: {
						type: 'string',
					},
					email: {
						type: 'string',
						format: 'email',
					},
					sessionToken: {
						type: 'string',
					},
					isAdmin: {
						type: 'boolean',
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
				description: 'Invalid email format',
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
						example: 'Invalid email format',
					},
				},
			},
			404: {
				description: 'User not found',
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
						example: 'User not found',
					},
				},
			},
			500: {
				description: 'Unexpected error when retrieving user',
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

export const SwaggerCreateUser = {
	schema: {
		summary: 'Create a new user',
		description: 'Creates a new user and returns the created user data',
		tags: ['User'],
		body: {
			type: 'object',
			required: ['email', 'password', 'isAdmin'],
			properties: {
				email: {
					type: 'string',
					format: 'email',
				},
				password: {
					type: 'string',
				},
				isAdmin: {
					type: 'boolean',
				},
				name: {
					type: 'string',
					nullable: true,
				},
				sessionToken: {
					type: 'string',
					nullable: true,
				},
			},
		},
		response: {
			201: {
				description: 'User created successfully',
				type: 'object',
				properties: {
					id: {
						type: 'string',
						format: 'uuid',
					},
					email: {
						type: 'string',
						format: 'email',
					},
					isAdmin: {
						type: 'boolean',
					},
					name: {
						type: 'string',
						nullable: true,
					},
					sessionToken: {
						type: 'string',
						nullable: true,
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
				description: 'Invalid request data',
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
						example: 'Invalid user data',
					},
				},
			},
			409: {
				description: 'User already exists',
				type: 'object',
				properties: {
					statusCode: {
						type: 'integer',
						example: 409,
					},
					error: {
						type: 'string',
						example: 'Conflict',
					},
					message: {
						type: 'string',
						example: 'User with this email already exists',
					},
				},
			},
			500: {
				description: 'Unexpected error when creating user',
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

export const SwaggerUpdateUser = {
	schema: {
		summary: 'Update user by ID',
		description: 'Updates user data based on the provided ID',
		tags: ['User'],
		params: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
					description: 'User ID',
				},
			},
			required: ['id'],
		},
		body: {
			type: 'object',
			properties: {
				email: {
					type: 'string',
					format: 'email',
					description: 'User email (must be unique)',
				},
				password: {
					type: 'string',
					description: 'User password (hashed internally)',
				},
				isAdmin: {
					type: 'boolean',
					description: 'Flag indicating if the user has admin privileges',
				},
				name: {
					type: 'string',
					nullable: true,
					description: 'Optional user name',
				},
				sessionToken: {
					type: 'string',
					nullable: true,
					description: 'Optional session token for authentication',
				},
			},
		},
		response: {
			200: {
				description: 'User updated successfully',
				type: 'object',
				properties: {
					id: {
						type: 'string',
						format: 'uuid',
					},
					email: {
						type: 'string',
						format: 'email',
					},
					isAdmin: {
						type: 'boolean',
					},
					name: {
						type: 'string',
						nullable: true,
					},
					sessionToken: {
						type: 'string',
						nullable: true,
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
				description: 'Invalid request data',
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
						example: 'Invalid user data',
					},
				},
			},
			404: {
				description: 'User not found',
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
						example: 'User not found',
					},
				},
			},
			500: {
				description: 'Unexpected error when updating user',
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

export const SwaggerDeleteUser = {
	schema: {
		summary: 'Delete user by ID',
		description: 'Deletes a user based on the provided ID',
		tags: ['User'],
		params: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
					description: 'User ID to be deleted',
				},
			},
			required: ['id'],
		},
		response: {
			204: {
				description: 'User deleted successfully (No Content)',
				type: 'null',
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
						example: 'Invalid user ID format',
					},
				},
			},
			404: {
				description: 'User not found',
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
						example: 'User not found',
					},
				},
			},
			500: {
				description: 'Unexpected error when deleting user',
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
