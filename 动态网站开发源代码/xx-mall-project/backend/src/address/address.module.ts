import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './address.entity';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressSchemaInitializer } from './address.schema-initializer';

@Module({
  imports: [TypeOrmModule.forFeature([Address])],
  providers: [AddressService, AddressSchemaInitializer],
  controllers: [AddressController],
})
export class AddressModule {}
