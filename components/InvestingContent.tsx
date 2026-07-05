import OtherContent from "@/components/OtherContent";
import type { InvestingBlock } from "@/lib/notion-investing";
import type { OtherBlock } from "@/lib/notion-other";

export default function InvestingContent({ blocks }: { blocks: InvestingBlock[] }) {
  return <OtherContent blocks={blocks as OtherBlock[]} />;
}
