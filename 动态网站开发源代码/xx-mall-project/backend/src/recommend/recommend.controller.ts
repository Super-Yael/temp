import { Controller, Get } from '@nestjs/common';
import { RecommendService } from './recommend.service';

@Controller('recommend')
export class RecommendController {
  constructor(private readonly recommendService: RecommendService) {}

  @Get('home')
  getHomeCarousel() {
    return this.recommendService.getHomeCarousel();
  }
}
