import { useEffect, useState, useRef } from "react";
import supabase from "../supabase";
import "../styles/Messenger.css";
import { getUserID } from "../fetch";

export default function Messenger() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const listRef = useRef(null);
  const [sellerId, setSellerId] = useState(null);

  useEffect(() => {
    const fetchSellerId = async () => {
      const id = await getUserID();
      setSellerId(id);
    };
    fetchSellerId();
  }, []);

  useEffect(() => {
    if (!sellerId) return;

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("messenger")
        .select(`
          sender_id,
          receiver_id,
          sender:user!sender_id(id, name),
          receiver:user!receiver_id(id, name)
        `)
        .or(`sender_id.eq.${sellerId},receiver_id.eq.${sellerId}`);

      const userMap = new Map();
      data.forEach((msg) => {
        if (msg.sender_id !== sellerId) userMap.set(msg.sender_id, msg.sender?.name || "User");
        if (msg.receiver_id !== sellerId) userMap.set(msg.receiver_id, msg.receiver?.name || "User");
      });

      setUsers(Array.from(userMap, ([id, name]) => ({ id, name })));
    };

    fetchUsers();
  }, [sellerId]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      const { data: outgoingMessages, error: outgoingError } = await supabase
        .from("messenger")
        .select("*")
        .eq("sender_id", sellerId)
        .eq("receiver_id", selectedUser)
        .order("created_at", { ascending: true });
      const { data: incomingMessages, error: incomingError } = await supabase
        .from("messenger")
        .select("*")
        .eq("sender_id", selectedUser)
        .eq("receiver_id", sellerId)
        .order("created_at", { ascending: true });

      const data = [...outgoingMessages, ...incomingMessages].sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      );
      setMessages(data);
      setLoadingMessages(false);
    };

    fetchMessages();
  }, [selectedUser, sellerId]);

  // Real-time sync
  useEffect(() => {
    if (!sellerId) return;

    const channel = supabase
      .channel("messenger-" + sellerId)
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

          if (
            selectedUser &&
            (m.sender_id === selectedUser || m.receiver_id === selectedUser)
          ) {
            setMessages((prev) => [...prev, m]);
          }

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
  };

  return (
    <div className="messenger-container">
      <div className="users-list">
        {users.length === 0 && <p>No messages yet</p>}
        {users.map(u => (
          <div
            key={u.id}
            className={`user-item ${selectedUser === u.id ? 'selected' : ''}`}
            onClick={() => setSelectedUser(u.id)}
          >
            {u.name}
          </div>
        ))}
      </div>

      <div className="chat-window">
        {!selectedUser ? (
          <div className="select-user-prompt">Select a user to chat</div>
        ) : (
          <>
            <div className="message-list" ref={listRef}>
              {loadingMessages ? (
                <div className="loading-messages">
                  <div className="loading-spinner"></div>
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <p className="empty-chat-message">Say hello to start the conversation.</p>
              ) : (
                messages.map(m => {
                  const mine = m.sender_id === sellerId;
                  return (
                    <div key={m.id} className={`message-container-${mine ? 'mine' : 'other'}`}>
                      <div className={`message-bubble ${mine ? 'mine' : 'other'}`}>{m.message}</div>
                      <div className="message-info">
                        {new Date(m.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="input-container">
              <input
                className="message-input"
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <button className="send-button" onClick={sendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}