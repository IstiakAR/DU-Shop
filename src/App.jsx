import { useEffect, useState } from "react";
import './styles/App.css'
import { createClient } from '@supabase/supabase-js';

import HomePage from './components/HomePage';
import Header from './components/Header';

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function App() {

  return (
    <>
      <Header />
      <HomePage />
    </>
  )
}

export default App
