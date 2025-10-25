import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Type } from '../type/type.entity';
import { Recommend } from '../recommend/recommend.entity';

@Entity({ name: 'goods' })
export class Goods {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 45, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  cover: string | null;

  @Column({ name: 'image1', type: 'varchar', length: 45, nullable: true })
  image1: string | null;

  @Column({ name: 'image2', type: 'varchar', length: 45, nullable: true })
  image2: string | null;

  @Column({ type: 'float', nullable: true })
  price: number | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  intro: string | null;

  @Column({ type: 'int', nullable: true })
  stock: number | null;

  @ManyToOne(() => Type, (type) => type.goods, { nullable: true })
  @JoinColumn({ name: 'type_id' })
  type: Type | null;

  @OneToMany(() => Recommend, (recommend) => recommend.goods)
  recommendations: Recommend[];
}
