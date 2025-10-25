import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Goods } from '../goods/goods.entity';

@Entity({ name: 'cart_item' })
@Unique('uq_cart_user_goods', ['user', 'goods'])
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Goods, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goods_id' })
  goods: Goods;

  @Column({ type: 'int', unsigned: true, default: 1 })
  quantity: number;
}

