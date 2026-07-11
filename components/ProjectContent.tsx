import OtherContent from "@/components/OtherContent";
import type { ProjectBlock } from "@/lib/notion-projects";
import type { OtherBlock } from "@/lib/notion-other";

export default function ProjectContent({ blocks }: { blocks: ProjectBlock[] }) {
  return <OtherContent blocks={blocks as OtherBlock[]} />;
}
