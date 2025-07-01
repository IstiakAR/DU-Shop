import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx'
import Shop from './components/Shop.jsx';
import Login from './components/LoginPage.jsx';
import Profile from './components/Profile.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "shop",
    element: <Shop />,
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "profile",
    element: <Profile />
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
