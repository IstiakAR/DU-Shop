import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx'
import Shop from './components/Shop.jsx';
import Admin from './components/Admin.jsx';
import Seller from './components/Seller.jsx';
import Profile from './components/Profile.jsx';
import Login from './components/LoginPage.jsx';
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
    path: "shop/:subcategoryId",
    element: <App><Shop /></App>,
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "profile",
    element: <App><Profile /></App>
  },
  {
    path: "seller",
    element: <App><Seller /></App>
  },
  {
    path: "admin",
    element: <App><Admin /></App>
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
