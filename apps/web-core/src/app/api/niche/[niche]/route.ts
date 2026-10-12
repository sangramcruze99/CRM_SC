// apps/web-core/src/app/api/niche/[niche]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  readStore,
  writeStore,
  logNicheAudit,
  logNicheAuditAsync,
  emitNicheAutomationEvent,
  getScopedNicheData,
  getScopedNicheDataAsync,
  getScopedAuditLogs,
  getScopedAuditLogsAsync,
  saveNicheEntityAsync,
  deleteNicheEntityAsync,
  NicheStoreData,
} from '@/lib/nicheStorage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ niche: string }> }
) {
  const { niche } = await params;
  const tenantId = req.headers.get('x-tenant-id') || req.nextUrl.searchParams.get('tenantId') || 'default-tenant';
  const scopedData = await getScopedNicheDataAsync(niche, tenantId);
  const auditLogs = await getScopedAuditLogsAsync(tenantId);
  const store = readStore();

  if (niche === 'hospital') {
    const data = scopedData || store.hospital;
    const occupiedBeds = data.patients.length;
    const totalBeds = data.totalBeds || 165;
    const occupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(1);
    const criticalPatients = data.patients.filter((p: any) => p.triageLevel === 'CRITICAL').length;

    return NextResponse.json({
      success: true,
      niche,
      tenantId,
      data,
      metrics: {
        totalBeds,
        occupiedBeds,
        occupancyRate: `${occupancyRate}%`,
        activeErQueue: criticalPatients,
        todayAppointments: data.appointments.length,
        prescriptionsIssued: data.prescriptions.length,
      },
      auditLogs,
    });
  }

  if (niche === 'realestate') {
    const data = scopedData || store.realestate;
    const totalVolume = data.properties.reduce((acc: number, p: any) => acc + (p.price || 0), 0);
    const pendingDealsVolume = data.deals.reduce((acc: number, d: any) => acc + (d.offerAmount || 0), 0);
    const totalCommissions = data.deals.reduce((acc: number, d: any) => acc + (d.commissionAmount || 0), 0);

    return NextResponse.json({
      success: true,
      niche,
      tenantId,
      data,
      metrics: {
        activeListingsCount: data.properties.length,
        totalListingVolume: totalVolume,
        pendingDealsCount: data.deals.length,
        pendingDealsVolume,
        totalCommissions,
        scheduledShowings: data.showings.length,
      },
      auditLogs,
    });
  }

  if (niche === 'restaurant') {
    const data = scopedData || store.restaurant;
    const occupiedTables = data.tables.filter((t: any) => t.status === 'OCCUPIED');
    const grossSales = occupiedTables.reduce((acc: number, t: any) => acc + (t.billTotal || 0), 0);
    const pendingOrders = data.kitchenOrders.filter((k: any) => k.status === 'PREPARING').length;

    return NextResponse.json({
      success: true,
      niche,
      tenantId,
      data,
      metrics: {
        totalTables: data.tables.length,
        occupiedTablesCount: occupiedTables.length,
        liveGrossSales: grossSales,
        pendingKitchenTickets: pendingOrders,
        lowParStockItems: data.menuItems.filter((m: any) => m.currentStock <= m.parLevel).length,
      },
      auditLogs,
    });
  }

  if (niche === 'retail') {
    const data = scopedData || store.retail;
    const totalSalesRevenue = data.sales.reduce((acc: number, s: any) => acc + (s.totalAmount || 0), 0);
    const totalKhataOutstanding = data.khataCustomers.reduce((acc: number, c: any) => acc + (c.totalCreditDue || 0), 0);

    return NextResponse.json({
      success: true,
      niche,
      tenantId,
      data,
      metrics: {
        totalProducts: data.catalogProducts.length,
        todayReceiptsCount: data.sales.length,
        totalSalesRevenue,
        khataOutstandingDues: totalKhataOutstanding,
        lowStockSkus: data.catalogProducts.filter((p: any) => p.stock < 15).length,
      },
      auditLogs,
    });
  }

  if (niche === 'sme') {
    const data = scopedData || store.sme;
    const totalMrr = data.subscriptions.reduce((acc: number, s: any) => acc + (s.mrr || 0), 0);

    return NextResponse.json({
      success: true,
      niche,
      tenantId,
      data,
      metrics: {
        activeSubscriptionsCount: data.subscriptions.length,
        totalMrr,
        annualizedRunRate: totalMrr * 12,
      },
      auditLogs,
    });
  }

  if (niche === 'agency') {
    const data = scopedData || store.agency;
    const totalRetainers = data.deliverables.reduce((acc: number, d: any) => acc + (d.retainerAmount || 0), 0);

    return NextResponse.json({
      success: true,
      niche,
      tenantId,
      data,
      metrics: {
        activeSprintsCount: data.deliverables.length,
        totalRetainerValue: totalRetainers,
        inReviewDeliverables: data.deliverables.filter((d: any) => d.status === 'IN_REVIEW').length,
      },
      auditLogs,
    });
  }

  if (scopedData && scopedData.records) {
    const records = scopedData.records;
    return NextResponse.json({
      success: true,
      niche,
      tenantId,
      data: {
        records,
      },
      metrics: {
        totalRecords: records.length,
        activeRecords: records.filter((r: any) => !['Completed', 'Delivered', 'Ready', 'Cancelled'].includes(r.status)).length,
      },
      auditLogs,
    });
  }

  return NextResponse.json({
    success: true,
    niche,
    tenantId,
    data: scopedData || store,
    auditLogs,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ niche: string }> }
) {
  const { niche } = await params;
  const store = readStore();
  const tenantId = req.headers.get('x-tenant-id') || 'default-tenant';

  try {
    const body = await req.json();
    const { action, payload } = body;

    // 1. HOSPITAL ACTIONS
    if (niche === 'hospital') {
      if (action === 'admit_patient') {
        const newPatient = {
          id: payload.id || `PT-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`,
          tenantId,
          name: payload.name,
          age: parseInt(payload.age) || 30,
          gender: payload.gender || 'Other',
          department: payload.department || 'General Medicine',
          attendingPhysician: payload.attendingPhysician || 'Dr. On-Duty Specialist',
          triageLevel: payload.triageLevel || 'URGENT',
          roomNumber: payload.roomNumber || 'Ward Bed 01',
          admitDate: new Date().toISOString().split('T')[0],
          insuranceStatus: payload.insuranceStatus || 'VERIFIED',
          notes: payload.notes || 'Inpatient admission registered',
        };
        store.hospital.patients.unshift(newPatient);
        await saveNicheEntityAsync(tenantId, 'hospital', 'patient', newPatient.id, newPatient);
        logNicheAudit(tenantId, 'hospital', 'ADMIT_PATIENT', 'Patient', newPatient.id, `Admitted patient ${newPatient.name} to ${newPatient.roomNumber}`, store);
        await logNicheAuditAsync(tenantId, 'hospital', 'ADMIT_PATIENT', 'Patient', newPatient.id, `Admitted patient ${newPatient.name} to ${newPatient.roomNumber}`);
        writeStore(store);
        emitNicheAutomationEvent('hospital', 'ADMIT_PATIENT', newPatient, tenantId);
        return NextResponse.json({ success: true, record: newPatient });
      }

      if (action === 'book_appointment') {
        const newAppt = {
          id: payload.id || `APT-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`,
          tenantId,
          patient: payload.patient,
          time: payload.time || '10:00 AM',
          doctor: payload.doctor || 'Dr. Specialist',
          type: payload.type || 'Clinical Consultation',
          status: 'CONFIRMED' as const,
        };
        store.hospital.appointments.unshift(newAppt);
        await saveNicheEntityAsync(tenantId, 'hospital', 'appointment', newAppt.id, newAppt);
        logNicheAudit(tenantId, 'hospital', 'SCHEDULE_APPOINTMENT', 'Appointment', newAppt.id, `Scheduled consultation for ${newAppt.patient}`, store);
        await logNicheAuditAsync(tenantId, 'hospital', 'SCHEDULE_APPOINTMENT', 'Appointment', newAppt.id, `Scheduled consultation for ${newAppt.patient}`);
        writeStore(store);
        return NextResponse.json({ success: true, record: newAppt });
      }

      if (action === 'issue_prescription') {
        const newRx = {
          id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
          tenantId,
          patientName: payload.patientName,
          ehrRecordId: payload.ehrRecordId || 'EHR-88902',
          diagnosis: payload.diagnosis || 'Clinical Diagnosis',
          medications: payload.medications || [],
          date: new Date().toISOString().split('T')[0],
          prescribedBy: payload.prescribedBy || 'Attending Physician',
        };
        store.hospital.prescriptions.unshift(newRx);
        await saveNicheEntityAsync(tenantId, 'hospital', 'prescription', newRx.id, newRx);
        logNicheAudit(tenantId, 'hospital', 'ISSUE_PRESCRIPTION', 'Prescription', newRx.id, `Signed prescription for ${newRx.patientName}`, store);
        await logNicheAuditAsync(tenantId, 'hospital', 'ISSUE_PRESCRIPTION', 'Prescription', newRx.id, `Signed prescription for ${newRx.patientName}`);
        writeStore(store);
        return NextResponse.json({ success: true, record: newRx });
      }
    }

    // 2. REAL ESTATE ACTIONS
    if (niche === 'realestate') {
      if (action === 'create_property') {
        const newProp = {
          id: `PROP-${Math.floor(705 + Math.random() * 50)}`,
          tenantId,
          title: payload.title,
          address: payload.address || 'Beverly Hills, CA',
          price: parseFloat(payload.price) || 1500000,
          type: payload.type || 'SINGLE_FAMILY',
          beds: parseInt(payload.beds) || 3,
          baths: parseFloat(payload.baths) || 2,
          sqft: parseInt(payload.sqft) || 2500,
          status: 'ACTIVE' as const,
          imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
          matchedBuyers: Math.floor(4 + Math.random() * 15),
          agent: payload.agent || 'Broker On Duty',
        };
        store.realestate.properties.unshift(newProp);
        await saveNicheEntityAsync(tenantId, 'realestate', 'property', newProp.id, newProp);
        logNicheAudit(tenantId, 'realestate', 'CREATE_PROPERTY', 'Property', newProp.id, `Created MLS listing ${newProp.title} at $${newProp.price.toLocaleString()}`);
        await logNicheAuditAsync(tenantId, 'realestate', 'CREATE_PROPERTY', 'Property', newProp.id, `Created MLS listing ${newProp.title} at $${newProp.price.toLocaleString()}`);
        writeStore(store);
        emitNicheAutomationEvent('realestate', 'CREATE_PROPERTY', newProp, tenantId);
        return NextResponse.json({ success: true, record: newProp });
      }

      if (action === 'book_showing') {
        const newShowing = {
          id: `SHOW-${Math.floor(10 + Math.random() * 90)}`,
          tenantId,
          propertyId: payload.propertyId || 'PROP-701',
          propertyTitle: payload.propertyTitle || 'Property Showing',
          buyerName: payload.buyerName || 'Prospective Buyer',
          date: payload.date || new Date().toISOString().split('T')[0],
          time: payload.time || '14:00',
          status: 'SCHEDULED' as const,
        };
        store.realestate.showings.unshift(newShowing);
        await saveNicheEntityAsync(tenantId, 'realestate', 'showing', newShowing.id, newShowing);
        logNicheAudit(tenantId, 'realestate', 'BOOK_SHOWING', 'Showing', newShowing.id, `Scheduled showing for ${newShowing.buyerName}`, store);
        await logNicheAuditAsync(tenantId, 'realestate', 'BOOK_SHOWING', 'Showing', newShowing.id, `Scheduled showing for ${newShowing.buyerName}`);
        writeStore(store);
        emitNicheAutomationEvent('realestate', 'BOOK_SHOWING', newShowing, tenantId);
        return NextResponse.json({ success: true, record: newShowing });
      }

      if (action === 'open_escrow') {
        const newDeal = {
          id: `ESC-${Math.floor(400 + Math.random() * 100)}`,
          tenantId,
          propertyTitle: payload.propertyTitle,
          buyerName: payload.buyerName,
          offerAmount: parseFloat(payload.offerAmount) || 2000000,
          stage: 'IN_ESCROW' as const,
          closingDate: payload.closingDate || '2026-10-31',
          commissionAmount: (parseFloat(payload.offerAmount) || 2000000) * 0.03,
        };
        store.realestate.deals.unshift(newDeal);
        await saveNicheEntityAsync(tenantId, 'realestate', 'deal', newDeal.id, newDeal);
        logNicheAudit(tenantId, 'realestate', 'OPEN_ESCROW', 'Deal', newDeal.id, `Opened escrow on ${newDeal.propertyTitle} for $${newDeal.offerAmount.toLocaleString()}`);
        await logNicheAuditAsync(tenantId, 'realestate', 'OPEN_ESCROW', 'Deal', newDeal.id, `Opened escrow on ${newDeal.propertyTitle} for $${newDeal.offerAmount.toLocaleString()}`);
        writeStore(store);
        emitNicheAutomationEvent('realestate', 'OPEN_ESCROW', newDeal, tenantId);
        return NextResponse.json({ success: true, record: newDeal });
      }
    }

    // 3. RESTAURANT ACTIONS
    if (niche === 'restaurant') {
      if (action === 'seat_table') {
        const tableIndex = store.restaurant.tables.findIndex((t) => t.id === payload.tableId);
        if (tableIndex !== -1) {
          store.restaurant.tables[tableIndex] = {
            ...store.restaurant.tables[tableIndex],
            tenantId,
            status: 'OCCUPIED',
            guestName: payload.guestName || 'Walk-In Guests',
            server: payload.server || 'Floor Captain',
            seatedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            billTotal: 0,
          };
          const updatedTable = store.restaurant.tables[tableIndex];
          await saveNicheEntityAsync(tenantId, 'restaurant', 'table', updatedTable.id, updatedTable);
          logNicheAudit(tenantId, 'restaurant', 'SEAT_TABLE', 'Table', payload.tableId, `Seated party ${payload.guestName} at table ${updatedTable.number}`);
          await logNicheAuditAsync(tenantId, 'restaurant', 'SEAT_TABLE', 'Table', payload.tableId, `Seated party ${payload.guestName} at table ${updatedTable.number}`);
          writeStore(store);
          return NextResponse.json({ success: true, record: updatedTable });
        }
      }

      if (action === 'create_kitchen_order') {
        const newKOT = {
          id: `KOT-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`,
          tenantId,
          tableId: payload.tableId,
          tableNumber: payload.tableNumber,
          items: payload.items || [],
          placedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'PREPARING' as const,
          waiter: payload.waiter || 'Server',
        };
        store.restaurant.kitchenOrders.unshift(newKOT);
        await saveNicheEntityAsync(tenantId, 'restaurant', 'kitchenOrder', newKOT.id, newKOT);

        // Also update table bill total
        const orderTotal = (payload.items || []).reduce((acc: number, item: any) => acc + (item.price || 25) * (item.qty || 1), 0);
        const table = store.restaurant.tables.find((t) => t.id === payload.tableId);
        if (table) {
          table.billTotal += orderTotal;
          table.tenantId = tenantId;
          await saveNicheEntityAsync(tenantId, 'restaurant', 'table', table.id, table);
        }
        logNicheAudit(tenantId, 'restaurant', 'CREATE_KOT', 'KitchenOrder', newKOT.id, `Sent ${newKOT.items.length} items to kitchen for ${newKOT.tableNumber}`, store);
        await logNicheAuditAsync(tenantId, 'restaurant', 'CREATE_KOT', 'KitchenOrder', newKOT.id, `Sent ${newKOT.items.length} items to kitchen for ${newKOT.tableNumber}`);
        writeStore(store);
        emitNicheAutomationEvent('restaurant', 'CREATE_KOT', newKOT, tenantId);
        return NextResponse.json({ success: true, record: newKOT });
      }

      if (action === 'update_table_status') {
        const tableIndex = store.restaurant.tables.findIndex((t) => t.id === payload.tableId);
        if (tableIndex !== -1) {
          store.restaurant.tables[tableIndex] = {
            ...store.restaurant.tables[tableIndex],
            tenantId,
            status: payload.status,
            guestName: payload.guestName !== undefined ? payload.guestName : store.restaurant.tables[tableIndex].guestName,
            billTotal: payload.currentBill !== undefined ? payload.currentBill : store.restaurant.tables[tableIndex].billTotal,
          };
          const updatedTable = store.restaurant.tables[tableIndex];
          await saveNicheEntityAsync(tenantId, 'restaurant', 'table', updatedTable.id, updatedTable);
          logNicheAudit(tenantId, 'restaurant', 'UPDATE_TABLE_STATUS', 'Table', payload.tableId, `Updated table ${updatedTable.number} status to ${payload.status}`);
          await logNicheAuditAsync(tenantId, 'restaurant', 'UPDATE_TABLE_STATUS', 'Table', payload.tableId, `Updated table ${updatedTable.number} status to ${payload.status}`);
          writeStore(store);
          emitNicheAutomationEvent('restaurant', 'UPDATE_TABLE_STATUS', updatedTable, tenantId);
          return NextResponse.json({ success: true, record: updatedTable });
        }
      }

      if (action === 'mark_order_ready') {
        const order = store.restaurant.kitchenOrders.find((k) => k.id === payload.orderId);
        if (order) {
          order.status = 'READY';
          await saveNicheEntityAsync(tenantId, 'restaurant', 'kitchenOrder', order.id, order);
          logNicheAudit(tenantId, 'restaurant', 'ORDER_READY', 'KitchenOrder', order.id, `Marked order ${order.id} for ${order.tableNumber} as READY`, store);
          await logNicheAuditAsync(tenantId, 'restaurant', 'ORDER_READY', 'KitchenOrder', order.id, `Marked order ${order.id} for ${order.tableNumber} as READY`);
          writeStore(store);
          emitNicheAutomationEvent('restaurant', 'ORDER_READY', order, tenantId);
          return NextResponse.json({ success: true, record: order });
        }
      }
    }

    // 4. RETAIL ACTIONS
    if (niche === 'retail') {
      if (action === 'pos_checkout') {
        const newSale = {
          id: `POS-${Math.floor(890 + Math.random() * 100)}`,
          tenantId,
          receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          items: payload.items || [],
          totalAmount: parseFloat(payload.totalAmount) || 0,
          paymentMethod: payload.paymentMethod || 'CARD',
          customerName: payload.customerName || 'Walk-In Customer',
        };
        store.retail.sales.unshift(newSale);
        await saveNicheEntityAsync(tenantId, 'retail', 'sale', newSale.id, newSale);
        
        // Decrement product inventory
        for (const item of (payload.items || [])) {
          const product = store.retail.catalogProducts.find((p) => p.name === item.name);
          if (product) {
            product.stock = Math.max(0, product.stock - (item.qty || 1));
            product.tenantId = tenantId;
            await saveNicheEntityAsync(tenantId, 'retail', 'catalogProduct', product.id, product);
          }
        }

        // If KHATA credit, update customer credit ledger
        if (payload.paymentMethod === 'KHATA_CREDIT' && payload.customerId) {
          const khataCust = store.retail.khataCustomers.find((c) => c.id === payload.customerId);
          if (khataCust) {
            khataCust.tenantId = tenantId;
            khataCust.totalCreditDue += newSale.totalAmount;
            khataCust.lastPurchaseDate = new Date().toISOString().split('T')[0];
            await saveNicheEntityAsync(tenantId, 'retail', 'khataCustomer', khataCust.id, khataCust);
          }
        }

        logNicheAudit(tenantId, 'retail', 'POS_CHECKOUT', 'Sale', newSale.id, `Completed sale ${newSale.receiptNumber} totaling $${newSale.totalAmount.toFixed(2)} via ${newSale.paymentMethod}`);
        await logNicheAuditAsync(tenantId, 'retail', 'POS_CHECKOUT', 'Sale', newSale.id, `Completed sale ${newSale.receiptNumber} totaling $${newSale.totalAmount.toFixed(2)} via ${newSale.paymentMethod}`);
        writeStore(store);
        emitNicheAutomationEvent('retail', 'POS_CHECKOUT', newSale, tenantId);
        return NextResponse.json({ success: true, record: newSale, updatedCatalog: store.retail.catalogProducts });
      }

      if (action === 'add_khata_credit') {
        const customer = store.retail.khataCustomers.find((c) => c.id === payload.customerId);
        if (customer) {
          const amount = parseFloat(payload.amount) || 0;
          customer.tenantId = tenantId;
          customer.totalCreditDue += amount;
          customer.lastPurchaseDate = new Date().toISOString().split('T')[0];
          await saveNicheEntityAsync(tenantId, 'retail', 'khataCustomer', customer.id, customer);
          logNicheAudit(tenantId, 'retail', 'KHATA_CREDIT', 'KhataCustomer', customer.id, `Added $${amount.toFixed(2)} credit to khata ledger for ${customer.name}`);
          await logNicheAuditAsync(tenantId, 'retail', 'KHATA_CREDIT', 'KhataCustomer', customer.id, `Added $${amount.toFixed(2)} credit to khata ledger for ${customer.name}`);
          writeStore(store);
          emitNicheAutomationEvent('retail', 'KHATA_CREDIT', customer, tenantId);
          return NextResponse.json({ success: true, record: customer });
        }
      }

      if (action === 'add_product') {
        const newProduct = {
          id: payload.id || `sku_${Date.now()}`,
          tenantId,
          name: payload.name,
          category: payload.category || 'General',
          price: parseFloat(payload.price) || 0,
          stock: parseInt(payload.stock) || 0,
          barcode: payload.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`,
        };
        store.retail.catalogProducts.unshift(newProduct);
        await saveNicheEntityAsync(tenantId, 'retail', 'catalogProduct', newProduct.id, newProduct);
        logNicheAudit(tenantId, 'retail', 'ADD_PRODUCT', 'Product', newProduct.id, `Added ${newProduct.name} to catalog ($${newProduct.price})`, store);
        await logNicheAuditAsync(tenantId, 'retail', 'ADD_PRODUCT', 'Product', newProduct.id, `Added ${newProduct.name} to catalog ($${newProduct.price})`);
        writeStore(store);
        emitNicheAutomationEvent('retail', 'ADD_PRODUCT', newProduct, tenantId);
        return NextResponse.json({ success: true, record: newProduct });
      }

      if (action === 'create_khata_customer') {
        const newCustomer = {
          id: payload.id || `khata_${Date.now().toString().slice(-4)}`,
          tenantId,
          name: payload.name,
          phone: payload.phone || '+1 555-0199',
          totalCreditDue: parseFloat(payload.totalCreditDue) || 0,
          lastPurchaseDate: new Date().toISOString().split('T')[0],
          creditLimit: parseFloat(payload.creditLimit) || 500,
        };
        store.retail.khataCustomers.unshift(newCustomer);
        await saveNicheEntityAsync(tenantId, 'retail', 'khataCustomer', newCustomer.id, newCustomer);
        logNicheAudit(tenantId, 'retail', 'CREATE_KHATA_CUSTOMER', 'KhataCustomer', newCustomer.id, `Created khata customer ${newCustomer.name}`, store);
        await logNicheAuditAsync(tenantId, 'retail', 'CREATE_KHATA_CUSTOMER', 'KhataCustomer', newCustomer.id, `Created khata customer ${newCustomer.name}`);
        writeStore(store);
        emitNicheAutomationEvent('retail', 'CREATE_KHATA_CUSTOMER', newCustomer, tenantId);
        return NextResponse.json({ success: true, record: newCustomer });
      }
    }

    // 5. SME & TECH B2B ACTIONS
    if (niche === 'sme') {
      if (action === 'create_subscription') {
        const newSub = {
          id: `SUB-${Math.floor(500 + Math.random() * 100)}`,
          tenantId,
          customerName: payload.customerName,
          plan: payload.plan || 'Pro Team',
          mrr: parseFloat(payload.mrr) || 1200,
          status: 'ACTIVE' as const,
          renewalDate: payload.renewalDate || '2026-12-31',
          seats: parseInt(payload.seats) || 10,
        };
        store.sme.subscriptions.unshift(newSub);
        await saveNicheEntityAsync(tenantId, 'sme', 'subscription', newSub.id, newSub);
        logNicheAudit(tenantId, 'sme', 'CREATE_SUBSCRIPTION', 'Subscription', newSub.id, `Created MRR subscription for ${newSub.customerName} ($${newSub.mrr}/mo)`);
        await logNicheAuditAsync(tenantId, 'sme', 'CREATE_SUBSCRIPTION', 'Subscription', newSub.id, `Created MRR subscription for ${newSub.customerName} ($${newSub.mrr}/mo)`);
        writeStore(store);
        emitNicheAutomationEvent('sme', 'CREATE_SUBSCRIPTION', newSub, tenantId);
        return NextResponse.json({ success: true, record: newSub });
      }

      if (action === 'upgrade_subscription') {
        const sub = store.sme.subscriptions.find((s) => s.id === payload.id);
        if (sub) {
          sub.mrr += parseFloat(payload.mrrAdd) || 2500;
          sub.seats += parseInt(payload.seatsAdd) || 20;
          await saveNicheEntityAsync(tenantId, 'sme', 'subscription', sub.id, sub);
          logNicheAudit(tenantId, 'sme', 'UPGRADE_SUBSCRIPTION', 'Subscription', sub.id, `Upgraded subscription for ${sub.customerName}: +$${payload.mrrAdd || 2500} MRR, +${payload.seatsAdd || 20} seats`, store);
          await logNicheAuditAsync(tenantId, 'sme', 'UPGRADE_SUBSCRIPTION', 'Subscription', sub.id, `Upgraded subscription for ${sub.customerName}: +$${payload.mrrAdd || 2500} MRR, +${payload.seatsAdd || 20} seats`);
          writeStore(store);
          emitNicheAutomationEvent('sme', 'UPGRADE_SUBSCRIPTION', sub, tenantId);
          return NextResponse.json({ success: true, record: sub });
        }
      }
    }

    // 6. CREATIVE AGENCY ACTIONS
    if (niche === 'agency') {
      if (action === 'create_deliverable') {
        const newDel = {
          id: `DEL-${Math.floor(200 + Math.random() * 100)}`,
          tenantId,
          clientName: payload.clientName,
          projectTitle: payload.projectTitle,
          milestone: payload.milestone || 'Project Deliverable',
          dueDate: payload.dueDate || '2026-10-15',
          status: 'IN_PROGRESS' as const,
          retainerAmount: parseFloat(payload.retainerAmount) || 15000,
        };
        store.agency.deliverables.unshift(newDel);
        await saveNicheEntityAsync(tenantId, 'agency', 'deliverable', newDel.id, newDel);
        logNicheAudit(tenantId, 'agency', 'CREATE_DELIVERABLE', 'Deliverable', newDel.id, `Created deliverable ${newDel.milestone} for ${newDel.clientName}`, store);
        await logNicheAuditAsync(tenantId, 'agency', 'CREATE_DELIVERABLE', 'Deliverable', newDel.id, `Created deliverable ${newDel.milestone} for ${newDel.clientName}`);
        writeStore(store);
        emitNicheAutomationEvent('agency', 'CREATE_DELIVERABLE', newDel, tenantId);
        return NextResponse.json({ success: true, record: newDel });
      }

      if (action === 'approve_deliverable') {
        const del = store.agency.deliverables.find((d) => d.id === payload.id);
        if (del) {
          del.status = 'APPROVED';
          await saveNicheEntityAsync(tenantId, 'agency', 'deliverable', del.id, del);
          logNicheAudit(tenantId, 'agency', 'APPROVE_DELIVERABLE', 'Deliverable', del.id, `Client approved milestone: ${del.milestone} for ${del.clientName}`, store);
          await logNicheAuditAsync(tenantId, 'agency', 'APPROVE_DELIVERABLE', 'Deliverable', del.id, `Client approved milestone: ${del.milestone} for ${del.clientName}`);
          writeStore(store);
          emitNicheAutomationEvent('agency', 'APPROVE_DELIVERABLE', del, tenantId);
          return NextResponse.json({ success: true, record: del });
        }
      }
    }

    // 7. GENERIC / DYNAMIC NICHE ACTIONS (Construction, Legal, Logistics, Fitness, Automotive, Custom)
    if (action === 'create_record') {
      if (!store.nicheRecords) store.nicheRecords = {};
      if (!store.nicheRecords[niche]) store.nicheRecords[niche] = [];

      const newRecord = {
        id: payload.id || `rec_${niche}_${Date.now()}`,
        tenantId,
        name: payload.name || 'Untitled Record',
        status: payload.status || 'Active',
        statusColor: payload.statusColor || '#38bdf8',
        primaryField: payload.primaryField || 'Custom Entry',
        secondaryField: payload.secondaryField || 'Created by Operator',
        amount: payload.amount || '$10,000',
        date: payload.date || 'Just now',
      };

      store.nicheRecords[niche].unshift(newRecord);
      await saveNicheEntityAsync(tenantId, niche, 'record', newRecord.id, newRecord);
      logNicheAudit(tenantId, niche, 'CREATE_RECORD', 'Record', newRecord.id, `Created ${newRecord.name} in ${niche}`, store);
      await logNicheAuditAsync(tenantId, niche, 'CREATE_RECORD', 'Record', newRecord.id, `Created ${newRecord.name} in ${niche}`);
      writeStore(store);
      emitNicheAutomationEvent(niche, 'CREATE_RECORD', newRecord, tenantId);
      return NextResponse.json({ success: true, record: newRecord });
    }

    if (action === 'update_record_status') {
      if (store.nicheRecords && store.nicheRecords[niche]) {
        const rec = store.nicheRecords[niche].find((r) => r.id === payload.id);
        if (rec) {
          rec.status = payload.status;
          if (payload.statusColor) rec.statusColor = payload.statusColor;
          await saveNicheEntityAsync(tenantId, niche, 'record', rec.id, rec);
          logNicheAudit(tenantId, niche, 'UPDATE_STATUS', 'Record', rec.id, `Advanced status of ${rec.name} to ${rec.status}`, store);
          await logNicheAuditAsync(tenantId, niche, 'UPDATE_STATUS', 'Record', rec.id, `Advanced status of ${rec.name} to ${rec.status}`);
          writeStore(store);
          emitNicheAutomationEvent(niche, 'UPDATE_STATUS', rec, tenantId);
          return NextResponse.json({ success: true, record: rec });
        }
      }
    }

    return NextResponse.json({ error: `Unrecognized action ${action} for niche ${niche}` }, { status: 400 });
  } catch (err: any) {
    console.error('Failed to process niche operation:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
