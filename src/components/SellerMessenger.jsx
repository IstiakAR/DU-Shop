import { useEffect, useState, useRef } from "react";
import supabase from "../supabase";
import "../styles/MessageBox.css";

export default function SellerMessenger({ user }) {
  const [conversations, setConversations] = useState([]); // List of users who sent messages
  const [currentChat, setCurrentChat] = useState(null); // { userId, messages }
  const [text, setText] = useState("");
  const listRef = useRef(null);

  const myId = user?.id;

  // Fetch distinct users who sent messages to seller
  useEffect(() => {
    if (!myId) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("messenger")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`); // all messages involving seller

      if (!error && data) {
        // Extract distinct users excluding seller
        const usersSet = new Set();
        data.forEach((msg) => {
          if (msg.sender_id !== myId) usersSet.add(msg.sender_id);
          if (msg.receiver_id !== myId) usersSet.add(msg.receiver_id);
        });
        setConversations(Array.from(usersSet));
      }
    };

    fetchConversations();
  }, [myId]);

  // Fetch messages with a specific user
  const fetchMessages = async (otherId) => {
    if (!myId || !otherId) return;

    const { data, error } = await supabase
      .from("messenger")
      .select("*")
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${myId})`)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setCurrentChat({ userId: otherId, messages: data });
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!myId) return;

    const channel = supabase
      .channel("seller-messenger")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messenger" }, (payload) => {
        const m = payload.new;
        if (currentChat && (m.sender_id === currentChat.userId || m.receiver_id === currentChat.userId)) {
          setCurrentChat((prev) => ({
            ...prev,
            messages: [...prev.messages, m],
          }));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [myId, currentChat]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [currentChat]);

  const sendMessage = async () => {
    if (!text.trim() || !currentChat) return;

    const payload = {
      sender_id: myId,
      receiver_id: currentChat.userId,
      message: text.trim(),
    };

    const { error } = await supabase.from("messenger").insert([payload]);
    if (error) {
      console.error("Send message error:", error.message);
      return;
    }
    setText("");
  };

  return (
    <div className="seller-messenger-container">
      <div className="conversations-list">
        <h3>Messages</h3>
        {conversations.length === 0 && <p>No messages yet.</p>}
        {conversations.map((userId) => (
          <button
            key={userId}
            className={currentChat?.userId === userId ? "active" : ""}
            onClick={() => fetchMessages(userId)}
          >
            {userId.slice(0, 6)} {/* You can fetch username from 'user' table if needed */}
          </button>
        ))}
      </div>

      {currentChat && (
        <div className="chat-box">
          <div className="chat-messages" ref={listRef}>
            {currentChat.messages.map((m) => {
              const mine = m.sender_id === myId;
              return (
                <div key={m.id} className={`message ${mine ? "sent" : "received"}`}>
                  <p>{m.message}</p>
                  <small>{new Date(m.created_at).toLocaleString()}</small>
                </div>
              );
            })}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
