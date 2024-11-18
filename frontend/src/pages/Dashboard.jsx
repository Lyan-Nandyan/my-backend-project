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
                // Cek apakah data gambar sudah ada di sessionStorage
                const storedImages = loadFromSessionStorage("decryptedImages");
                if (storedImages) {
                    setImages(storedImages);
                } else {
                    // Jika tidak ada, lakukan fetch dari backend
                    const response = await fetch("http://localhost:5000/api/images", { credentials: 'include' });
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

    const downloadImage = (imageUrl, imageName) => {
        const link = document.createElement("a");
        link.href = imageUrl; // Menggunakan URL gambar
        link.download = imageName; // Nama file saat diunduh
        link.click(); // Men-trigger klik untuk mulai download
    };

    return (
        <div>
            <h1>Image Gallery</h1>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {images.map((image, index) => (
                    <div key={index} style={{ margin: "10px" }}>
                        {/* Menampilkan gambar terdekripsi */}
                        <img
                            src={image.base64Image} // Menggunakan base64 atau URL gambar
                            alt={`Image ${index + 1}`}
                            style={{ width: "200px", height: "200px", objectFit: "cover" }}
                        />
                        <p>{image.status === "Mark" ? "Watermark" : "Tidak Ada Watermark"}</p>

                        {/* Tombol untuk download */}
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;
