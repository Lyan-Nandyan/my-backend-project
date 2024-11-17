import React, { useState } from 'react';

const ExtractWatermark = () => {
    const [image, setImage] = useState(null);
    const [watermark, setWatermark] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fungsi untuk meng-handle perubahan gambar yang dipilih
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
            const response = await fetch('http://localhost:5000/api/watermark/extract', {
                method: 'POST',
                body: formData,  // Tidak perlu kirim token, karena token sudah ada di cookie
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

    return (
        <div>
            <h1>Extract Watermark from Image</h1>
            <input type="file" onChange={handleImageChange} />
            <button onClick={handleExtractWatermark} disabled={loading}>
                {loading ? 'Extracting...' : 'Extract Watermark'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {watermark && (
                <div>
                    <h3>Extracted Watermark:</h3>
                    <p>{watermark}</p>
                </div>
            )}
        </div>
    );
};

export default ExtractWatermark;
