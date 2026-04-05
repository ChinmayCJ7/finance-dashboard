export default function SummaryCard({ label, value, sub, color = "blue", icon, trend }) {
  const styles = {
    blue:  { accent: "text-primary",            icon: "bg-secondary-container text-primary" },
    green: { accent: "text-primary-fixed-dim", icon: "bg-secondary-container text-primary-fixed-dim" },
    red:   { accent: "text-error",             icon: "bg-error-container text-error" },
  };
  const s = styles[color] || styles.blue;

  return (
    <div
      className="bg-surface-container-lowest rounded-2xl p-6 flex items-start gap-5 transition-[box-shadow,transform] duration-300 hover:shadow-ambient-hover"
    >
      <div className={`w-12 h-12 rounded-2xl ${s.icon} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-label-sm text-on-surface-variant mb-2 uppercase tracking-wide">{label}</p>
        <p className={`font-display text-2xl font-semibold ${s.accent} tracking-tight break-words [overflow-wrap:anywhere]`}>{value}</p>
        {sub && (
          <p className="text-label-sm text-on-surface-variant mt-2 flex items-center gap-1.5">
            {trend === "up" && <span className="text-primary-fixed-dim font-semibold">↑</span>}
            {trend === "down" && <span className="text-error font-semibold">↓</span>}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
