export const isValidPositiveInteger = (value) => /^[1-9]\d*$/.test((value || '').trim());

export const getInvalidInputClass = (isInvalid) =>
  isInvalid ? '!border-red-500/70 focus:!border-red-500/90' : '';
