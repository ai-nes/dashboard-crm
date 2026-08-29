export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

export const formatCompactCurrency = (value: number) => {
  const formatted = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return `${formatted.replace(/\s+/g, "\u00A0")}\u00A0đ`;
};

export const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

