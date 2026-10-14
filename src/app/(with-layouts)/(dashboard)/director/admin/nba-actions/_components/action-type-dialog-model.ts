export function isActionTypeSaveDisabled(state: {
  isNew: boolean;
  isDetailPending: boolean;
  isSaving: boolean;
}): boolean {
  return (!state.isNew && state.isDetailPending) || state.isSaving;
}
