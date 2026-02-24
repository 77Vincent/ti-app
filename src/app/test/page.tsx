import { PAGE_PATHS } from "@/lib/config/paths";
import { redirect } from "next/navigation";

export default function TestPage() {
  redirect(PAGE_PATHS.DASHBOARD_TESTS);
}
