const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/luxury_jewelry',
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
