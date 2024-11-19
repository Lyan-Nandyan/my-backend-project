import React, { useEffect, useState } from "react";
import { checkAuthentication } from '../utils/authUtils';

// Fungsi untuk mengambil gambar dari sessionStorage
const loadFromSessionStorage = (key) => {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

const ImageGallery = () => {
    const [images, setImages] = useState([]);
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

        const fetchImages = async () => {
            try {
                const storedImages = loadFromSessionStorage("decryptedImages");
                if (storedImages) {
                    setImages(storedImages);
                } else {
                    const response = await fetch("https://my-backend-project-production-c8a7.up.railway.app/api/images", { credentials: 'include' });
                    const data = await response.json();

                    if (response.ok) {
                        setImages(data.images);
                    } else {
                        console.error("Failed to fetch images:", data.error);
                    }
                }
            } catch (error) {
                console.error("Error fetching images:", error);
            }
        };

        fetchImages();
    }, []);

    if (isAuthenticated === null) return <div>Loading...</div>;
    if (isAuthenticated === false) return null;

    // Fungsi untuk mendownload gambar
    const downloadImage = (imageUrl, imageName) => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = imageName;
        link.click();
    };

    // Fungsi untuk menghapus gambar
    const deleteImage = async (imageId) => {
        try {
            const response = await fetch(`https://my-backend-project-production-c8a7.up.railway.app/api/delete/${imageId}`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                // Hapus gambar dari state
                setImages(images.filter((image) => image.id !== imageId));
                console.log("Image deleted successfully");
            } else {
                const errorData = await response.json();
                console.error("Failed to delete image:", errorData.error);
            }
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    };

    return (
        <div>
            <h1>Image Gallery</h1>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {images.map((image, index) => (
                    <div key={index} style={{ margin: "10px" }}>
                        <img
                            src={image.base64Image}
                            alt={`Image ${index + 1}`}
                            style={{ width: "200px", height: "200px", objectFit: "cover" }}
                        />
                        <p>{image.status === "Mark" ? "Watermark" : "Tidak Ada Watermark"}</p>

                        <button
                            onClick={() => downloadImage(image.base64Image, `image_${index + 1}.png`)}
                            style={{
                                padding: "5px 10px",
                                backgroundColor: "#007BFF",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                marginTop: "5px",
                            }}
                        >
                            Download
                        </button>

                        {/* Tombol untuk menghapus gambar */}
                        <button
                            onClick={() => deleteImage(image.id)}
                            style={{
                                padding: "5px 10px",
                                backgroundColor: "#FF4136",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                marginTop: "5px",
                                marginLeft: "5px",
                            }}
                        >
                            Hapus
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;
