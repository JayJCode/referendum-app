import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  
  return (
    <div>
      <h2>Welcome{user ? ` back, ${user.username}!` : ' to Referendum App'}</h2>
      {user ? (
        <p>You can now participate in active referendums</p>
      ) : (
        <p>Please login to vote on referendums</p>
      )}
    </div>
  );
}