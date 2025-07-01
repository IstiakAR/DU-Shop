import { supabase } from "../App";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const userInfo = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) {
                console.error("Error fetching user:", userError);
                setUser(null);
                return;
            }
            const { data, error } = await 
            supabase
            .from('user')
            .select('*')
            .eq('id', userData.user.id);
            if (error) {
                console.error("Error fetching user info:", error);
            } else {
                console.log("User Info:", data[0]);
                setUser(data[0]);
            }
        };
        userInfo();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if(!error){
            navigate('/');
        }
    }
    return(
        <div className="container">
            <h2>User Profile</h2>
            {user ? (
                <div>
                    <p>Email: {user.email}</p>
                    <p>Full Name: {user.name}</p>
                </div>
            ) : (
                <p>Loading user information...</p>
            )}
            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}
export default Profile;