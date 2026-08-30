interface StudentSectionHeadingProps {
  description: string;
  headingId: string;
  title: string;
}

export default function StudentSectionHeading({ description, headingId, title }: StudentSectionHeadingProps) {
  return (
    <header className="mb-5">
      <h2 id={headingId} className="text-xl font-semibold tracking-[-0.35px] text-text-primary">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>
    </header>
  );
}
