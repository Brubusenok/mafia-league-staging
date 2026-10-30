type Props = {
  title: string;
  subtitle: string;
  /** Что появится на странице — показываем, пока она не готова. */
  planned?: string[];
};

export function PageStub({ title, subtitle, planned }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{subtitle}</p>

      <div className="mt-10 rounded-card border border-dashed border-border bg-surface p-6 sm:p-8">
        <p className="text-sm font-medium text-accent-text">Раздел в разработке</p>
        {planned && (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            {planned.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
