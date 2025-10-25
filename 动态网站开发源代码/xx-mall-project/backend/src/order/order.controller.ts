import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('statuses')
  getStatusOptions() {
    return this.orderService.getStatusOptions();
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('status') status?: string,
  ) {
    return this.orderService.findOrdersByUser(
      userId,
      (status as any) ?? undefined,
    );
  }

  @Post()
  create(@Body('userId', ParseIntPipe) userId: number) {
    return this.orderService.createOrderFromCart(userId);
  }

  @Patch(':orderId/status')
  updateStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Body('status') status: string,
  ) {
    return this.orderService.updateStatus(userId, orderId, status as any);
  }
}
