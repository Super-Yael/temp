import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

const booleanTransformer = {
  to: (value?: boolean | null) => {
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    return 0;
  },
  from: (value?: number | null) => {
    if (typeof value === 'number') {
      return value === 1;
    }
    return false;
  },
};

@Entity({ name: 'user_address' })
@Index('idx_user_default', ['user', 'isDefault'])
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'recipient_name', type: 'varchar', length: 60 })
  recipientName: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 45 })
  province: string;

  @Column({ type: 'varchar', length: 45 })
  city: string;

  @Column({ type: 'varchar', length: 45 })
  district: string;

  @Column({ name: 'detail_address', type: 'varchar', length: 120 })
  detailAddress: string;

  @Column({
    name: 'is_default',
    type: 'tinyint',
    width: 1,
    default: () => '0',
    transformer: booleanTransformer,
  })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.addresses, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
