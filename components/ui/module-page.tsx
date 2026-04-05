import { Clock } from "lucide-react";

type ModulePageProps = {
  title: string;
  description: string;
  bullets: string[];
};

export function ModulePage({ title, description, bullets }: ModulePageProps) {
  return (
    <section className="card">
      <div className="module-placeholder">
        <div className="module-placeholder-icon">
          <Clock size={22} />
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="module-bullets">
          {bullets.map((bullet) => (
            <div className="module-bullet" key={bullet}>
              <span className="module-bullet-dot" />
              {bullet}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
