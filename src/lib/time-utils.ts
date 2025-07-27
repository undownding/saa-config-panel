import moment from 'moment';

/**
 * 时间工具类，处理 UTC 和本地时间的转换
 * 数据存储使用 UTC 时间，显示和编辑使用本地时间
 */
export class TimeUtils {
  /**
   * 将 UTC 时间字符串转换为本地时间的 datetime-local 格式
   * @param utcTimeString UTC 时间字符串 (ISO 8601)
   * @returns 本地时间字符串，格式为 YYYY-MM-DDTHH:mm
   */
  static utcToLocalDatetimeLocal(utcTimeString: string): string {
    return moment.utc(utcTimeString).local().format('YYYY-MM-DDTHH:mm');
  }

  /**
   * 将本地时间的 datetime-local 格式转换为 UTC 时间字符串
   * @param localDatetimeLocal 本地时间字符串，格式为 YYYY-MM-DDTHH:mm
   * @returns UTC 时间字符串 (ISO 8601)
   */
  static localDatetimeLocalToUtc(localDatetimeLocal: string): string {
    return moment(localDatetimeLocal).utc().toISOString();
  }

  /**
   * 将 UTC 时间字符串转换为本地时间显示格式
   * @param utcTimeString UTC 时间字符串 (ISO 8601)
   * @returns 本地时间显示字符串
   */
  static utcToLocalDisplay(utcTimeString: string): string {
    return moment.utc(utcTimeString).local().format('YYYY-MM-DD HH:mm');
  }

  /**
   * 检查 UTC 时间是否已过期
   * @param utcTimeString UTC 时间字符串 (ISO 8601)
   * @returns 是否已过期
   */
  static isExpired(utcTimeString: string): boolean {
    return moment.utc(utcTimeString).isBefore(moment.utc());
  }

  /**
   * 获取默认的过期时间（当前时间 + 指定天数），返回本地时间的 datetime-local 格式
   * @param daysFromNow 从现在开始的天数，默认为 7 天
   * @returns 本地时间字符串，格式为 YYYY-MM-DDTHH:mm
   */
  static getDefaultExpiryDateLocal(daysFromNow: number = 7): string {
    return moment().add(daysFromNow, 'days').format('YYYY-MM-DDTHH:mm');
  }

  /**
   * 获取当前本地时间的 datetime-local 格式最小值（用于表单验证）
   * @returns 当前本地时间字符串，格式为 YYYY-MM-DDTHH:mm
   */
  static getCurrentLocalDatetimeLocal(): string {
    return moment().format('YYYY-MM-DDTHH:mm');
  }

  /**
   * 格式化时间差显示（例如：还有 2 天过期）
   * @param utcTimeString UTC 时间字符串 (ISO 8601)
   * @returns 时间差描述
   */
  static getTimeUntilExpiry(utcTimeString: string): string {
    const expiry = moment.utc(utcTimeString);
    const now = moment.utc();
    
    if (expiry.isBefore(now)) {
      return `已过期 ${now.diff(expiry, 'days')} 天`;
    }
    
    const diff = expiry.diff(now);
    const duration = moment.duration(diff);
    
    if (duration.asDays() >= 1) {
      return `还有 ${Math.ceil(duration.asDays())} 天过期`;
    } else if (duration.asHours() >= 1) {
      return `还有 ${Math.ceil(duration.asHours())} 小时过期`;
    } else {
      return `还有 ${Math.ceil(duration.asMinutes())} 分钟过期`;
    }
  }
}
