export function getTodayDateValue() {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export function formatWatermarkDate(value) {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${year}.${month}.${day}`;
}

export function formatGpsCoordinates(latitude, longitude) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function initials(name) {
  return (name || 'SC')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function nextInList(items, currentValue, getValue) {
  const currentIndex = items.findIndex((item) => getValue(item) === currentValue);
  return items[(currentIndex + 1) % items.length] || items[0];
}

export function nextNumberPreset(values, currentValue) {
  return values.find((value) => value > currentValue) ?? values[0];
}
