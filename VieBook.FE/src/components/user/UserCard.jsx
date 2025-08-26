function UserCard({ user }) {
  return (
    <div className="card">
      <h3>{user.fullName}</h3>
      <p>{user.email}</p>
    </div>
  );
}
export default UserCard;
