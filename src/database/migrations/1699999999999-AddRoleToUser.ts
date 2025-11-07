import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUser1699999999999 implements MigrationInterface {
  name = 'AddRoleToUser1699999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // สร้าง enum type สำหรับ role
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM('admin', 'member')
    `);

    // เพิ่ม column role ลงใน table user
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "role" "user_role_enum" NOT NULL DEFAULT 'member'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ลบ column role
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "role"
    `);

    // ลบ enum type
    await queryRunner.query(`
      DROP TYPE "user_role_enum"
    `);
  }
}
