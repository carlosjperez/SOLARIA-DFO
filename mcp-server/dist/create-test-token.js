// Create a test JWT token with the local server's secret
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'solaria_jwt_secret_2024';
const payload = {
    userId: 1,
    username: 'carlosjperez',
    role: 'ceo'
};
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
console.log(token);
//# sourceMappingURL=create-test-token.js.map