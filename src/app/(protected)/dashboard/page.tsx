import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SignOutButton from "./components/sign-out-button";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session?.user.clinic) {
    redirect("/clinic-form");
  }

  return (
    <div>
      <h1>Dashboard Page</h1>
      <h1>{session?.user.name}</h1>
      <h1>{session?.user.email}</h1>
      <SignOutButton />
    </div>
  );
};

export default Dashboard;
