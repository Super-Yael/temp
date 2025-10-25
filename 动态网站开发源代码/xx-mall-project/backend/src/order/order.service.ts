import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CartItem } from '../cart/cart.entity';

const ORDER_STATUS_OPTIONS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: '全部订单' },
  { value: 'pending_payment', label: '待支付' },
  { value: 'awaiting_shipment', label: '待发货' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

@Injectable()
export class OrderService {
  private readonly autoCancelMinutes = 30;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    private readonly dataSource: DataSource,
  ) {}

  getStatusOptions(): Array<{ value: OrderStatus | 'all'; label: string }> {
    return ORDER_STATUS_OPTIONS;
  }

  async findOrdersByUser(
    userId: number,
    status?: OrderStatus | 'all',
  ): Promise<Order[]> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('无效的用户编号');
    }

    await this.cancelExpiredOrdersForUser(userId);

    const where: Record<string, unknown> = { user: { id: userId } };
    if (status && status !== 'all') {
      this.assertValidStatus(status);
      where.status = status;
    }

    return this.orderRepository.find({
      where,
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async countOrdersByUser(
    userId: number,
    status?: OrderStatus | 'all',
  ): Promise<number> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('无效的用户编号');
    }

    await this.cancelExpiredOrdersForUser(userId);

    const where: Record<string, unknown> = { user: { id: userId } };
    if (status && status !== 'all') {
      this.assertValidStatus(status);
      where.status = status;
    }

    return this.orderRepository.count({ where });
  }

  async createOrderFromCart(userId: number): Promise<Order> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('无效的用户编号');
    }

    const cartItems = await this.cartRepository.find({
      where: { user: { id: userId } },
      relations: { goods: true },
      order: { id: 'ASC' },
    });

    if (!cartItems.length) {
      throw new BadRequestException('购物车为空，无法提交订单');
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.goods?.price ?? 0;
      return sum + price * (item.quantity ?? 0);
    }, 0);

    const orderNumber = this.generateOrderNumber();

    const createdOrder = await this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        orderNumber,
        user: { id: userId } as any,
        totalAmount,
        status: 'pending_payment',
      });

      const savedOrder = await manager.save(order);

      const orderItems = cartItems.map((cartItem) => {
        const goods = cartItem.goods ?? null;
        const price = goods?.price ?? 0;

        return manager.create(OrderItem, {
          order: savedOrder,
          goodsRef: goods ?? null,
          goodsId: goods?.id ?? 0,
          goodsName: goods?.name || '未命名商品',
          goodsPrice: price,
          quantity: cartItem.quantity ?? 0,
          subtotalAmount: price * (cartItem.quantity ?? 0),
        });
      });

      await manager.save(orderItems);

      await manager.delete(CartItem, { user: { id: userId } });

      return savedOrder;
    });

    const populatedOrder = await this.orderRepository.findOne({
      where: { id: createdOrder.id },
      relations: { items: true },
    });

    if (!populatedOrder) {
      throw new NotFoundException('订单创建失败，请稍后再试');
    }

    return populatedOrder;
  }

  private assertValidStatus(status: string): asserts status is OrderStatus {
    const validStatuses: OrderStatus[] = [
      'pending_payment',
      'awaiting_shipment',
      'shipped',
      'completed',
      'cancelled',
    ];
    if (!validStatuses.includes(status as OrderStatus)) {
      throw new BadRequestException('无效的订单状态');
    }
  }

  private generateOrderNumber(): string {
    const now = new Date();
    const parts = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ];
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
    return `ORD-${parts.join('')}-${randomSuffix}`;
  }
  async updateStatus(
    userId: number,
    orderId: number,
    nextStatus: OrderStatus,
  ): Promise<Order> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('无效的用户编号');
    }
    this.assertValidStatus(nextStatus);

    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: { items: true },
    });

    if (!order) {
      throw new NotFoundException('订单不存在或无权操作');
    }

    order.status = nextStatus;
    await this.orderRepository.save(order);

    return order;
  }

  private async cancelExpiredOrdersForUser(userId: number): Promise<void> {
    const expiredAt = new Date(Date.now() - this.autoCancelMinutes * 60 * 1000);

    await this.orderRepository
      .createQueryBuilder()
      .update(Order)
      .set({ status: 'cancelled' })
      .where('user_id = :userId', { userId })
      .andWhere('status = :status', { status: 'pending_payment' })
      .andWhere('created_at <= :expiredAt', { expiredAt })
      .execute();
  }
}
