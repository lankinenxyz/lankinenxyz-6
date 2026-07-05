import type { ReactNode } from "react";

type SplitPageProps = {
  left: ReactNode;
  right: ReactNode;
  rightId?: string;
  leftClassName?: string;
  rightClassName?: string;
};

export default function SplitPage({ left, right, rightId, leftClassName = "", rightClassName = "" }: SplitPageProps) {
  return (
    <section className="grid min-h-0 flex-1 gap-8 overflow-y-auto py-8 sm:py-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-12 lg:overflow-hidden lg:py-16">
      <div className={`min-w-0 lg:h-fit ${leftClassName}`}>{left}</div>
      <div className={`scrollbar-none min-w-0 lg:overflow-y-auto ${rightClassName}`} id={rightId}>
        {right}
      </div>
    </section>
  );
}
