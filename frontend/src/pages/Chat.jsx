import React, { useState, useEffect } from 'react';

const Chat = ({ userId }) => {
    userId = 1;
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [receiverId, setReceiverId] = useState('');

    useEffect(() => {
        fetchMessages();
    }, [userId]);

    // Fetch messages from the backend
    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/chat/${userId}/messages`);
            const data = await response.json();
            // Pastikan data adalah array
            if (Array.isArray(data)) {
                setMessages(data);
            } else {
                console.error('Data received is not an array:', data);
                setMessages([]);  // Set as empty array if not an array
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Send message to the backend
    const sendMessage = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senderId: userId, receiverId, message }),
            });

            if (response.ok) {
                setMessage('');
                fetchMessages(); // Refresh the message list after sending
            } else {
                alert('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div>
            <h2>Chat</h2>
            <div>
                <input
                    type="text"
                    placeholder="Receiver User ID"
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                />
            </div>
            <div>
                {messages.map((msg) => (
                    <div key={msg.id}>
                        {msg.senderId == userId ? (<strong>You: </strong>) : (<strong>From {msg.senderId}: </strong>)}
                        <p>{msg.message}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <div>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                        required
                    />
                </div>
                <button type="submit">Send</button>
            </form>
        </div >
    );
};

export default Chat;