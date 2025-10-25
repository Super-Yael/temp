import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from '../address/address.entity';
import { Order } from '../order/order.entity';

const bitColumnTransformer = {
  to: (value?: boolean | null) => {
    if (typeof value === 'boolean') {
      return value;
    }
    return false;
  },
  from: (value?: Buffer | number | boolean | null) => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    if (value instanceof Buffer) {
      return value[0] === 1;
    }
    return false;
  },
};

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 45, unique: true, nullable: true })
  username: string | null;

  @Column({ type: 'varchar', length: 45, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  address: string | null;

  @Column({
    name: 'isadmin',
    type: 'bit',
    width: 1,
    default: () => "b'0'",
    transformer: bitColumnTransformer,
  })
  isAdmin: boolean;

  @Column({
    name: 'isvalidate',
    type: 'bit',
    width: 1,
    default: () => "b'0'",
    transformer: bitColumnTransformer,
  })
  isValidate: boolean;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
