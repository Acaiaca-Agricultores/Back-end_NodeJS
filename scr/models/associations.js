import User from './User.js';
import Product from './Product.js';

// Definir associações
User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId' });

export { User, Product }; 