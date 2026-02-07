import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Thương Mại Điện Tử Trang Sức Cao Cấp',
      version: '1.0.0',
      description:
        'API backend hoàn chỉnh cho nền tảng thương mại điện tử trang sức cao cấp với tính năng xác thực, ủy quyền và chức năng quản trị.',
      contact: {
        name: 'Hỗ Trợ API',
        email: 'support@luxuryjewelry.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Máy Chủ Phát Triển',
      },
      {
        url: 'https://api.luxuryjewelry.com',
        description: 'Máy Chủ Sản Xuất',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            addresses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                  isDefault: { type: 'boolean' },
                },
              },
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string' },
            material: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            category: { type: 'string' },
            brand: { type: 'string' },
            stock: { type: 'number' },
            isFeatured: { type: 'boolean' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user: { type: 'string' },
            customerInfo: {
              type: 'object',
              properties: {
                fullName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
              },
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                },
              },
            },
            totalPrice: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'processing', 'shipping', 'completed', 'cancelled'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
