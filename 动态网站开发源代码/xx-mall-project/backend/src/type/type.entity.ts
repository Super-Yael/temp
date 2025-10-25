import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Goods } from '../goods/goods.entity';

@Entity({ name: 'type' })
export class Type {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 45, nullable: true })
  name: string | null;

  @OneToMany(() => Goods, (goods) => goods.type)
  goods: Goods[];
}
