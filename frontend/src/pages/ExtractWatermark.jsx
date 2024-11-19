import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa'; // Menggunakan ikon yang sesuai untuk ekstraksi watermark

const ExtractWatermark = () => {
    const [image, setImage] = useState(null);
    const [watermark, setWatermark] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false); // Menyimpan status visibilitas form

    // Fungsi untuk menangani perubahan gambar yang dipilih
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    // Fungsi untuk meng-upload gambar dan mengekstrak watermark
    const handleExtractWatermark = async () => {
        if (!image) {
            setError('Please select an image to extract watermark.');
            return;
        }

        setLoading(true);
        setError(null);

        // FormData untuk mengirim file gambar
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch('https://my-backend-project-production-c8a7.up.railway.app/api/watermark/extract', {
                method: 'POST',
                body: formData,
                credentials: 'include',  // Pastikan cookie dikirim dengan request
            });

            const data = await response.json();

            if (response.ok) {
                setWatermark(data.watermarkText); // Menyimpan watermark yang diekstrak
            } else {
                setError(data.error || 'Failed to extract watermark');
            }
        } catch (err) {
            setError('An error occurred while extracting watermark');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk toggle visibilitas komponen extract watermark
    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div className="fixed bottom-16 right-20">
            {/* Tombol Toggle untuk menyembunyikan/menampilkan form */}
            <button
                onClick={toggleVisibility}
                className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 focus:outline-none transition-all"
            >
                <FaEye className="w-5 h-5" />
            </button>

            {isVisible && (
                <div className="absolute bottom-16 right-4 bg-white p-4 shadow-lg rounded-lg w-80">
                    <h2 className="text-xl font-bold mb-4">Extract Watermark from Image</h2>
                    <input type="file" onChange={handleImageChange} className="border p-2 rounded w-full" />
                    <button onClick={handleExtractWatermark} disabled={loading} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none mt-4">
                        {loading ? 'Extracting...' : 'Extract Watermark'}
                    </button>

                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    {watermark ? (
                        <div className="mt-4">
                            <h3 className="font-bold">Extracted Watermark:</h3>
                            <p>{watermark}</p>
                        </div>
                    ) : (<div className="mt-4">
                        <h3 className="font-bold">Extracted Watermark:</h3>
                        <p></p>
                    </div>)}
                </div>
            )}
        </div>
    );
};

export default ExtractWatermark;
