import { useEffect } from 'react';
import { supabase } from '../App';
import { useNavigate } from 'react-router-dom';

export const completeProfile = async (authData, navigate) => {
    if (!authData || !authData.user) return;
    const user = authData.user;
    const userId = user.id;
    const email = user.email;

    const { data: pendingProfile } = await supabase
        .from('pending_profile')
        .select('full_name')
        .eq('email', email)
        .single();

    let fullName;
    if (pendingProfile) {
        fullName = pendingProfile.name;
    }

    if (pendingProfile) {
        await supabase
            .from('user')
            .upsert([
                { id: userId, name: fullName, email: email }
            ], { onConflict: ['id'] });
        }
        
    if (pendingProfile) {
        await supabase
            .from('pending_profile')
            .delete()
            .eq('email', email);
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
