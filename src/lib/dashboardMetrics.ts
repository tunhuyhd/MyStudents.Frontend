export interface ClassEnrollmentCount {
  studentCount: number;
}

export function getPageEnrollmentCount(classes: readonly ClassEnrollmentCount[]): number {
  return classes.reduce((total, currentClass) => total + currentClass.studentCount, 0);
}
