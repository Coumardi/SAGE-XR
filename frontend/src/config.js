// Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:5000',
  },
  production: {
    apiUrl: 'https://sage-xr-api.example.com',
  },
  test: {
    apiUrl: 'http://localhost:5000',
  }
};

const environment = process.env.NODE_ENV || 'development';
export const apiUrl = config[environment].apiUrl; 