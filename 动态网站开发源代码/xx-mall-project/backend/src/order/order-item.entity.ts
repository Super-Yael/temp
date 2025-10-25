import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Goods } from '../goods/goods.entity';

const decimalTransformer = {
  to: (value?: number | null) => {
    if (typeof value === 'number') {
      return value;
    }
    return 0;
  },
  from: (value?: string | null) => {
    if (!value) {
      return 0;
    }
    return Number(value);
  },
};

@Entity({ name: 'shop_order_item' })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Goods, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'goods_ref_id' })
  goodsRef: Goods | null;

  @Column({ name: 'goods_id', type: 'int' })
  goodsId: number;

  @Column({ name: 'goods_name', type: 'varchar', length: 120 })
  goodsName: string;

  @Column({
    name: 'goods_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
    default: 0,
  })
  goodsPrice: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({
    name: 'subtotal_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
    default: 0,
  })
  subtotalAmount: number;
}

