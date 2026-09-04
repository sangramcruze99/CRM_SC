'use server'
import { getTenantHeaders } from '@/lib/auth';

import { revalidatePath } from 'next/cache';

export async function createContact(formData: FormData) {
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const companyId = formData.get('companyId');

  try {
    await fetch('http://localhost:3001/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getTenantHeaders())
      },
      body: JSON.stringify({ firstName, lastName, email, phone, companyId })
    });
  } catch (err) {
    console.error('Failed to create contact:', err);
  }

  revalidatePath('/');
  revalidatePath('/contacts');
  revalidatePath('/dashboard');
}

export async function deleteContact(id: string) {
  try {
    await fetch(`http://localhost:3001/contacts/${id}`, {
      method: 'DELETE',
      headers: await getTenantHeaders()
    });
  } catch (err) {
    console.error('Failed to delete contact:', err);
  }

  revalidatePath('/');
  revalidatePath('/contacts');
  revalidatePath('/dashboard');
}

export async function createDeal(formData: FormData) {
  const title = formData.get('title');
  const amount = Number(formData.get('amount'));
  const stage = formData.get('stage');

  try {
    await fetch('http://localhost:3005/deals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getTenantHeaders())
      },
      body: JSON.stringify({ title, amount, stage })
    });
  } catch (err) {
    console.error('Failed to create deal:', err);
  }

  revalidatePath('/');
  revalidatePath('/deals');
  revalidatePath('/dashboard');
  revalidatePath('/forecast');
}

export async function updateDealStage(id: string, stage: string) {
  try {
    await fetch(`http://localhost:3005/deals/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(await getTenantHeaders())
      },
      body: JSON.stringify({ stage })
    });
  } catch (err) {
    console.error('Failed to update deal stage:', err);
  }

  revalidatePath('/');
  revalidatePath('/deals');
  revalidatePath('/dashboard');
  revalidatePath('/forecast');
}

export async function seedDemoDeals() {
  const sampleDeals = [
    { title: 'Global Fintech Cloud Expansion', amount: 145000, stage: 'Lead', priority: 'High', account: 'Stripe Alliance' },
    { title: 'AI OCR Document Automation Engine', amount: 68500, stage: 'Meeting Scheduled', priority: 'High', account: 'Acme Logistics' },
    { title: 'Enterprise Dual-Khata Multi-Tenant ERP', amount: 220000, stage: 'Proposal', priority: 'Critical', account: 'Apex Industrial' },
    { title: 'Hospital EHR & Triage Telemetry Suite', amount: 95000, stage: 'Contract Negotiation', priority: 'Medium', account: 'Metro Health Systems' },
    { title: 'Real Estate MLS Brokerage Hub', amount: 310000, stage: 'Closed Won', priority: 'High', account: 'Beacon Real Estate' },
    { title: 'Omnichannel B2B Messaging Infrastructure', amount: 52000, stage: 'Lead', priority: 'Medium', account: 'Pulse Media' },
    { title: 'Cybersecurity SOC Compliance Suite', amount: 84000, stage: 'Meeting Scheduled', priority: 'High', account: 'Sentinel Global' },
    { title: 'Automated Treasury & Ledger Sync', amount: 125000, stage: 'Closed Won', priority: 'Critical', account: 'Vanguard Capital' },
  ];

  try {
    const headers = await getTenantHeaders();
    for (const d of sampleDeals) {
      await fetch('http://localhost:3005/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(d)
      });
    }
  } catch (err) {
    console.error('Failed to seed demo deals:', err);
  }

  revalidatePath('/');
  revalidatePath('/deals');
  revalidatePath('/dashboard');
  revalidatePath('/forecast');
}

export async function deleteDeal(id: string) {
  try {
    await fetch(`http://localhost:3005/deals/${id}`, {
      method: 'DELETE',
      headers: await getTenantHeaders()
    });
  } catch (err) {
    console.error('Failed to delete deal:', err);
  }

  revalidatePath('/');
  revalidatePath('/deals');
  revalidatePath('/dashboard');
  revalidatePath('/forecast');
}

export async function createSprintTask(projectId: string, title: string, priority = 'MEDIUM') {
  try {
    const headers = await getTenantHeaders();
    await fetch(`http://localhost:3017/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ title, status: 'TODO', priority }),
    });
  } catch (err) {
    console.error('Failed to create sprint task:', err);
  }

  revalidatePath('/projects');
  revalidatePath('/dashboard');
}

export async function updateSprintTaskStatus(taskId: string, status: string) {
  try {
    const headers = await getTenantHeaders();
    await fetch(`http://localhost:3017/projects/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.error('Failed to update sprint task status:', err);
  }

  revalidatePath('/projects');
  revalidatePath('/dashboard');
}

export async function deleteSprintTask(taskId: string) {
  try {
    const headers = await getTenantHeaders();
    await fetch(`http://localhost:3017/projects/tasks/${taskId}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    console.error('Failed to delete sprint task:', err);
  }

  revalidatePath('/projects');
  revalidatePath('/dashboard');
}

export async function seedDemoSprintTasks(projectId: string) {
  const sampleTasks = [
    { title: 'Architect Zero-Touch OCR Extraction Pipeline', priority: 'URGENT', status: 'TODO' },
    { title: 'Integrate Apollo Lead Engine GraphQL Sync', priority: 'HIGH', status: 'TODO' },
    { title: 'Refactor Dual Khata Ledger Double-Entry Rules', priority: 'MEDIUM', status: 'IN_PROGRESS' },
    { title: 'Implement Botanical Glass Design Tokens & UI', priority: 'HIGH', status: 'IN_PROGRESS' },
    { title: 'Audit SOC-2 Multi-Tenant Data Isolation Guards', priority: 'URGENT', status: 'REVIEW' },
    { title: 'Simulate High-Throughput Webhook Event Ingestion', priority: 'MEDIUM', status: 'REVIEW' },
    { title: 'Deploy PostgreSQL Read Replicas & Connection Pooling', priority: 'HIGH', status: 'DONE' },
    { title: 'Finalize Mobile Dock Navigation & Gestures', priority: 'MEDIUM', status: 'DONE' },
  ];

  try {
    const headers = await getTenantHeaders();
    for (const t of sampleTasks) {
      await fetch(`http://localhost:3017/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(t),
      });
    }
  } catch (err) {
    console.error('Failed to seed demo sprint tasks:', err);
  }

  revalidatePath('/projects');
  revalidatePath('/dashboard');
}

export async function createInvoice(formData: FormData) {
  const amount = parseFloat(formData.get('amount') as string);
  const clientName = (formData.get('clientName') as string) || 'Commercial Client';

  try {
    await fetch('http://localhost:3015/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getTenantHeaders()),
      },
      body: JSON.stringify({ amount, clientName }),
    });
  } catch (err) {
    console.error('Failed to create invoice:', err);
  }

  revalidatePath('/invoices');
  revalidatePath('/dashboard');
}

export async function updateInvoiceStatus(id: string, status: string) {
  try {
    const headers = await getTenantHeaders();
    await fetch(`http://localhost:3015/invoices/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.error('Failed to update invoice status:', err);
  }

  revalidatePath('/invoices');
  revalidatePath('/dashboard');
}

export async function seedDemoInvoices() {
  const sampleInvoices = [
    {
      amount: 48290.00,
      clientName: 'Stripe Alliance International',
      status: 'PAID',
      dueDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      lineItems: [
        { description: 'Enterprise Multi-Region Cloud License (Annual)', quantity: 1, unitPrice: 38290.00, total: 38290.00 },
        { description: 'Dedicated Solution Architect & 24/7 SLA', quantity: 1, unitPrice: 10000.00, total: 10000.00 },
      ]
    },
    {
      amount: 14280.00,
      clientName: 'Acme Global Logistics',
      status: 'SENT',
      dueDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
      lineItems: [
        { description: 'Zero-Touch Neural OCR Document Scanner Add-on', quantity: 12, unitPrice: 1190.00, total: 14280.00 },
      ]
    },
    {
      amount: 72500.00,
      clientName: 'Apex Industrial Holdings',
      status: 'SENT',
      dueDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      lineItems: [
        { description: 'Dual-Khata Multi-Tenant ERP Core Integration', quantity: 1, unitPrice: 72500.00, total: 72500.00 },
      ]
    },
    {
      amount: 28400.00,
      clientName: 'Beacon Real Estate Trust',
      status: 'PAID',
      dueDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
      lineItems: [
        { description: 'MLS Brokerage Sync & Escrow Pipeline Module', quantity: 1, unitPrice: 28400.00, total: 28400.00 },
      ]
    },
    {
      amount: 9800.00,
      clientName: 'Pulse Media Labs',
      status: 'OVERDUE',
      dueDate: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
      lineItems: [
        { description: 'Omnichannel Social Media Marketing Engine', quantity: 1, unitPrice: 9800.00, total: 9800.00 },
      ]
    },
    {
      amount: 19500.00,
      clientName: 'Sentinel Cyber Systems',
      status: 'DRAFT',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      lineItems: [
        { description: 'SOC-2 Compliance & Audit Trail Instrumentation', quantity: 1, unitPrice: 19500.00, total: 19500.00 },
      ]
    },
  ];

  try {
    const headers = await getTenantHeaders();
    for (const inv of sampleInvoices) {
      await fetch('http://localhost:3015/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(inv),
      });
    }
  } catch (err) {
    console.error('Failed to seed demo invoices:', err);
  }

  revalidatePath('/invoices');
  revalidatePath('/dashboard');
}

export async function deleteInvoice(id: string) {
  try {
    await fetch(`http://localhost:3015/invoices/${id}`, {
      method: 'DELETE',
      headers: await getTenantHeaders()
    });
  } catch (err) {
    console.error('Failed to delete invoice:', err);
  }

  revalidatePath('/invoices');
  revalidatePath('/dashboard');
}

export async function createProjectTask(formData: FormData) {
  const title = formData.get('title') as string;
  const status = (formData.get('status') as string) || 'TODO';

  try {
    await fetch('http://localhost:3017/projects/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getTenantHeaders()),
      },
      body: JSON.stringify({ title, status }),
    });
  } catch (err) {
    console.error('Failed to create task:', err);
  }

  revalidatePath('/projects');
  revalidatePath('/dashboard');
}

export async function deleteTask(id: string) {
  try {
    await fetch(`http://localhost:3017/projects/tasks/${id}`, {
      method: 'DELETE',
      headers: await getTenantHeaders()
    });
  } catch (err) {
    console.error('Failed to delete task:', err);
  }

  revalidatePath('/projects');
  revalidatePath('/dashboard');
}

export async function deleteTicket(id: string) {
  try {
    await fetch(`http://localhost:3016/tickets/${id}`, {
      method: 'DELETE',
      headers: await getTenantHeaders()
    });
  } catch (err) {
    console.error('Failed to delete ticket:', err);
  }

  revalidatePath('/tickets');
  revalidatePath('/dashboard');
}

export async function executeBatchMigration(sourceCrm: string, records: { contacts?: any[], deals?: any[], invoices?: any[] }) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getTenantHeaders()),
  };

  let importedContacts = 0;
  let importedDeals = 0;
  let importedInvoices = 0;

  if (records.contacts && records.contacts.length > 0) {
    for (const contact of records.contacts) {
      try {
        await fetch('http://localhost:3001/contacts', {
          method: 'POST',
          headers,
          body: JSON.stringify(contact),
        });
        importedContacts++;
      } catch (err) {
        console.error('Error importing contact:', err);
      }
    }
  }

  if (records.deals && records.deals.length > 0) {
    for (const deal of records.deals) {
      try {
        await fetch('http://localhost:3005/deals', {
          method: 'POST',
          headers,
          body: JSON.stringify(deal),
        });
        importedDeals++;
      } catch (err) {
        console.error('Error importing deal:', err);
      }
    }
  }

  if (records.invoices && records.invoices.length > 0) {
    for (const invoice of records.invoices) {
      try {
        await fetch('http://localhost:3015/invoices', {
          method: 'POST',
          headers,
          body: JSON.stringify(invoice),
        });
        importedInvoices++;
      } catch (err) {
        console.error('Error importing invoice:', err);
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/contacts');
  revalidatePath('/deals');
  revalidatePath('/invoices');
  revalidatePath('/dashboard');
  revalidatePath('/forecast');

  return {
    success: true,
    sourceCrm,
    importedContacts,
    importedDeals,
    importedInvoices,
    totalRecords: importedContacts + importedDeals + importedInvoices,
  };
}

