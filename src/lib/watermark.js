import { formatWatermarkDate } from './formatters.js';

export function buildWatermarkItems({
  watermarkTextEnabled,
  watermarkText,
  watermarkLocationEnabled,
  watermarkLocationText,
  watermarkDateEnabled,
  watermarkDateText
}) {
  return [
    watermarkTextEnabled && watermarkText.trim()
      ? { id: 'text', iconId: 'text', label: watermarkText.trim() }
      : null,
    watermarkLocationEnabled && watermarkLocationText.trim()
      ? { id: 'location', iconId: 'location', label: watermarkLocationText.trim() }
      : null,
    watermarkDateEnabled && watermarkDateText
      ? { id: 'date', iconId: 'date', label: formatWatermarkDate(watermarkDateText) }
      : null
  ].filter(Boolean);
}
