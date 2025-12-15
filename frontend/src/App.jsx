import { Route, Routes } from "react-router-dom";
import './App.css';
import BottomTab from "./components/common/BottomNav.jsx";
import Navbar from './components/common/Navbar.jsx';
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import PublicRoute from "./components/common/PublicRoute.jsx";
import { userAuth } from "./context/AuthContext.jsx";
import Chat from "./pages/Chat.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import CreateReel from "./pages/CreateReel.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import ProfilePublicView from "./pages/ProfilePublicView.jsx";
import Reels from "./pages/Reels.jsx";
import Search from "./pages/Search.jsx";
import Signup from "./pages/Signup.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path='/login'
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path='/signup'
          element={<Signup />}
        />
        <Route
          path='/profile/:id'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/u/:id'
          element={
            <ProtectedRoute>
              <ProfilePublicView />
            </ProtectedRoute>
          }
        />
        <Route
          path='/chat'
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path='/create-post'
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path='/create-reel'
          element={
            <ProtectedRoute>
              <CreateReel />
            </ProtectedRoute>
          }
        />
        <Route
          path='/reels'
          element={
            <ProtectedRoute>
              <Reels />
            </ProtectedRoute>
          }
        />
        <Route
          path='/search'
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/__ping" element={<div style={{padding: 20}}>PING OK</div>} /> */}
      </Routes>
      {(() => {
        const { token } = userAuth() || {};
        return token ? <BottomTab /> : null;
      })()}


    </>
  )
}

export default App;
