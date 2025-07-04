import supabase from "../supabase";
import { useEffect, useState } from "react";

function Profile() {
    const [user, setUser] = useState(null);
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
        </div>
    )
}
export default Profile;