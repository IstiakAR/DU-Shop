import '../styles/Profile.css';
import supabase from "../supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import rightArrow from '../assets/rightArrow.svg';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSeller, setIsSeller] = useState(false);

    useEffect(() => {
        const userInfo = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) {
                console.error("Error fetching user:", userError);
                setUser(null);
                return;
            }

            const { data, error } = await supabase
                .from('user')
                .select('*')
                .eq('id', userData.user.id)
                .single();
            if (!error && data) {
                setUser(data);
            }

            const { data: sellerData, error: sellerError } = await supabase
                .from('seller')
                .select('id')
                .eq('id', userData.user.id)
                .single();

            if (!sellerError && sellerData) setIsSeller(true);

            const { data: adminData, error: adminError } = await supabase
                .from('admin')
                .select('id')
                .eq('id', userData.user.id)
                .single();

            if (!adminError && adminData) setIsAdmin(true);
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
                <div className="profile-link-row" onClick={() => navigate('/showOrder')}>
                    <span>My Orders</span>
                    <span className="profile-arrow">
                   <img src={rightArrow} />
                  </span>
                 </div>

                {isSeller && (
                    <>
                        <div className="profile-divider" />
                        <div className="profile-link-row" onClick={() => navigate('/seller')}>
                            <span>Seller dashboard</span>
                            <span className="profile-arrow">
                                <img src={rightArrow} />
                            </span>
                        </div>
                    </>
                )}

                {isAdmin && (
                    <>
                        <div className="profile-divider" />
                        <div className="profile-link-row" onClick={() => navigate('/admin')}>
                            <span>Admin dashboard</span>
                            <span className="profile-arrow">
                                <img src={rightArrow} />
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Profile;
