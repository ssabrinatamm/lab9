import { User, UserProfile } from "@asgardeo/react";

const Home = () => {
  return (
    <>
      <br></br>
      <hr></hr>

      <h2>Home Page</h2>
      <p> Navigate to Page 2 for the Puppy List Manager</p>

      <User>
        {(user) => (
          <div>
            <p>Welcome back, {user.userName || user.username || user.sub}</p>
          </div>
        )}
      </User>

      <UserProfile />
      
      <br></br>
    </>
  );
};

export default Home;