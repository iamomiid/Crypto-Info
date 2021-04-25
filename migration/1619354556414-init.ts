import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1619354556414 implements MigrationInterface {
  name = 'init1619354556414';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `pair` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `symbol` varchar(255) NOT NULL, UNIQUE INDEX `IDX_de8115e1c32ea7c4df6efc892e` (`symbol`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      "CREATE TABLE `candle` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `high` bigint NOT NULL, `low` bigint NOT NULL, `open` bigint NOT NULL, `close` bigint NOT NULL, `start` timestamp(6) NOT NULL, `end` timestamp(6) NOT NULL, `final` tinyint NOT NULL, `interval` enum ('1m', '5m', '1d') NOT NULL, `pairId` int NOT NULL, UNIQUE INDEX `pair-candle` (`pairId`, `interval`, `start`, `end`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      'ALTER TABLE `candle` ADD CONSTRAINT `FK_cce1995de8bfb2beea53d06951d` FOREIGN KEY (`pairId`) REFERENCES `pair`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `candle` DROP FOREIGN KEY `FK_cce1995de8bfb2beea53d06951d`',
    );
    await queryRunner.query('DROP INDEX `pair-candle` ON `candle`');
    await queryRunner.query('DROP TABLE `candle`');
    await queryRunner.query(
      'DROP INDEX `IDX_de8115e1c32ea7c4df6efc892e` ON `pair`',
    );
    await queryRunner.query('DROP TABLE `pair`');
  }
}
