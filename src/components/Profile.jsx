import { supabase } from "../App";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const userInfo = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user info:", error);
            } else {
                console.log("User Info:", user);
                setUser(data.user);
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
                    <p>Full Name: {user.user_metadata.full_name}</p>
                </div>
            ) : (
                <p>Loading user information...</p>
            )}
            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}
export default Profile;