import React, { useState, useEffect } from 'react';
import { checkAuthentication } from '../utils/authUtils';

const Dashboard = () => {
    const [images, setImages] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await checkAuthentication();
            if (isAuthenticated) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                window.location.href = '/'; // Redirect ke halaman login jika tidak terautentikasi
            }
        };

        checkAuth();
    }, []);

    // Ambil gambar saat komponen dimuat
    useEffect(() => {
        const fetchImages = async () => {
            try {
                // Buat request ke backend untuk mengambil gambar pengguna saat ini
                const response = await fetch('http://localhost:5000/api/images', {
                    method: 'GET',
                    credentials: 'include', // Pastikan cookie (token) dikirim ke server
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch images');
                }

                const data = await response.json();
                setImages(data.images);
            } catch (err) {
                setError('Failed to fetch images');
                console.error('Error fetching images:', err);
            }
        };

        fetchImages();
    }, []);

    if (isAuthenticated === null) return <div>Loading...</div>;
    if (isAuthenticated === false) return null;

    return (
        <div className="dashboard">
            <h1>Your Uploaded Images</h1>
            {images.length === 0 ? (
                <p>No images uploaded yet.</p>
            ) : (
                <div className="image-gallery">
                    {images.map((image) => (
                        <div key={image.id} className="image-card">
                            <img src={image.link} alt={`Uploaded by User ID: ${image.senderId}`} />
                            <p>Status: {image.status}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
