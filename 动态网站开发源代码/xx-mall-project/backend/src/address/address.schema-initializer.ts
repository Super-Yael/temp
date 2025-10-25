import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, Table } from 'typeorm';

@Injectable()
export class AddressSchemaInitializer implements OnModuleInit {
  private readonly logger = new Logger(AddressSchemaInitializer.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      const hasTable = await queryRunner.hasTable('user_address');
      if (hasTable) {
        return;
      }

      await queryRunner.createTable(
        new Table({
          name: 'user_address',
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
              name: 'recipient_name',
              type: 'varchar',
              length: '60',
              isNullable: false,
            },
            {
              name: 'phone',
              type: 'varchar',
              length: '20',
              isNullable: false,
            },
            {
              name: 'province',
              type: 'varchar',
              length: '45',
              isNullable: false,
            },
            {
              name: 'city',
              type: 'varchar',
              length: '45',
              isNullable: false,
            },
            {
              name: 'district',
              type: 'varchar',
              length: '45',
              isNullable: false,
            },
            {
              name: 'detail_address',
              type: 'varchar',
              length: '120',
              isNullable: false,
            },
            {
              name: 'is_default',
              type: 'tinyint',
              isNullable: false,
              default: '0',
            },
          ],
          indices: [
            {
              name: 'idx_user_address_user_id',
              columnNames: ['user_id'],
            },
          ],
          foreignKeys: [
            {
              name: 'fk_user_address_user_id',
              columnNames: ['user_id'],
              referencedTableName: 'user',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
              onUpdate: 'RESTRICT',
            },
          ],
        }),
      );

      this.logger.log('Created missing table `user_address`');
    } catch (error) {
      this.logger.error('Failed to ensure `user_address` table exists', error);
    } finally {
      await queryRunner.release();
    }
  }
}
