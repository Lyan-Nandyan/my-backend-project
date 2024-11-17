import React, { useState } from 'react';

const UploadImage = () => {
    const [image, setImage] = useState(null);
    const [watermarkText, setWatermarkText] = useState('');
    const [uploadStatus, setUploadStatus] = useState(null);
    const [imageUrl, setImageUrl] = useState('');

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

        if (!image || !watermarkText) {
            alert('Please select an image and enter watermark text');
            return;
        }

        const formData = new FormData();
        formData.append('image', image);
        formData.append('watermarkText', watermarkText);

        try {
            setUploadStatus('Uploading...');

            const response = await fetch('http://localhost:5000/api/watermark/upload', {
                method: 'POST',
                body: formData,  // Tidak perlu kirim token, karena token sudah ada di cookie
                credentials: 'include',  // Pastikan cookie dikirim dengan request
            });

            const data = await response.json();

            if (response.ok) {
                setUploadStatus('Image uploaded and watermarked successfully!');
                setImageUrl(data.imageUrl);  // Menampilkan gambar yang sudah diupload dan ada watermark-nya
            } else {
                setUploadStatus(`Error: ${data.error}`);
            }
        } catch (error) {
            setUploadStatus('Upload failed!');
            console.error(error);
        }
    };

    // Fungsi untuk mengunduh gambar
    const handleDownload = async () => {
        if (!imageUrl) return;

        try {
            const response = await fetch(imageUrl);  // Mengambil gambar dari URL
            const blob = await response.blob();  // Mengonversi gambar menjadi Blob
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);  // Membuat URL objek dari Blob
            link.download = 'watermarked_image.png';  // Menentukan nama file yang diunduh
            link.click();  // Memaksa klik pada tautan untuk mengunduh
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    return (
        <div>
            <h2>Upload Image with Watermark</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="image">Select Image:</label>
                    <input type="file" id="image" onChange={handleImageChange} required />
                </div>

                <div>
                    <label htmlFor="watermarkText">Watermark Text:</label>
                    <input
                        type="text"
                        id="watermarkText"
                        value={watermarkText}
                        onChange={handleWatermarkChange}
                        required
                    />
                </div>

                <button type="submit">Upload Image</button>
            </form>

            {uploadStatus && <p>{uploadStatus}</p>}

            {imageUrl && (
                <div>
                    <h3>Watermarked Image:</h3>
                    <img src={imageUrl} alt="Watermarked" />
                    <button onClick={handleDownload}>
                        Download Watermarked Image
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadImage;
