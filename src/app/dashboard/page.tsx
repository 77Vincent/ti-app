import { TestsPanel } from "@/app/components/testsPanel/TestsPanel";
import Stats from "./stats";

export default async function DashboardPage() {
  return (
    <div className="flex w-full flex-col gap-8">
      <Stats />
      <TestsPanel />
    </div>
  );
}
