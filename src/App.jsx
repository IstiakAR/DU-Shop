import { useEffect, useState } from "react";
import './styles/App.css'

import Header from './components/Header';
import AuthListener from './components/AuthListener';
import supabase from './supabase';

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
