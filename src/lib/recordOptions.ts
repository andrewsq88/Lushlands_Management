/**
 * Stored values the dropdowns are allowed to write.
 *
 * properties.status is text, default 'vacant', with no CHECK constraint.
 * The schema comment and these options are vacant, occupied, and maintenance.
 *
 * maintenance_requests.priority CHECK ('High', 'Medium', 'Low')
 * maintenance_requests.status CHECK ('Open', 'In Progress', 'Closed')
 * payments.type CHECK ('rent', 'mortgage', 'maintenance')
 * payments.status CHECK ('pending', 'paid'). "Overdue" is calculated from a
 * pending payment whose due date has passed; it is not stored.
 *
 * properties.type has no CHECK. The form offers apartment, house, condo,
 * townhouse, and studio.
 */

export const PROPERTY_STATUS_OPTIONS = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio', label: 'Studio' },
] as const;

export const MAINTENANCE_PRIORITY_OPTIONS = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
] as const;

export const MAINTENANCE_STATUS_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Closed', label: 'Closed' },
] as const;

export const PAYMENT_TYPE_OPTIONS = [
  { value: 'rent', label: 'Rent' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'maintenance', label: 'Maintenance' },
] as const;

export type PropertyListStatus = 'all' | 'occupied' | 'vacant';
export type MaintenanceListFilter = 'high-priority' | 'open' | 'all';

export function propertyStatusLabel(status: string) {
  return PROPERTY_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function propertyStatusClass(status: string) {
  if (status === 'occupied') return 'bg-green-100 text-green-800';
  if (status === 'vacant') return 'bg-yellow-100 text-yellow-800';
  if (status === 'maintenance') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

export function maintenancePriorityClass(priority: string) {
  if (priority === 'High') return 'bg-red-100 text-red-800 border-red-200';
  if (priority === 'Medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (priority === 'Low') return 'bg-green-100 text-green-800 border-green-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

export function maintenanceStatusClass(status: string) {
  if (status === 'Open') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (status === 'In Progress') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (status === 'Closed') return 'bg-green-100 text-green-800 border-green-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
}
