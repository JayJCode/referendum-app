import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ paddingTop: '4rem', maxWidth: '600px', margin: '0 left' }}>
      <h2>Welcome{user ? `, ${user.username}!` : ' to Referendum App'}</h2>
      {user ? (
        <>
          <p>You can now participate in active referendums and have your voice heard.</p>
          <p>Check out the latest referendums and cast your vote today!</p>
        </>
      ) : (
        <>
          <p>Please login to vote on referendums and stay informed about important decisions.</p>
          <p>If you’re new here, consider creating an account to start participating!</p>
        </>
      )}
      <hr style={{ margin: '2rem 0' }} />
      <section>
        <h3>About Referendum App</h3>
        <p>
          This app allows users to create, moderate, and vote on referendums.
          Join our community and help shape decisions in your organization or group.
        </p>
      </section>
    </div>
  );
}