import React from 'react'
import {Link} from 'react-router-dom'

const Header = () => {
  return (
    <>
    <h1>Welcome to the Puppy App!</h1>

    <nav style={{ padding: "1rem", backgroundColor: "#f0f0f0" }}>
      <Link to="/" style={{ marginRight: "1rem" }}>
        Home
      </Link>
      <Link to="/page2">Page 2</Link>
    </nav>
  </>
  );
}

export default Header;