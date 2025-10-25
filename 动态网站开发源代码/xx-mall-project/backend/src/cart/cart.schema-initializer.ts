import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, Table } from 'typeorm';

@Injectable()
export class CartSchemaInitializer implements OnModuleInit {
  private readonly logger = new Logger(CartSchemaInitializer.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      const hasTable = await queryRunner.hasTable('cart_item');
      if (hasTable) {
        return;
      }

      await queryRunner.createTable(
        new Table({
          name: 'cart_item',
          engine: 'InnoDB',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'user_id',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'goods_id',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'quantity',
              type: 'int',
              isNullable: false,
              default: '1',
            },
          ],
          uniques: [
            {
              name: 'uq_cart_user_goods',
              columnNames: ['user_id', 'goods_id'],
            },
          ],
          foreignKeys: [
            {
              name: 'fk_cart_user_id',
              columnNames: ['user_id'],
              referencedTableName: 'user',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
              onUpdate: 'RESTRICT',
            },
            {
              name: 'fk_cart_goods_id',
              columnNames: ['goods_id'],
              referencedTableName: 'goods',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
              onUpdate: 'RESTRICT',
            },
          ],
        }),
      );

      this.logger.log('Created missing table `cart_item`');
    } catch (error) {
      this.logger.error('Failed to ensure `cart_item` table exists', error);
    } finally {
      await queryRunner.release();
    }
  }
}

