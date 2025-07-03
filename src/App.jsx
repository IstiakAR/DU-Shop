import { useEffect, useState } from "react";
import './styles/App.css'
import { createClient } from '@supabase/supabase-js';

import HomePage from './components/HomePage';
import Header from './components/Header';
import AuthListener from './components/AuthListener';

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function App({children}) {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        setIsLoggedIn(data.session !== null);
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(session !== null);
    });

    return () => {
        listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <AuthListener />
      <Header isLoggedIn={isLoggedIn} />
      {children}
    </>
  )
}

export default App
