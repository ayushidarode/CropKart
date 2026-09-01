function AvailabilityBadge({ crop }) {
  const availability = crop?.availability || (() => {
    if (!crop || crop.quantity <= 0) return { label: 'Sold Out', level: 'sold-out' };
    if (crop.quantity <= 100) return { label: `Low Stock: ${crop.quantity}${crop.unit}`, level: 'low-stock' };
    return { label: `In Stock: ${crop.quantity}${crop.unit}`, level: 'in-stock' };
  })();

  return (
    <span className={`availability-badge ${availability.level}`}>
      {availability.label}
    </span>
  );
}

export default AvailabilityBadge;
