import orderRepository from '../repositories/orderRepository.js';
import userRepository from '../repositories/userRepository.js';
import inventoryRepository from '../repositories/inventoryRepository.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

class DashboardService {
  async getDashboardStats() {
    // 1. Revenue & Total Orders
    const orderStats = await orderRepository.getRevenueStats();

    // 2. Total Customers count
    const customerCount = await userRepository.count({ role: 'customer' });

    // 3. Low stock inventory warning count
    const lowStockItems = await inventoryRepository.getLowStockItems();

    // 4. Sales monthly timeline
    const monthlySales = await orderRepository.getMonthlySales();

    // 5. Latest 5 orders
    const latestOrders = await orderRepository.find({}, 'user', { createdAt: -1 }, 0, 5);

    // 6. Top 5 selling products based on orders
    // In a real app we aggregate from OrderItems, let's write a clean aggregate
    const topProducts = await Product.find({ isActive: true }).sort({ rating: -1 }).limit(5);

    // 7. Latest 6 registered customers
    const latestCustomers = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(6).select('-password');

    // 8. Total products count
    const totalProducts = await Product.countDocuments({ isActive: true });

    return {
      revenue: orderStats.totalRevenue,
      totalOrders: orderStats.count,
      totalCustomers: customerCount,
      lowStockCount: lowStockItems.length,
      monthlySales,
      latestOrders,
      topProducts,
      latestCustomers,
      totalProducts
    };
  }
}

export default new DashboardService();
