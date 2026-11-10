import {
  MAINTENANCE_PRIORITY_OPTIONS,
  MAINTENANCE_STATUS_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  maintenancePriorityClass,
  maintenanceStatusClass,
  propertyStatusClass,
} from '../lib/recordOptions';

type LiveSelectProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  options: readonly { value: string; label: string }[];
  className: string;
};

function stopRowClick(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

function LiveSelect({ value, onChange, ariaLabel, options, className }: LiveSelectProps) {
  const known = options.some((option) => option.value === value);

  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onClick={stopRowClick}
      onMouseDown={stopRowClick}
      onPointerDown={stopRowClick}
      className={className}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {!known && value ? <option value={value}>{value}</option> : null}
    </select>
  );
}

const selectClass = 'text-xs font-medium rounded-full border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500';

export function PropertyStatusSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <LiveSelect
      value={value}
      onChange={onChange}
      ariaLabel={ariaLabel}
      options={PROPERTY_STATUS_OPTIONS}
      className={`${selectClass} ${propertyStatusClass(value)}`}
    />
  );
}

export function MaintenancePrioritySelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <LiveSelect
      value={value}
      onChange={onChange}
      ariaLabel={ariaLabel}
      options={MAINTENANCE_PRIORITY_OPTIONS}
      className={`${selectClass} ${maintenancePriorityClass(value)}`}
    />
  );
}

export function MaintenanceStatusSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <LiveSelect
      value={value}
      onChange={onChange}
      ariaLabel={ariaLabel}
      options={MAINTENANCE_STATUS_OPTIONS}
      className={`${selectClass} ${maintenanceStatusClass(value)}`}
    />
  );
}
