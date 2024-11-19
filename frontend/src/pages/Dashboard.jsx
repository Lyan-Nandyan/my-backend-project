import React, { useEffect, useState } from "react";
import { checkAuthentication } from '../utils/authUtils';
import { FaDownload } from 'react-icons/fa';
import UploadImage from "./UploadImage";
import ExtractWatermark from "./ExtractWatermark";

// Fungsi untuk mengambil gambar dari sessionStorage
const loadFromSessionStorage = (key) => {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

const Header = () => {

    // Fungsi untuk handle logout
    const handleLogout = async () => {
        try {
            // Kirim request ke backend untuk logout
            const response = await fetch("https://my-backend-project-production-c8a7.up.railway.app/api/logout", {
                method: "POST",
                credentials: "include", // Pastikan cookie dikirim bersama request
            });

            if (response.ok) {
                console.log("Logout successful");
                // Redirect ke halaman login setelah logout berhasil
                window.location.href = "/";
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg">
            <h1 className="text-2xl font-bold">Image Gallery</h1>
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
            >
                Logout
            </button>
        </header>
    );
};

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white p-4 mt-8 text-center">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
        </footer>
    );
};

const ImageGallery = () => {
    const [images, setImages] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Menambahkan state untuk loading

    const [isUploadVisible, setIsUploadVisible] = useState(false);
    const [isExtractVisible, setIsExtractVisible] = useState(false);

    // Fungsi untuk menampilkan UploadImage dan menyembunyikan ExtractWatermark
    const toggleUpload = () => {
        setIsUploadVisible(true);
        setIsExtractVisible(false);  // Pastikan ExtractWatermark disembunyikan
    };

    // Fungsi untuk menampilkan ExtractWatermark dan menyembunyikan UploadImage
    const toggleExtract = () => {
        setIsUploadVisible(false);  // Pastikan UploadImage disembunyikan
        setIsExtractVisible(true);
    };

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
            } finally {
                setIsLoading(false); // Mengubah status loading setelah gambar berhasil diambil
            }
        };

        fetchImages();
    }, []);

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
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <Header />
            {/* Konten Utama */}
            <main className="flex-grow p-8">
                {/* Menampilkan overlay loading saat gambar sedang dimuat */}
                {isLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="text-white text-xl">Loading...</div>
                    </div>
                )}

                <div className="flex flex-wrap justify-center">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="relative m-4 bg-white rounded-lg shadow-lg overflow-hidden w-80 h-80"
                        >
                            {/* Gambar */}
                            <img
                                src={image.base64Image}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Tombol Download di kanan atas gambar */}
                            <button
                                onClick={() => downloadImage(image.base64Image, `image_${index + 1}.png`)}
                                className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                title="Download Image"
                            >
                                <FaDownload className="w-4 h-4" />
                            </button>

                            {/* Informasi dan Tombol Hapus */}
                            <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-60 text-white text-center p-2">
                                <p>{image.status === "Mark" ? "Watermark" : "Tidak Ada Watermark"}</p>
                                <button
                                    onClick={() => deleteImage(image.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 mt-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Upload Image Component di kanan bawah */}
            <div className="relative">
                <ExtractWatermark />
                <UploadImage />
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default ImageGallery;
