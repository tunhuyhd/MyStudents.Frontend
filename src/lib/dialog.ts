export function canCloseDialog(hasUnsavedChanges: boolean, confirmDiscard: () => boolean): boolean {
  return !hasUnsavedChanges || confirmDiscard();
}
