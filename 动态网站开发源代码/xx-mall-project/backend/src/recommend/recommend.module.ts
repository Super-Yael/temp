import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendController } from './recommend.controller';
import { RecommendService } from './recommend.service';
import { Recommend } from './recommend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recommend])],
  controllers: [RecommendController],
  providers: [RecommendService],
})
export class RecommendModule {}
