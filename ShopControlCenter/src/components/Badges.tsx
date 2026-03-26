
export const PlanBadge = ({ plan }: { plan: string }) => {
  if (plan === 'pro') return <span style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>⭐ Pro</span>;
  if (plan === 'business') return <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>🚀 Biz</span>;
  return <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>🌱 Free</span>;
};
