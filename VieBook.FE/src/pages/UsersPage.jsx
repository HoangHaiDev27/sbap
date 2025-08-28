import { useUsers } from "../hooks/useUsers";
import UserCard from "../components/user/UserCard";

function UsersPage() {
  const users = useUsers();

  return (
    <div>
      <h1>User List</h1>
      {users.map((u) => (
        <UserCard key={u.userID} user={u} />
      ))}
      <div class="bg-red-500 text-white p-4">Test Tailwind</div>
    </div>
  );
}
export default UsersPage;
