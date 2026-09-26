'use server'
import { getTenantHeaders } from '@/lib/auth';
import { saveContactToStore, deleteContactFromStore } from '@/lib/nicheStorage';

import { revalidatePath } from 'next/cache';

export async function createContact(formData: FormData) {
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const companyId = formData.get('companyId');
  const folderName = formData.get('folderName');

  const customObj: Record<string, any> = {};
  if (folderName && String(folderName).trim()) {
    customObj.folderName = String(folderName).trim();
    customObj.importedAt = new Date().toISOString();
  }

  const contactPayload = {
    firstName: String(firstName || ''),
    lastName: String(lastName || ''),
    email: String(email || ''),
    phone: String(phone || ''),
    companyId: String(companyId || ''),
    customData: JSON.stringify(customObj),
  };

  try {
    const res = await fetch('http://localhost:3001/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getTenantHeaders())
      },
      body: JSON.stringify(contactPayload)
    });
    if (!res.ok) {
      saveContactToStore(contactPayload);
    }
  } catch (err) {
    saveContactToStore(contactPayload);
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
    deleteContactFromStore(id);
  }
  deleteContactFromStore(id);

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
  // Purged for clean production empty state
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
  // Purged for clean production empty state
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
  // Purged for clean production empty state
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

export async function executeBatchMigration(
  sourceCrm: string,
  records: { contacts?: any[], deals?: any[], invoices?: any[] },
  folderName?: string
) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getTenantHeaders()),
  };

  const finalFolder = folderName?.trim() || `${sourceCrm} Migration`;
  const batchId = `mig_${Date.now()}`;

  let importedContacts = 0;
  let importedDeals = 0;
  let importedInvoices = 0;

  if (records.contacts && records.contacts.length > 0) {
    for (const contact of records.contacts) {
      try {
        let existingCustom: Record<string, any> = {};
        if (contact.customData) {
          try {
            existingCustom = typeof contact.customData === 'string' ? JSON.parse(contact.customData) : contact.customData;
          } catch {}
        }
        const customObj = {
          ...existingCustom,
          folderName: finalFolder,
          batchId,
          sourceCrm,
          importedAt: new Date().toISOString(),
        };

        await fetch('http://localhost:3001/contacts', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...contact,
            customData: JSON.stringify(customObj),
          }),
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

export interface ArrangedLeadPayload {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyId?: string;
  customData?: string;
}

export async function importArrangedLeads(leads: ArrangedLeadPayload[]) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getTenantHeaders()),
  };

  let importedCount = 0;
  for (const lead of leads) {
    try {
      const res = await fetch('http://localhost:3001/contacts', {
        method: 'POST',
        headers,
        body: JSON.stringify(lead),
      });
      if (res.ok) {
        importedCount++;
      } else {
        saveContactToStore(lead);
        importedCount++;
      }
    } catch (err) {
      saveContactToStore(lead);
      importedCount++;
    }
  }

  revalidatePath('/');
  revalidatePath('/contacts');
  revalidatePath('/dashboard');

  return {
    success: true,
    importedCount,
    totalAttempted: leads.length,
  };
}

export async function deleteBatchContacts(contactIds: string[]) {
  const headers = await getTenantHeaders();
  let deletedCount = 0;
  for (const id of contactIds) {
    try {
      await fetch(`http://localhost:3001/contacts/${id}`, {
        method: 'DELETE',
        headers,
      });
      deletedCount++;
    } catch (err) {
      deleteContactFromStore(id);
      deletedCount++;
    }
    deleteContactFromStore(id);
  }

  revalidatePath('/');
  revalidatePath('/contacts');
  revalidatePath('/dashboard');

  return { success: true, deletedCount };
}

export async function renameBatchFolder(oldFolderName: string, newFolderName: string) {
  const headers = await getTenantHeaders();
  const trimmedNew = newFolderName.trim();
  if (!trimmedNew) return { success: false, message: 'Folder name cannot be empty' };

  try {
    const res = await fetch('http://localhost:3001/contacts', {
      headers,
      cache: 'no-store',
    });
    if (res.ok) {
      const contacts = await res.json();
      for (const c of contacts) {
        let customObj: Record<string, any> = {};
        try {
          customObj = typeof c.customData === 'string' ? JSON.parse(c.customData || '{}') : (c.customData || {});
        } catch {}

        if (customObj.folderName === oldFolderName || (!customObj.folderName && customObj.batchFileName === oldFolderName)) {
          customObj.folderName = trimmedNew;
          await fetch(`http://localhost:3001/contacts/${c.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: JSON.stringify({
              customData: JSON.stringify(customObj),
            }),
          });
        }
      }
    }
  } catch (err) {
    console.error('Error renaming folder:', err);
  }

  revalidatePath('/');
  revalidatePath('/contacts');
  return { success: true, newFolderName: trimmedNew };
}

export async function moveContactsToFolder(contactIds: string[], folderName: string) {
  const headers = await getTenantHeaders();
  const trimmed = folderName.trim();
  if (!trimmed) return { success: false };

  for (const id of contactIds) {
    try {
      const getRes = await fetch(`http://localhost:3001/contacts/${id}`, { headers });
      if (getRes.ok) {
        const contact = await getRes.json();
        let customObj: Record<string, any> = {};
        try {
          customObj = typeof contact.customData === 'string' ? JSON.parse(contact.customData || '{}') : (contact.customData || {});
        } catch {}
        customObj.folderName = trimmed;

        await fetch(`http://localhost:3001/contacts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({
            customData: JSON.stringify(customObj),
          }),
        });
      }
    } catch (err) {
      console.error('Error moving contact to folder:', err);
    }
  }

  revalidatePath('/');
  revalidatePath('/contacts');
  return { success: true, folderName: trimmed };
}

export async function removeFolderFromContacts(contactIds: string[]) {
  const headers = await getTenantHeaders();

  for (const id of contactIds) {
    try {
      const getRes = await fetch(`http://localhost:3001/contacts/${id}`, { headers });
      if (getRes.ok) {
        const contact = await getRes.json();
        let customObj: Record<string, any> = {};
        try {
          customObj = typeof contact.customData === 'string' ? JSON.parse(contact.customData || '{}') : (contact.customData || {});
        } catch {}
        delete customObj.folderName;
        delete customObj.batchFileName;

        await fetch(`http://localhost:3001/contacts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({
            customData: JSON.stringify(customObj),
          }),
        });
      }
    } catch (err) {
      console.error('Error removing contact from folder:', err);
    }
  }

  revalidatePath('/');
  revalidatePath('/contacts');
  return { success: true };
}

export async function deleteFolderOnly(folderName: string) {
  const headers = await getTenantHeaders();
  try {
    const res = await fetch('http://localhost:3001/contacts', {
      headers,
      cache: 'no-store',
    });
    if (res.ok) {
      const contacts = await res.json();
      for (const c of contacts) {
        let customObj: Record<string, any> = {};
        try {
          customObj = typeof c.customData === 'string' ? JSON.parse(c.customData || '{}') : (c.customData || {});
        } catch {}

        if (customObj.folderName === folderName || (!customObj.folderName && customObj.batchFileName === folderName)) {
          delete customObj.folderName;
          delete customObj.batchFileName;

          await fetch(`http://localhost:3001/contacts/${c.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: JSON.stringify({
              customData: JSON.stringify(customObj),
            }),
          });
        }
      }
    }
  } catch (err) {
    console.error('Error deleting folder only:', err);
  }

  revalidatePath('/');
  revalidatePath('/contacts');
  return { success: true };
}

export async function createCrmActivity(data: {
  type: string;
  title: string;
  content: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
}) {
  try {
    const headers = await getTenantHeaders();
    const res = await fetch('http://localhost:3001/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      revalidatePath('/contacts');
      return created;
    }
  } catch (err) {
    console.error('Failed to create CRM activity:', err);
  }
  return null;
}



