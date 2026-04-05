export default function PlaceholderPage({ title, description }) {
  return (
    <div className="max-w-3xl mx-auto min-w-0 space-y-4">
      <h1 className="text-headline-page text-on-surface">{title}</h1>
      <p className="text-body-md text-on-surface-variant">
        {description || "This section is coming soon."}
      </p>
      <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-10 text-center text-on-surface-variant text-sm shadow-ambient">
        Content placeholder
      </div>
    </div>
  );
}
