/*
 * @Author: Yael
 * @Date: 2025-10-24 17:55:26
 * @LastEditTime: 2025-10-24 22:12:07
 * @FilePath: /动态网站开发源代码/xx-mall-project/backend/src/app.module.ts
 * @Description: To_Do_List_test
 * Copyright (c) 2025 by YaelSuperProMax@gmail.com, All Rights Reserved.
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecommendModule } from './recommend/recommend.module';
import { TypeModule } from './type/type.module';
import { GoodsModule } from './goods/goods.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'shop',
      autoLoadEntities: true,
      synchronize: false,
    }),
    RecommendModule,
    TypeModule,
    GoodsModule,
    UserModule,
    AuthModule,
    AddressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
