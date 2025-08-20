import { useEffect, useRef, useState } from "react";
import supabase from "../supabase";
import "../styles/MessageBox.css";

/**
 * Props:
 * - sellerId: uuid (seller's user id)
 * - user: current logged-in user object from supabase.auth.getUser()
 * - buttonLabel?: string (defaults to "Message")
 */
export default function MessageBox({ sellerId, user, buttonLabel = "Message" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  const myId = user?.id;
  const otherId = sellerId;

  // Fetch existing conversation
  useEffect(() => {
    if (!myId || !otherId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messenger")
        .select("id, sender_id, receiver_id, message, created_at")
        .or(
          `and(sender_id.eq.${myId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${myId})`
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error.message);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();
  }, [myId, otherId]);

  // Realtime subscription
  useEffect(() => {
    if (!myId || !otherId) return;

    const channel = supabase
      .channel(`messenger-${myId}-${otherId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messenger",
        },
        (payload) => {
          const m = payload.new;
          const isRelevant =
            (m.sender_id === myId && m.receiver_id === otherId) ||
            (m.sender_id === otherId && m.receiver_id === myId);
          if (isRelevant) setMessages((prev) => [...prev, m]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [myId, otherId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !myId || !otherId) return;

    const tempMessage = {
      id: Date.now(), // temporary ID
      sender_id: myId,
      receiver_id: otherId,
      message: text.trim(),
      created_at: new Date().toISOString(),
    };

    // Optimistic UI
    setMessages((prev) => [...prev, tempMessage]);
    setText("");

    const { error } = await supabase
      .from("messenger")
      .insert([{ sender_id: myId, receiver_id: otherId, message: tempMessage.message }]);

    if (error) {
      console.error("Send message error:", error.message);
      alert("Failed to send message: " + error.message);
    }
  };

  if (!user) {
    return (
      <button className="message-btn" disabled>
        Login to Message
      </button>
    );
  }

  return (
    <>
      <button className="message-btn" onClick={() => setOpen((s) => !s)}>
        {open ? "Close Chat" : buttonLabel}
      </button>

      {open && (
        <div className="message-box">
          <div className="message-header">
            <h4>Chat</h4>
            <button onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="message-list" ref={listRef}>
            {messages.length ? (
              messages.map((m) => {
                const mine = m.sender_id === myId;
                return (
                  <div key={m.id} className={`message ${mine ? "sent" : "received"}`}>
                    <p>{m.message}</p>
                    <small>{new Date(m.created_at).toLocaleString()}</small>
                  </div>
                );
              })
            ) : (
              <div className="message-empty">
                Say hello to start the conversation.
              </div>
            )}
          </div>

          <div className="message-input">
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
    </>
  );
}
