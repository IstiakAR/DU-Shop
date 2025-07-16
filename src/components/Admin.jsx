import { useState, useEffect } from "react";
import { getUserID } from "../fetch";
import supabase from "../supabase";
import "../styles/Admin.css";

function Admin() {
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(()=>{
        const checkAdmin = async () => {
            const userId = await getUserID();
            console.log("User ID:", userId);
            const {data, error} = await supabase
            .from("admin")
            .select('*')
            .eq("id", userId)
            .single();

            if(!error && data) {
                setIsAdmin(true);
            }
        }
        checkAdmin();
    }, []);

    if(!isAdmin) {
        return (
            <div>
                <h2>You are not an admin</h2>
                <p>Access denied.</p>
            </div>
        );
    }
    return (
        <div style={{height: "85vh", width: "100%", display: "flex", 
        justifyContent: "center", alignItems: "center"}}>
        <div className="admin-container">
            <h2 className="admin-title">Admin Dashboard</h2>
            <div className="admin-grid">
                <button className="submit-btn">Products</button>
                <button className="submit-btn">Sellers</button>
                <button className="submit-btn">Categories</button>
                <button className="submit-btn">Orders</button>
            </div>
        </div>
        </div>
    );

}
export default Admin;
