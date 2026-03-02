function StatCard({ label, value, icon, tone = 'blue' }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-app-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold text-app-primary">{value}</p>
        </div>
        <div className="rounded-xl border border-app-subtle bg-app px-3 py-2 text-app-primary">{icon}</div>
      </div>
    </div>
  );
}

export default StatCard;
