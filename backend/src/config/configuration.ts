export default () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
      url:
        process.env.MONGODB_URI ||
        process.env.DATABASE_URL ||
        (isProduction ? '' : 'mongodb://localhost:27017/stone-showroom'),
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
    frontend: {
      url:
        process.env.FRONTEND_URL ||
        (isProduction
          ? 'https://pvstone.com.au'
          : 'http://localhost:3000'),
    },
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },
  };
};
