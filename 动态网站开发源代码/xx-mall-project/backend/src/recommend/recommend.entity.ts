import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Goods } from '../goods/goods.entity';

@Entity({ name: 'recommend' })
export class Recommend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'tinyint', nullable: true })
  type: number | null;

  @ManyToOne(() => Goods, (goods) => goods.recommendations, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'goods_id' })
  goods: Goods | null;
}
