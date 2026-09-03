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

