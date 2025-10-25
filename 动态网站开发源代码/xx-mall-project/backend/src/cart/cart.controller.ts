import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.findByUser(userId);
  }

  @Post()
  addItem(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('goodsId', ParseIntPipe) goodsId: number,
    @Body('quantity', ParseIntPipe) quantity?: number,
  ) {
    return this.cartService.addItem({ userId, goodsId, quantity });
  }

  @Patch(':id')
  updateQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.cartService.updateQuantity(userId, id, quantity);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.cartService.removeItem(userId, id);
  }

  @Delete('user/:userId')
  clear(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.clear(userId);
  }
}

