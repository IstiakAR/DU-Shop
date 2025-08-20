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
import SellerManagement from './components/SellerManagement.jsx';
import PendingSellers from './components/PendingSellers.jsx';
import TotalSellers from './components/TotalSellers.jsx';
import CategoriesPage from './components/CategoriesPage.jsx';
import ProductPage from './components/ProductsPage.jsx';
import Order from './components/Order.jsx';
import SellerMessenger from './components/SellerMessenger.jsx';

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
  },
  {
    path: "admin/sellers",
    element: <App><SellerManagement /></App>
  },
  {
    path: "/admin/sellers/pending",
    element: <App><PendingSellers /></App>
  },
  {
    path: "/admin/sellers/total",
    element: <App><TotalSellers /></App>
  },
  {
    path: "/admin/categories",
    element: <App><CategoriesPage/></App>
  },
  {
    path: "/admin/products",
    element: <App><ProductPage/></App>
  },
  {
    path: "/order",
    element: <App><Order /></App>
  },
  {
    path: "/admin/sellermessenger",
    element: <App><SellerMessenger/></App>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
