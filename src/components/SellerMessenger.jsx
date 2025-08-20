import { useEffect, useState, useRef } from "react";
import supabase from "../supabase";

export default function SellerInbox({ sellerId }) {
  const [users, setUsers] = useState([]); // [ {id, name}, ... ]
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const listRef = useRef(null);

  // Fetch distinct users who have messaged the seller
  useEffect(() => {
    if (!sellerId) return;

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("messenger")
        .select(`
          sender_id,
          receiver_id,
          sender:user(id, name)
        `)
        .or(`sender_id.eq.${sellerId},receiver_id.eq.${sellerId}`);

      if (error) {
        console.error("Fetch users error:", error.message);
        return;
      }

      const userMap = new Map();
      data.forEach((msg) => {
        if (msg.sender_id !== sellerId) userMap.set(msg.sender_id, msg.sender?.name || "User");
        if (msg.receiver_id !== sellerId) userMap.set(msg.receiver_id, msg.receiver?.name || "User");
      });

      setUsers(Array.from(userMap, ([id, name]) => ({ id, name })));
    };

    fetchUsers();
  }, [sellerId]);

  // Fetch messages with selected user
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messenger")
        .select("*")
        .or(
          `and(sender_id.eq.${sellerId},receiver_id.eq.${selectedUser}),
           and(sender_id.eq.${selectedUser},receiver_id.eq.${sellerId})`
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Fetch messages error:", error.message);
      } else {
        setMessages(data || []);
      }
    };

    fetchMessages();
  }, [selectedUser, sellerId]);

  // Real-time subscription
  useEffect(() => {
    if (!sellerId) return;

    const channel = supabase
      .channel("seller-messenger-" + sellerId)
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
            m.receiver_id === sellerId || m.sender_id === sellerId;
          if (!isRelevant) return;

          // Update messages if chat is open with that user
          if (
            selectedUser &&
            (m.sender_id === selectedUser || m.receiver_id === selectedUser)
          ) {
            setMessages((prev) => [...prev, m]);
          }

          // Update users list
          const otherUserId =
            m.sender_id !== sellerId ? m.sender_id : m.receiver_id;
          setUsers((prev) => {
            if (prev.find((u) => u.id === otherUserId)) return prev;
            return [...prev, { id: otherUserId, name: "User" }];
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sellerId, selectedUser]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const tempMessage = {
      id: Date.now(),
      sender_id: sellerId,
      receiver_id: selectedUser,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    const { error } = await supabase.from("messenger").insert([{
      sender_id: sellerId,
      receiver_id: selectedUser,
      message: tempMessage.message
    }]);

    if (error) console.error("Send message error:", error.message);
  };

  const styles = {
    container: { display: "flex", height: "90vh", border: "1px solid #ccc", fontFamily: "Arial, sans-serif" },
    usersList: { width: "30%", borderRight: "1px solid #ccc", padding: 10, overflowY: "auto", background: "#f7f7f7" },
    userItem: (selected) => ({ padding: 10, cursor: "pointer", background: selected ? "#ddd" : "transparent", borderRadius: 5, marginBottom: 5 }),
    chatWindow: { flex: 1, display: "flex", flexDirection: "column" },
    chatHeader: { borderBottom: "1px solid #ccc", padding: 10, fontWeight: "bold" },
    messageList: { flex: 1, padding: 10, overflowY: "auto", background: "#e5ddd5" },
    messageBubble: (mine) => ({
      display: "inline-block",
      padding: "8px 12px",
      borderRadius: 15,
      background: mine ? "#dcf8c6" : "#fff",
      marginBottom: 5,
      maxWidth: "70%",
      wordBreak: "break-word"
    }),
    messageInfo: { fontSize: 11, color: "#555", marginTop: 2 },
    inputContainer: { display: "flex", borderTop: "1px solid #ccc", padding: 10 },
    input: { flex: 1, padding: 8, borderRadius: 20, border: "1px solid #ccc", outline: "none" },
    sendButton: { marginLeft: 10, padding: "8px 16px", borderRadius: 20, border: "none", background: "#128c7e", color: "#fff", cursor: "pointer" }
  };

  return (
    <div style={styles.container}>
      {/* Users List */}
      <div style={styles.usersList}>
        <h3>Users</h3>
        {users.length === 0 && <p>No messages yet</p>}
        {users.map(u => (
          <div
            key={u.id}
            style={styles.userItem(selectedUser === u.id)}
            onClick={() => setSelectedUser(u.id)}
          >
            {u.name}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div style={styles.chatWindow}>
        {!selectedUser ? (
          <div style={{ padding: 20 }}>Select a user to chat</div>
        ) : (
          <>
            <div style={styles.chatHeader}>
              Chat with {users.find(u => u.id === selectedUser)?.name || selectedUser}
            </div>

            <div style={styles.messageList} ref={listRef}>
              {messages.length === 0 ? (
                <p>Say hello to start the conversation.</p>
              ) : (
                messages.map(m => {
                  const mine = m.sender_id === sellerId;
                  return (
                    <div key={m.id} style={{ textAlign: mine ? "right" : "left" }}>
                      <div style={styles.messageBubble(mine)}>{m.message}</div>
                      <div style={styles.messageInfo}>
                        {new Date(m.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={styles.inputContainer}>
              <input
                style={styles.input}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <button style={styles.sendButton} onClick={sendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
