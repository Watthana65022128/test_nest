import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

/**
 * Custom Throttler Guard
 *
 * เพิ่ม error message ที่ละเอียดกว่า default ThrottlerGuard
 * โดยจะบอกให้ user รู้ว่าต้องรอนานเท่าไหร่
 *
 * การทำงาน:
 * 1. เมื่อ user ส่ง request มา Guard จะเช็คว่าเกิน limit หรือไม่
 * 2. ถ้าเกิน limit จะ throw error พร้อม message ที่ละเอียด
 * 3. ถ้าไม่เกิน limit จะอนุญาตให้ request ผ่านไปได้
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Override method นี้เพื่อแก้ไข error message
   *
   * @param context - ExecutionContext จาก NestJS
   * @param throttlerLimitDetail - ข้อมูล limit ที่ถูกละเมิด
   */
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: {
      ttl: number;      // Time to live (ms)
      limit: number;    // จำนวน requests สูงสุด
      tracker: string;  // IP address ของ user
    },
  ): Promise<void> {
    // แปลง ttl จาก milliseconds เป็นหน่วยที่อ่านง่าย
    const seconds = Math.ceil(throttlerLimitDetail.ttl / 1000);
    const minutes = Math.ceil(seconds / 60);
    const hours = Math.ceil(minutes / 60);

    // เลือก unit ที่เหมาะสม
    let timeUnit: string;
    let timeValue: number;

    if (hours >= 1) {
      timeUnit = hours === 1 ? 'ชั่วโมง' : 'ชั่วโมง';
      timeValue = hours;
    } else if (minutes >= 1) {
      timeUnit = minutes === 1 ? 'นาที' : 'นาที';
      timeValue = minutes;
    } else {
      timeUnit = seconds === 1 ? 'วินาที' : 'วินาที';
      timeValue = seconds;
    }

    // สร้าง error message ที่อ่านง่าย
    const message = `คุณส่ง request มากเกินไป! อนุญาตเพียง ${throttlerLimitDetail.limit} ครั้งต่อ ${timeValue} ${timeUnit} กรุณารอสักครู่แล้วลองใหม่`;

    // Throw custom error
    throw new ThrottlerException(message);
  }
}
