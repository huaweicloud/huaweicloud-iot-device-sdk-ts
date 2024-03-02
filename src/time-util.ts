export class TimeUtil {
  static getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[-:T]/g, "").substring(0, 10);
  }
}
