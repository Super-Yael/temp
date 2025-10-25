import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';

interface AddressPayload {
  userId: number;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault?: boolean;
}

interface UpdateAddressPayload extends Partial<AddressPayload> {}

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async findByUser(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', id: 'ASC' },
    });
  }

  private async clearDefaultFlag(
    userId: number,
    excludeId?: number,
  ): Promise<void> {
    const query = this.addressRepository
      .createQueryBuilder()
      .update(Address)
      .set({ isDefault: false })
      .where('user_id = :userId', { userId });

    if (excludeId) {
      query.andWhere('id != :excludeId', { excludeId });
    }

    await query.execute();
  }

  async create(payload: AddressPayload): Promise<Address> {
    const {
      userId,
      recipientName,
      phone,
      province,
      city,
      district,
      detailAddress,
      isDefault,
    } = payload;

    const existingCount = await this.addressRepository.count({
      where: { user: { id: userId } },
    });

    const shouldBeDefault = isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await this.clearDefaultFlag(userId);
    }

    const address = this.addressRepository.create({
      recipientName,
      phone,
      province,
      city,
      district,
      detailAddress,
      isDefault: shouldBeDefault,
      user: { id: userId } as any,
    });

    return this.addressRepository.save(address);
  }

  async update(id: number, payload: UpdateAddressPayload): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    const updateData: Partial<Address> = {};

    if (payload.recipientName !== undefined) {
      updateData.recipientName = payload.recipientName;
    }
    if (payload.phone !== undefined) {
      updateData.phone = payload.phone;
    }
    if (payload.province !== undefined) {
      updateData.province = payload.province;
    }
    if (payload.city !== undefined) {
      updateData.city = payload.city;
    }
    if (payload.district !== undefined) {
      updateData.district = payload.district;
    }
    if (payload.detailAddress !== undefined) {
      updateData.detailAddress = payload.detailAddress;
    }

    const wantsDefault = payload.isDefault === true;
    const wantsUnsetDefault = payload.isDefault === false;

    if (wantsDefault) {
      await this.clearDefaultFlag(address.user.id, id);
      updateData.isDefault = true;
    } else if (wantsUnsetDefault) {
      updateData.isDefault = false;
    }

    Object.assign(address, updateData);
    const saved = await this.addressRepository.save(address);

    if (wantsUnsetDefault) {
      const defaultExists = await this.addressRepository.findOne({
        where: { user: { id: address.user.id }, isDefault: true },
      });

      if (!defaultExists) {
        await this.setFirstAddressAsDefault(address.user.id);
      }
    }

    return saved;
  }

  private async setFirstAddressAsDefault(userId: number): Promise<void> {
    const firstAddress = await this.addressRepository.findOne({
      where: { user: { id: userId } },
      order: { id: 'ASC' },
    });

    if (firstAddress) {
      firstAddress.isDefault = true;
      await this.addressRepository.save(firstAddress);
    }
  }

  async delete(id: number): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    const wasDefault = address.isDefault;
    const userId = address.user.id;

    await this.addressRepository.remove(address);

    if (wasDefault) {
      await this.setFirstAddressAsDefault(userId);
    }
  }
}
