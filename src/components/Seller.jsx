import { getUserID } from "../fetch";
import { useEffect, useState } from "react";
import supabase from "../supabase";
import "../styles/Seller.css";

function Seller () {
    const [isSeller, setIsSeller] = useState(false);
    const [applied, setApplied] = useState(false);
    
    useEffect(()=>{
        const checkSeller = async () => {
            const userId = await getUserID();
            console.log("User ID:", userId);
            const {data, error} = await supabase
            .from("seller")
            .select('*')
            .eq("id", userId)
            .single();

            if(!error && data) {
                setIsSeller(true);
            }
        }
        const checkPending = async () => {
            const userId = await getUserID();
            const { data, error } = await supabase
            .from("pending_seller")
            .select("id")
            .eq("id", userId)
            .single();

            if (!error && data) {
                setApplied(true);
            }
        }

        checkSeller();
        checkPending();
    }, []);

    const handleApply = async () => {
        const userId = await getUserID();
        const { data, error } = await supabase
            .from("pending_seller")
            .insert({ id: userId });

        if (!error) {
            console.log("Application submitted:", data);
            setApplied(true);
        }
    }
    if(!isSeller) return (
        <div className="seller-container">
        <div className="form-container">
            <h2>You are not a seller</h2>
            <p>Click here to apply for becoming a seller.</p>
            <button className='submit-btn' onClick={handleApply} disabled={applied}
                style={{
                backgroundColor: applied ? 'grey' : '',
                cursor: applied ? 'not-allowed' : 'pointer'
            }}>
                Apply as Seller</button>
            {applied && (
                <p>An admin will contact you soon.</p>
            )}
        </div>
        </div>
    );
    return (
        <div>
            <h2>Seller Profile</h2>
        </div>
    )
}
export default Seller;