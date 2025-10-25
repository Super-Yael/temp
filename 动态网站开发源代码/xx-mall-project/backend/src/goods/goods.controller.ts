import { Controller, Get, Query } from '@nestjs/common';
import { GoodsService } from './goods.service';

@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Get()
  getAllGoods() {
    return this.goodsService.findAll();
  }

  @Get('search')
  searchGoods(@Query('query') query: string) {
    return this.goodsService.searchGoods(query);
  }
}
