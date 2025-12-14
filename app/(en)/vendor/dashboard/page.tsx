import { getCurrentUser, getUserRole } from "@/src/modules/auth/auth.session";

export default async function Page() {
  const { user } = await getCurrentUser();
  const { role } = await getUserRole();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  return (
    <div>
      <h1>Vendor Dashboard</h1>
      <p>User: {user.email}</p>
      <p>Role: {role}</p>
    </div>
  );
}
