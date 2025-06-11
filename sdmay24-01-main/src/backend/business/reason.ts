export class Reason {
  availability: number;
  className: string;
  section: string;

  constructor(availability: number, className: string, section: string) {
    this.availability = availability;
    this.className = className;
    this.section = section;
  }

  toString(): string {
    return `Class: ${this.className}, Availability: ${this.availability}`;
  }
}