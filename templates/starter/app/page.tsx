import { redirect } from "next/navigation";

// The app starts at the dashboard; its page gates access.
export default function Home() {
  redirect("/dashboard");
}
