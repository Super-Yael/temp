import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartItem } from '../cart/cart.entity';
import { OrderSchemaInitializer } from './order.schema-initializer';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, CartItem])],
  providers: [OrderService, OrderSchemaInitializer],
  controllers: [OrderController],
})
export class OrderModule {}
