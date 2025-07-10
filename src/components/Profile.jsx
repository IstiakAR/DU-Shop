import '../styles/Profile.css';
import supabase from "../supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import rightArrow from '../assets/rightArrow.svg';

function Profile() {
    const navigate = useNavigate();
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
            if (!error) {
                console.log("User Info:", data[0]);
                setUser(data[0]);
            }
        };
        userInfo();
    }, []);

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-row">
                    <span>Name</span>
                    <span>{user ? user.name : ''}</span>
                </div>
                <div className="profile-divider" />
                <div className="profile-row">
                    <span>Email</span>
                    <span>{user ? user.email : ''}</span>
                </div>
                <div className="profile-divider" />
                <div className="profile-link-row" onClick={() => navigate('/forgot-password')}>
                    <span>Change password</span>
                    <span className="profile-arrow">
                        <img src={rightArrow} />
                    </span>
                </div>
                <div className="profile-divider" />
                <div className="profile-link-row" onClick={() => navigate('/seller')}>
                    <span>Seller dashboard</span>
                    <span className="profile-arrow">
                        <img src={rightArrow} />
                    </span>
                </div>
                <div className="profile-divider" />
                <div className="profile-link-row" onClick={() => navigate('/admin')}>
                    <span>Admin dashboard</span>
                    <span className="profile-arrow">
                        <img src={rightArrow} />
                    </span>
                </div>
            </div>
        </div>
    );
}
export default Profile;