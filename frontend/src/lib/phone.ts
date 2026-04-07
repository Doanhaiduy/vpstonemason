export function toPhoneHref(phone: string): string {
  const value = String(phone || '').trim();
  if (!value) {
    return 'tel:';
  }

  const hasInternationalPrefix = value.startsWith('+');
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return 'tel:';
  }

  return `tel:${hasInternationalPrefix ? `+${digits}` : digits}`;
}