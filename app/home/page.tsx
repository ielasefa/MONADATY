import { redirect } from "next/navigation";

export default function HomeRedirect() {
  // Redirect legacy /home route to the root homepage
  redirect("/");
}
