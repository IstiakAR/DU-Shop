import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx'
import Shop from './components/Shop.jsx';
import Login from './components/LoginPage.jsx';
import Profile from './components/Profile.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import HomePage from './components/HomePage.jsx';
import ItemDetails from './components/ItemDetails.jsx';
import AddProduct from './components/AddProduct.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App><HomePage /></App>,
  },
  {
    path: "shop",
    element: <App><Shop /></App>,
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
  },
  {
    path: "reset-password",
    element: <ResetPassword />
  },
  {
    path : "item/:id",
    element: <App><ItemDetails /></App>
  },
  {
    path: "add-product",
    element: <App><AddProduct /></App>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
