import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './cart.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Goods } from '../goods/goods.entity';
import { CartSchemaInitializer } from './cart.schema-initializer';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Goods])],
  providers: [CartService, CartSchemaInitializer],
  controllers: [CartController],
})
export class CartModule {}

