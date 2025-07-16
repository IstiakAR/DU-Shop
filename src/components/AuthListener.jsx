import { useEffect } from 'react';
import supabase from '../supabase';
import { useNavigate } from 'react-router-dom';

export const completeProfile = async (authData, navigate) => {
    if (!authData || !authData.user) return;
    const user = authData.user;
    const userId = user.id;
    const email = user.email;

    const { data: userProfile } = await supabase
        .from('user')
        .select('name, status')
        .eq('id', userId)
        .single();

    if (!userProfile) {
        await supabase
            .from('user')
            .upsert([
                { id: userId, name: user.user_metadata?.full_name || '', email: email, status: 'pending' }
            ], { onConflict: ['id'] });
    } else if (userProfile.status === 'pending') {
        await supabase
            .from('user')
            .update({ status: 'confirmed' })
            .eq('id', userId);
    }

    if (navigate) navigate('/');
};

function AuthListener() {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await completeProfile(session, navigate);
            }
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, [navigate]);

    return null;
}

export default AuthListener;
