import "./App.css";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./pages/Home";
import Page2 from "./pages/Page2";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignOutButton, User, UserDropdown, UserProfile} from '@asgardeo/react'


function App() {
  return (
    <>
      <SignedIn>
        <div>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/page2" element={<Page2 />} />
            </Routes>
          </Router>
          <Footer />
          <br></br>
           <UserDropdown />
          <SignOutButton />
        </div>
      </SignedIn>
      <SignedOut>
        <h2>Please sign in to access this app</h2>
        <SignInButton />
      </SignedOut>
    </>
  );
}

export default App;