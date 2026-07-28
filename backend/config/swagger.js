export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mojilo E-Commerce API',
      version: '1.0.0',
      description: 'API documentation for the Custom T-Shirt Printing Mojilo platform backend',
      contact: {
        name: 'Mojilo Developer Team',
        email: 'dev@mojilo.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Scan routes files for doc decorators
};
