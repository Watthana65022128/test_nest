import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * TokenBlacklist Entity - เก็บ JWT tokens ที่ถูก logout แล้ว
 *
 * เมื่อ user logout:
 * 1. เพิ่ม token เข้า blacklist
 * 2. เมื่อมีการใช้ token นี้อีก ระบบจะปฏิเสธ
 *
 * หมายเหตุ:
 * - ควรมี cron job ลบ tokens ที่หมดอายุแล้วออกจาก blacklist
 * - expiresAt ใช้สำหรับ cleanup
 */
@Entity('token_blacklist')
export class TokenBlacklist {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * JWT token ที่ถูก blacklist
   * เก็บแบบ hash หรือ full token ก็ได้
   */
  @Column({ type: 'text' })
  token: string;

  /**
   * User ID ของ token นี้
   * ใช้สำหรับ tracking และ query
   */
  @Column()
  userId: number;

  /**
   * วันเวลาที่ token จะหมดอายุ
   * ใช้สำหรับ cleanup tokens ที่หมดอายุแล้ว
   */
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  /**
   * วันเวลาที่เพิ่มเข้า blacklist (logout)
   */
  @CreateDateColumn()
  createdAt: Date;
}
