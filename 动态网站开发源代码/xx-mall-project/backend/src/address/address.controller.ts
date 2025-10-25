import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.addressService.findByUser(userId);
  }

  @Post()
  create(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('recipientName') recipientName: string,
    @Body('phone') phone: string,
    @Body('province') province: string,
    @Body('city') city: string,
    @Body('district') district: string,
    @Body('detailAddress') detailAddress: string,
    @Body('isDefault') isDefault?: boolean,
  ) {
    return this.addressService.create({
      userId,
      recipientName,
      phone,
      province,
      city,
      district,
      detailAddress,
      isDefault,
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, any>,
  ) {
    return this.addressService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.addressService.delete(id);
  }
}
