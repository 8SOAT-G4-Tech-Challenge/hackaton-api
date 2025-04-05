export const SwaggerGetNotifications = {
	schema: {
		summary: 'Get all notifications',
		description: 'Returns a list of all notifications stored in the system',
		tags: ['Notification'],
		response: {
			200: {
				description: 'Success - List of notifications retrieved',
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
						fileId: {
							type: 'string',
							format: 'uuid',
						},
						notificationType: {
							type: 'string',
							enum: ['success', 'error'],
						},
                        text: {
							type: 'string',
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
						},
					},
				},
			},
			500: {
				description: 'Unexpected error when retrieving notifications',
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

export const SwaggerGetNotificationById = {
	schema: {
		summary: 'Get notification by ID',
		description: 'Returns a single notification based on the provided ID',
		tags: ['Notification'],
		params: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
					description: 'Unique identifier for the notification',
				},
			},
			required: ['id'],
		},
		response: {
			200: {
				description: 'Success - Notification found',
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
                    fileId: {
                        type: 'string',
                        format: 'uuid',
                    },
                    notificationType: {
                        type: 'string',
                        enum: ['success', 'error'],
                    },
                    text: {
                        type: 'string',
                    },
                    createdAt: {
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
						example: 'Invalid notification ID format',
					},
				},
			},
			404: {
				description: 'Notification not found',
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
						example: 'Notification not found',
					},
				},
			},
			500: {
				description: 'Unexpected error when retrieving notification',
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

export const SwaggerGetNotificationsByUserId = {
	schema: {
		summary: 'Get notifications by user ID',
		description: 'Returns a list of notifications associated with a specific user ID',
		tags: ['Notification'],
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
				description: 'Success - List of notifications retrieved',
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
                        fileId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        notificationType: {
                            type: 'string',
                            enum: ['success', 'error'],
                        },
                        text: {
                            type: 'string',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
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
				description: 'No notifications found for the given user ID',
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
						example: 'No notifications found for this user',
					},
				},
			},
			500: {
				description: 'Unexpected error when retrieving notifications by user ID',
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