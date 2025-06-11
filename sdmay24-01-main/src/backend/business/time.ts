export class Time {
  day: string;
  startTime: string; //format example 10:20
  endTime: string; //format example 14:10

  constructor(day: string, startTime: string, endTime: string) {
    this.day = day.trim();
    this.startTime = startTime.trim();
    this.endTime = endTime.trim();
  }

  toString(): string {
    return `${this.day} ${this.startTime}-${this.endTime}`;
  }
  hash(): string {
    return `${this.day}${this.startTime}${this.endTime}`;
  }
  equals(other: Time): boolean {
    return (
      this.day === other.day &&
      this.startTime === other.startTime &&
      this.endTime === other.endTime
    );
  }
}
