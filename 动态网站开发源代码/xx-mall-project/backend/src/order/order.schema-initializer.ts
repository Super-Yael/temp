import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, Table } from 'typeorm';

@Injectable()
export class OrderSchemaInitializer implements OnModuleInit {
  private readonly logger = new Logger(OrderSchemaInitializer.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      const hasOrderTable = await queryRunner.hasTable('shop_order');
      if (!hasOrderTable) {
        await queryRunner.createTable(
          new Table({
            name: 'shop_order',
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
                name: 'order_number',
                type: 'varchar',
                length: '32',
                isNullable: false,
                isUnique: true,
              },
              {
                name: 'user_id',
                type: 'int',
                isNullable: false,
              },
              {
                name: 'total_amount',
                type: 'decimal',
                precision: 10,
                scale: 2,
                default: '0.00',
              },
              {
                name: 'status',
                type: 'varchar',
                length: '32',
                default: `'pending_payment'`,
              },
              {
                name: 'created_at',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
                onUpdate: 'CURRENT_TIMESTAMP',
              },
            ],
            foreignKeys: [
              {
                name: 'fk_order_user_id',
                columnNames: ['user_id'],
                referencedTableName: 'user',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
              },
            ],
          }),
        );

        this.logger.log('Created missing table `shop_order`');
      }

      const hasOrderItemTable = await queryRunner.hasTable('shop_order_item');
      if (!hasOrderItemTable) {
        await queryRunner.createTable(
          new Table({
            name: 'shop_order_item',
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
                name: 'order_id',
                type: 'int',
                isNullable: false,
              },
              {
                name: 'goods_id',
                type: 'int',
                isNullable: false,
              },
              {
                name: 'goods_name',
                type: 'varchar',
                length: '120',
                isNullable: false,
              },
              {
                name: 'goods_price',
                type: 'decimal',
                precision: 10,
                scale: 2,
                default: '0.00',
              },
              {
                name: 'quantity',
                type: 'int',
                default: '1',
              },
              {
                name: 'subtotal_amount',
                type: 'decimal',
                precision: 10,
                scale: 2,
                default: '0.00',
              },
              {
                name: 'goods_ref_id',
                type: 'int',
                isNullable: true,
              },
            ],
            foreignKeys: [
              {
                name: 'fk_order_item_order_id',
                columnNames: ['order_id'],
                referencedTableName: 'shop_order',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'RESTRICT',
              },
              {
                name: 'fk_order_item_goods_ref',
                columnNames: ['goods_ref_id'],
                referencedTableName: 'goods',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
                onUpdate: 'RESTRICT',
              },
            ],
            indices: [
              {
                name: 'idx_order_item_order_id',
                columnNames: ['order_id'],
              },
            ],
          }),
        );

        this.logger.log('Created missing table `shop_order_item`');
      }
    } catch (error) {
      this.logger.error('Failed to ensure order tables exist', error);
    } finally {
      await queryRunner.release();
    }
  }
}

