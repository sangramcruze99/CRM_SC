// apps/web-core/src/app/industry/restaurant/RestaurantClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { KitchenDisplaySystem } from '@/components/industry/KitchenDisplaySystem';
import { UniversalDashboard } from '@/components/dashboard/UniversalDashboard';
import { getDashboardConfig } from '@/components/dashboard/dashboardConfig';
import { DashboardAttentionItem } from '@/components/dashboard/dashboard.types';
import { useIndustry } from '@/components/industry/IndustryContext';

interface DiningTable {
  id: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLING';
  guestName?: string;
  partySize?: number;
  currentBill: number;
  seatedAt?: string;
  server?: string;
}

interface KitchenOrder {
  id: string;
  table: string;
  items: string[];
  status: 'QUEUED' | 'COOKING' | 'READY';
  elapsedMins: number;
  specialInstructions?: string;
}

export function RestaurantClient() {
  const { activeServiceIds } = useIndustry();
  const [mounted, setMounted] = useState(false);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [role, setRole] = useState('admin');
  const [mode, setMode] = useState<'OPERATIONS' | 'ANALYTICS'>('OPERATIONS');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<string | null>(null);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/niche/restaurant');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (json.data.tables) {
            setTables(
              json.data.tables.map((t: any) => ({
                id: t.id,
                tableNumber: t.number || t.tableNumber,
                capacity: t.capacity || 4,
                status: t.status || 'AVAILABLE',
                guestName: t.guestName,
                partySize: t.capacity || 4,
                currentBill: t.billTotal || t.currentBill || 0,
                seatedAt: t.seatedTime || 'Recently',
                server: t.server || 'Floor Staff',
              }))
            );
          }
          if (json.data.kitchenOrders) {
            const seenIds = new Set<string>();
            setKitchenOrders(
              json.data.kitchenOrders.map((k: any, idx: number) => {
                let orderId = k.id || `KOT-${idx}`;
                if (seenIds.has(orderId)) {
                  orderId = `${orderId}-${idx}`;
                }
                seenIds.add(orderId);
                return {
                  id: orderId,
                  table: k.tableNumber || k.tableId,
                  items: Array.isArray(k.items) ? k.items.map((i: any) => typeof i === 'string' ? i : `${i.qty || 1}x ${i.name}`) : [],
                  status: k.status === 'PREPARING' ? 'COOKING' : k.status,
                  elapsedMins: 8,
                  specialInstructions: k.notes,
                };
              })
            );
          }
        }
        if (json.auditLogs) {
          setAuditLogs(json.auditLogs);
        }
      }
    } catch (err) {
      console.error('Failed to load restaurant floor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchRestaurantData();
  }, []);

  const handleTableStatusChange = async (tableId: string, newStatus: DiningTable['status']) => {
    const table = tables.find((t) => t.id === tableId);
    const guestName = newStatus === 'AVAILABLE' ? undefined : table?.guestName || 'Walk-in Guests';
    const currentBill = newStatus === 'AVAILABLE' ? 0 : table?.currentBill || 0;

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: newStatus,
              guestName,
              currentBill,
            }
          : t
      )
    );

    try {
      await fetch('/api/niche/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'seat_table',
          payload: {
            tableId,
            guestName: guestName || 'Walk-in Party',
            partySize: 4,
            billTotal: currentBill,
          },
        }),
      });
      setAlert(`Table ${tableId} status updated to ${newStatus}!`);
      setTimeout(() => setAlert(null), 3000);
    } catch (e) {
      console.error('Failed to update table status:', e);
    }
  };

  const handleAttentionAction = (item: DashboardAttentionItem) => {
    setAlert(`Action triggered: "${item.title}". Expedited.`);
    setTimeout(() => setAlert(null), 4000);
  };

  const dashboardConfig = getDashboardConfig(
    'restaurant',
    role,
    mode,
    {
      data: { tables, kitchenOrders },
      auditLogs,
    },
    {
      onGeneralAction: (action) => {
        if (action === 'SEAT_TABLE') {
          const available = tables.find((t) => t.status === 'AVAILABLE');
          if (available) {
            handleTableStatusChange(available.id, 'OCCUPIED');
          } else {
            setAlert('All dining tables are currently seated!');
            setTimeout(() => setAlert(null), 3000);
          }
        }
      },
    },
    activeServiceIds
  );

  return (
    <>
      <UniversalDashboard
        config={dashboardConfig}
        onRoleChange={setRole}
        onModeChange={setMode}
        onAttentionAction={handleAttentionAction}
        headerSlot={
          alert ? (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{alert}</span>
            </div>
          ) : null
        }
        customModals={
          <>
            {/* Live Kitchen Display System & Table Split Calculator */}
            <KitchenDisplaySystem />
          </>
        }
      />
    </>
  );
}
