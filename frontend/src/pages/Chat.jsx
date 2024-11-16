import React, { useState, useEffect } from 'react';

const Chat = () => {
    const [userId, setUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [receiverId, setReceiverId] = useState('');

    useEffect(() => {
        // Ambil userId dari backend setelah login
        const fetchUserId = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/userinfo', {
                    method: 'GET',
                    credentials: 'include', // Sertakan cookies HttpOnly
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserId(data.userId); // Set userId dari response
                } else {
                    console.error('User not authenticated');
                    // Redirect ke halaman login jika belum login
                    //window.location.href = '/';
                }
            } catch (error) {
                console.error('Error fetching user ID:', error);
                //window.location.href = '/'; // Redirect jika ada error
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchMessages();
        }
    }, [userId]);

    // Ambil pesan dari backend
    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/chat/${userId}/messages`, {
                method: 'GET',
                credentials: 'include', // Sertakan cookies HttpOnly
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setMessages(data);
            } else {
                console.error('Data received is not an array:', data);
                setMessages([]); // Set sebagai array kosong jika tidak valid
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // useEffect(() => {
    //     const interval = setInterval(fetchMessages, 5000);
    //     return () => clearInterval(interval); // Bersihkan saat komponen unmount
    // }, []);

    // Mengirim pesan ke backend
    const sendMessage = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Sertakan cookies HttpOnly
                body: JSON.stringify({ senderId: userId, receiverId, message }),
            });

            if (response.ok) {
                setMessage('');
                fetchMessages(); // Refresh daftar pesan setelah pengiriman
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
                        {msg.senderId === userId ? (
                            <strong>You to {msg.receiverId}: </strong>
                        ) : (
                            <strong>From {msg.senderId}: </strong>
                        )}
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
        </div>
    );
};

export default Chat;