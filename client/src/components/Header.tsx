interface HeaderProps {
  size?: "sm" | "lg";
}

export function Header({ size = "lg" }: HeaderProps) {
  const textSize = size === "lg" ? "text-5xl md:text-7xl" : "text-2xl md:text-3xl";

  return (
    <h1
      data-testid="text-logo"
      className={`${textSize} font-bold tracking-wider`}
      style={{ fontFamily: "'Libre Baskerville', 'Playfair Display', serif" }}
    >
      PAPER DREAM
    </h1>
  );
}
