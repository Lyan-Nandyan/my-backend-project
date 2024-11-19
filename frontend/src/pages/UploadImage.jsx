import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa'; // Menggunakan ikon upload dari react-icons

const UploadImage = () => {
    const [image, setImage] = useState(null);
    const [watermarkText, setWatermarkText] = useState('');
    const [uploadStatus, setUploadStatus] = useState(null);
    const [isVisible, setIsVisible] = useState(false); // Komponen disembunyikan pertama kali

    // Fungsi untuk menangani perubahan pada file input
    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    // Fungsi untuk menangani perubahan teks watermark
    const handleWatermarkChange = (e) => {
        setWatermarkText(e.target.value);
    };

    // Fungsi untuk mengirim gambar ke server
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            alert('Please select an image');
            return;
        }

        const formData = new FormData();
        formData.append('image', image);
        formData.append('watermarkText', watermarkText);

        try {
            setUploadStatus('Uploading...');

            const response = await fetch('https://my-backend-project-production-c8a7.up.railway.app/api/watermark/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                setUploadStatus('Image uploaded successfully!');
            } else {
                setUploadStatus(`Error: ${data.error}`);
            }
        } catch (error) {
            setUploadStatus('Upload failed!');
            console.error(error);
        }
    };

    // Fungsi untuk refresh halaman
    const handleRefresh = () => {
        window.location.reload();
    };

    // Fungsi untuk toggle visibilitas komponen upload
    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div className="fixed bottom-16 right-4">
            {/* Tombol Toggle untuk menyembunyikan/menampilkan form */}
            <button
                onClick={toggleVisibility}
                className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 focus:outline-none transition-all"
            >
                <FaUpload className="w-5 h-5" />
            </button>

            {isVisible && (
                <div className="absolute bottom-16 right-4 bg-white p-4 shadow-lg rounded-lg w-80">
                    <h2 className="text-xl font-bold mb-4">Upload Image with Watermark</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="image" className="block text-sm">Select Image:</label>
                            <input type="file" id="image" onChange={handleImageChange} required className="border p-2 rounded w-full" />
                        </div>

                        <div>
                            <label htmlFor="watermarkText" className="block text-sm">Watermark Text:</label>
                            <input
                                type="text"
                                id="watermarkText"
                                value={watermarkText}
                                onChange={handleWatermarkChange}
                                className="border p-2 rounded w-full"
                            />
                        </div>

                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none">
                            Upload Image
                        </button>
                    </form>

                    {uploadStatus && <p className="mt-4">{uploadStatus}</p>}

                    {/* Tombol refresh setelah upload sukses */}
                    {uploadStatus === 'Image uploaded successfully!' && (
                        <button
                            onClick={handleRefresh}
                            className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none"
                        >
                            Refresh Page
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default UploadImage;
