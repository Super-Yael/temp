import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { OrderItem } from './order-item.entity';

export type OrderStatus =
  | 'pending_payment'
  | 'awaiting_shipment'
  | 'shipped'
  | 'completed'
  | 'cancelled';

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

@Entity({ name: 'shop_order' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_number', type: 'varchar', length: 32, unique: true })
  orderNumber: string;

  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
    default: 0,
  })
  totalAmount: number;

  @Column({
    type: 'varchar',
    length: 32,
    default: 'pending_payment',
  })
  status: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
