import type { Metadata } from 'next';

import { requireStaffSession } from '@/features/auth/infrastructure/session-context';

import { NovaClienteForm } from './nova-cliente-form';

export const metadata: Metadata = { title: 'Nova cliente · RoHair' };
export const dynamic = 'force-dynamic';

export default async function NovaClientePage() {
  await requireStaffSession();
  return <NovaClienteForm />;
}
