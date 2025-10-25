import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart.entity';
import { Goods } from '../goods/goods.entity';

interface AddCartItemPayload {
  userId: number;
  goodsId: number;
  quantity?: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @InjectRepository(Goods)
    private readonly goodsRepository: Repository<Goods>,
  ) {}

  async findByUser(userId: number): Promise<CartItem[]> {
    return this.cartRepository.find({
      where: { user: { id: userId } },
      relations: { goods: true },
      order: { id: 'ASC' },
    });
  }

  async addItem(payload: AddCartItemPayload): Promise<CartItem> {
    const { userId, goodsId, quantity = 1 } = payload;

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('无效的用户编号');
    }

    if (!Number.isInteger(goodsId) || goodsId <= 0) {
      throw new BadRequestException('无效的商品编号');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('商品数量必须为正整数');
    }

    const goods = await this.goodsRepository.findOne({ where: { id: goodsId } });
    if (!goods) {
      throw new NotFoundException('指定的商品不存在');
    }

    const existingItem = await this.cartRepository.findOne({
      where: { user: { id: userId }, goods: { id: goodsId } },
      relations: { goods: true },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      return this.cartRepository.save(existingItem);
    }

    const cartItem = this.cartRepository.create({
      user: { id: userId } as any,
      goods,
      quantity,
    });

    return this.cartRepository.save(cartItem);
  }

  async updateQuantity(userId: number, itemId: number, quantity: number): Promise<CartItem> {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('商品数量必须为正整数');
    }

    const cartItem = await this.cartRepository.findOne({
      where: { id: itemId, user: { id: userId } },
      relations: { goods: true },
    });

    if (!cartItem) {
      throw new NotFoundException('购物车商品不存在');
    }

    cartItem.quantity = quantity;
    return this.cartRepository.save(cartItem);
  }

  async removeItem(userId: number, itemId: number): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: itemId, user: { id: userId } },
    });

    if (!cartItem) {
      throw new NotFoundException('购物车商品不存在');
    }

    await this.cartRepository.remove(cartItem);
  }

  async clear(userId: number): Promise<void> {
    await this.cartRepository
      .createQueryBuilder()
      .delete()
      .from(CartItem)
      .where('user_id = :userId', { userId })
      .execute();
  }
}

