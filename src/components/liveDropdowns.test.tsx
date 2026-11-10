import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from './Dashboard';
import { Maintenance } from './Maintenance';
import { Payments } from './Payments';
import { Properties } from './Properties';
import { PropertyForm } from './PropertyForm';
import { Tenants } from './Tenants';
import { ToastViewport } from './ToastViewport';
import {
  maintenanceCollection,
  paymentsCollection,
  propertiesCollection,
  resetLiveDataForTests,
  tenantsCollection,
} from '../lib/collections';
import type { MaintenanceRequest, Payment, Property, Tenant } from '../lib/collections';
import { resetSupabaseMock, setHandleWrite, setMockUser } from '../test/supabaseMock';
import { useProperties } from '../hooks/useProperties';

vi.mock('../lib/supabase', async () => {
  const mock = await import('../test/supabaseMock');
  return { supabase: mock.supabase };
});

function property(overrides: Partial<Property> = {}): Property {
  return {
    id: 'prop-1',
    address: '1 Main St',
    type: 'apartment',
    status: 'vacant',
    rent_amount: 1200,
    bedrooms: 2,
    bathrooms: 1,
    square_feet: 800,
    description: 'Sunny apartment',
    user_id: 'user-1',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function request(overrides: Partial<MaintenanceRequest> = {}): MaintenanceRequest {
  return {
    id: 'req-1',
    tenant_id: null,
    property_id: 'prop-1',
    user_id: 'user-1',
    description: 'Leaky sink',
    priority: 'High',
    status: 'Open',
    created_at: '2026-01-02T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
    tenants: null,
    properties: { address: '1 Main St', type: 'apartment' },
    ...overrides,
  };
}

function payment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'pay-1',
    tenant_id: 'tenant-1',
    amount: 1000,
    type: 'rent',
    status: 'pending',
    due_date: '2020-01-01',
    stripe_payment_id: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    tenants: { name: 'Ada Rent', email: 'ada@example.com', properties: { address: '1 Main St' } },
    ...overrides,
  };
}

function tenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: 'tenant-1',
    name: 'Ada Tenant',
    email: 'ada@example.com',
    phone: null,
    property_id: 'prop-1',
    lease_start: null,
    lease_end: null,
    income: null,
    user_id: 'user-1',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    properties: { address: '1 Main St', type: 'apartment' },
    ...overrides,
  };
}

function echoWrites() {
  setHandleWrite(({ table, payload, filters }) => {
    const collections = {
      properties: propertiesCollection,
      maintenance_requests: maintenanceCollection,
      payments: paymentsCollection,
      tenants: tenantsCollection,
    };
    const collection = collections[table as keyof typeof collections];
    const current = collection?.getById(String(filters.id));
    return { data: { ...current, ...(payload as object) }, error: null };
  });
}

function PropertyCount() {
  const { properties } = useProperties();
  return <p data-testid="property-count">{properties.length}</p>;
}

function countButton(label: string) {
  const button = screen.getAllByRole('button').find((candidate) => {
    const text = (candidate.textContent ?? '').replace(/\s+/g, ' ').trim();
    return text.startsWith(label) && !candidate.querySelector('select');
  });
  if (!button) throw new Error(`Missing ${label} count`);
  return button;
}

describe('live dropdowns', () => {
  beforeEach(() => {
    resetLiveDataForTests();
    resetSupabaseMock();
    propertiesCollection.replaceAll([property()]);
    maintenanceCollection.replaceAll([]);
    paymentsCollection.replaceAll([]);
    tenantsCollection.replaceAll([]);
  });

  afterEach(() => {
    cleanup();
    resetLiveDataForTests();
    resetSupabaseMock();
  });

  it('updates every property status control, count, and filter without a refresh', async () => {
    echoWrites();
    const user = userEvent.setup();
    render(
      <>
        <ToastViewport />
        <Dashboard />
        <Properties />
      </>,
    );

    const selects = () => screen.getAllByLabelText('Status for 1 Main St') as HTMLSelectElement[];
    await screen.findAllByLabelText('Status for 1 Main St');
    expect(selects()).toHaveLength(2);
    expect(within(selects()[0]).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Vacant',
      'Occupied',
      'Maintenance',
    ]);
    expect(countButton('Occupied')).toHaveTextContent('0');
    expect(countButton('Vacant')).toHaveTextContent('1');

    await user.selectOptions(selects()[0], 'occupied');
    await waitFor(() => expect(selects().every((select) => select.value === 'occupied')).toBe(true));
    expect(countButton('Occupied')).toHaveTextContent('1');
    expect(countButton('Vacant')).toHaveTextContent('0');

    await user.selectOptions(selects()[0], 'maintenance');
    await waitFor(() => expect(selects().every((select) => select.value === 'maintenance')).toBe(true));
    expect(countButton('Occupied')).toHaveTextContent('0');
    expect(countButton('Vacant')).toHaveTextContent('0');

    await user.selectOptions(selects()[0], 'vacant');
    await waitFor(() => expect(selects().every((select) => select.value === 'vacant')).toBe(true));
    expect(countButton('Vacant')).toHaveTextContent('1');

    await user.selectOptions(screen.getByLabelText('Filter properties by status'), 'occupied');
    expect(screen.getByText('No properties found')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Filter properties by status'), 'vacant');
    expect(screen.getAllByText('1 Main St').length).toBeGreaterThan(0);
  });

  it('drops a property out of the open vacant list as soon as its status changes', async () => {
    echoWrites();
    const user = userEvent.setup();
    render(
      <>
        <Dashboard />
        <Properties />
      </>,
    );

    await user.click(countButton('Vacant'));
    expect(screen.getByRole('heading', { name: 'Vacant Properties' })).toBeInTheDocument();
    const modalSelect = screen.getAllByLabelText('Status for 1 Main St').at(-1) as HTMLSelectElement;
    await user.selectOptions(modalSelect, 'occupied');

    await waitFor(() => expect(screen.getByText('No properties found')).toBeInTheDocument());
    expect(countButton('Occupied')).toHaveTextContent('1');
    expect(countButton('Vacant')).toHaveTextContent('0');
    expect(screen.getAllByLabelText('Status for 1 Main St').every((select) => (select as HTMLSelectElement).value === 'occupied')).toBe(true);
  });

  it('rolls the property status back and shows an error when the save fails', async () => {
    let finish: (value: { data: unknown; error: unknown }) => void = () => undefined;
    setHandleWrite(() => new Promise((resolve) => {
      finish = resolve;
    }));
    const user = userEvent.setup();
    render(
      <>
        <ToastViewport />
        <Dashboard />
        <Properties />
      </>,
    );

    const select = screen.getAllByLabelText('Status for 1 Main St')[0] as HTMLSelectElement;
    await user.selectOptions(select, 'occupied');
    expect(select.value).toBe('occupied');
    expect(countButton('Occupied')).toHaveTextContent('1');

    finish({ data: null, error: { message: 'permission denied' } });
    await waitFor(() => expect(select.value).toBe('vacant'));
    expect(countButton('Occupied')).toHaveTextContent('0');
    expect(countButton('Vacant')).toHaveTextContent('1');
    expect(screen.getByRole('status')).toHaveTextContent(/previous value was restored/i);
    expect(screen.getByRole('status')).toHaveTextContent(/permission denied/i);
  });

  it('keeps the property form status select controlled, including switching back', async () => {
    const user = userEvent.setup();
    render(<Properties />);
    await user.click(await screen.findByRole('button', { name: 'Add Property' }));
    const status = screen.getByLabelText('Status *');
    expect(within(status).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Vacant',
      'Occupied',
      'Maintenance',
    ]);
    await user.selectOptions(status, 'maintenance');
    expect(status).toHaveValue('maintenance');
    await user.selectOptions(status, 'occupied');
    expect(status).toHaveValue('occupied');
    await user.selectOptions(status, 'vacant');
    expect(status).toHaveValue('vacant');
  });

  it('rolls back a rejected insert and shows the free-plan limit notice', async () => {
    setMockUser({ id: 'user-1' });
    let finish: (value: { data: unknown; error: unknown }) => void = () => undefined;
    setHandleWrite(() => new Promise((resolve) => {
      finish = resolve;
    }));
    const user = userEvent.setup();
    render(
      <>
        <ToastViewport />
        <PropertyCount />
        <PropertyForm onClose={() => undefined} />
      </>,
    );

    expect(screen.getByTestId('property-count')).toHaveTextContent('1');
    await user.type(screen.getByLabelText('Address *'), '9 Limit Lane');
    const submit = user.click(screen.getByRole('button', { name: 'Add Property' }));
    await waitFor(() => expect(screen.getByTestId('property-count')).toHaveTextContent('2'));
    expect(screen.queryByRole('heading', { name: 'Free plan property limit' })).not.toBeInTheDocument();

    finish({
      data: null,
      error: {
        message: 'Free accounts can have up to 5 properties. Upgrade to Lushlands Premium to add more.',
        hint: 'FREE_PROPERTY_LIMIT',
      },
    });

    await submit;
    await waitFor(() => expect(screen.getByTestId('property-count')).toHaveTextContent('1'));
    expect(screen.getByRole('heading', { name: 'Free plan property limit' })).toBeInTheDocument();
    expect(screen.getByText(/Free accounts can have up to 5 properties/)).toBeInTheDocument();
    expect(screen.queryByText(/Couldn't add the property/)).not.toBeInTheDocument();
    expect(screen.queryByText('9 Limit Lane')).not.toBeInTheDocument();
  });

  it('updates maintenance priority, status, counts, filters, and the open list together', async () => {
    echoWrites();
    maintenanceCollection.replaceAll([
      request(),
      request({
        id: 'req-2',
        description: 'Paint touch-up',
        priority: 'Low',
        status: 'Closed',
      }),
    ]);
    const user = userEvent.setup();
    render(<Maintenance />);

    expect(countButton('High Priority').textContent).toMatch(/1/);
    expect(screen.getByText('Open Requests').parentElement).toHaveTextContent('1');

    await user.selectOptions(screen.getByLabelText('Filter maintenance by status'), 'Closed');
    expect(screen.getByText('Paint touch-up')).toBeInTheDocument();
    expect(screen.queryByText('Leaky sink')).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Filter maintenance by status'), 'all');
    await user.selectOptions(screen.getByLabelText('Filter maintenance by priority'), 'Low');
    expect(screen.getByText('Paint touch-up')).toBeInTheDocument();
    expect(screen.queryByText('Leaky sink')).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Filter maintenance by priority'), 'all');

    const priority = screen.getAllByLabelText('Priority for Leaky sink')[0];
    expect(within(priority).getAllByRole('option').map((option) => option.textContent)).toEqual(['High', 'Medium', 'Low']);
    await user.selectOptions(priority, 'Low');
    await waitFor(() => expect(countButton('High Priority').textContent).toMatch(/0/));
    await user.selectOptions(screen.getAllByLabelText('Priority for Leaky sink')[0], 'High');
    await waitFor(() => expect(countButton('High Priority').textContent).toMatch(/1/));

    await user.click(countButton('High Priority'));
    expect(screen.getByRole('heading', { name: 'High Priority Maintenance Issues' })).toBeInTheDocument();
    const status = screen.getAllByLabelText('Status for Leaky sink').at(-1) as HTMLSelectElement;
    expect(within(status).getAllByRole('option').map((option) => option.textContent)).toEqual(['Open', 'In Progress', 'Closed']);
    await user.selectOptions(status, 'Closed');
    await waitFor(() => expect(screen.getAllByText('No maintenance requests found').length).toBeGreaterThan(0));
    expect(screen.getByText('Open Requests').parentElement).toHaveTextContent('0');
    expect(screen.getAllByLabelText('Status for Leaky sink').every((select) => (select as HTMLSelectElement).value === 'Closed')).toBe(true);

    await user.selectOptions(screen.getAllByLabelText('Status for Leaky sink')[0], 'Open');
    await waitFor(() => expect(screen.getByText('Open Requests').parentElement).toHaveTextContent('1'));
    expect(screen.getByRole('heading', { name: 'High Priority Maintenance Issues' })).toBeInTheDocument();
    expect(screen.getAllByText('Leaky sink').length).toBeGreaterThan(1);
  });

  it('filters payments immediately, including the derived overdue status', async () => {
    paymentsCollection.replaceAll([
      payment(),
      payment({
        id: 'pay-2',
        type: 'mortgage',
        status: 'paid',
        due_date: '2026-12-01',
        amount: 2000,
        tenants: { name: 'Grace Mortgage', email: 'grace@example.com', properties: { address: '2 Oak Ave' } },
      }),
    ]);
    const user = userEvent.setup();
    render(<Payments />);

    expect(screen.getByText('Ada Rent')).toBeInTheDocument();
    expect(screen.getByText('Grace Mortgage')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Filter payments by type'), 'mortgage');
    expect(screen.queryByText('Ada Rent')).not.toBeInTheDocument();
    expect(screen.getByText('Grace Mortgage')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Filter payments by type'), 'all');
    await user.selectOptions(screen.getByLabelText('Filter payments by status'), 'overdue');
    expect(screen.getByText('Ada Rent')).toBeInTheDocument();
    expect(screen.queryByText('Grace Mortgage')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Filter payments by status'), 'paid');
    expect(screen.queryByText('Ada Rent')).not.toBeInTheDocument();
    expect(screen.getByText('Grace Mortgage')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Send Payment Request' }));
    const type = screen.getByLabelText('Payment Type *');
    expect(within(type).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Rent',
      'Mortgage',
      'Maintenance',
    ]);
    await user.selectOptions(type, 'maintenance');
    expect(type).toHaveValue('maintenance');
    await user.selectOptions(type, 'rent');
    expect(type).toHaveValue('rent');
  });

  it('shows the live property status on the tenant card', async () => {
    echoWrites();
    tenantsCollection.replaceAll([tenant()]);
    const user = userEvent.setup();
    render(
      <>
        <Properties />
        <Tenants />
      </>,
    );

    expect(screen.getByLabelText('Property status Vacant')).toBeInTheDocument();
    await screen.findByLabelText('Status for 1 Main St');
    await user.selectOptions(screen.getByLabelText('Status for 1 Main St'), 'occupied');
    await waitFor(() => expect(screen.getByLabelText('Property status Occupied')).toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText('Status for 1 Main St'), 'maintenance');
    await waitFor(() => expect(screen.getByLabelText('Property status Maintenance')).toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText('Status for 1 Main St'), 'vacant');
    await waitFor(() => expect(screen.getByLabelText('Property status Vacant')).toBeInTheDocument());
  });
});
