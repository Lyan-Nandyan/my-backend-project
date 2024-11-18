import React, { useState } from 'react';

const EncryptDecryptFile = () => {
    const [file, setFile] = useState(null);
    const [encryptedFileUrl, setEncryptedFileUrl] = useState('');
    const [decryptedFileUrl, setDecryptedFileUrl] = useState('');
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleEncryptSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Please select a PNG file to encrypt!');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploadStatus('Encrypting...');

            const response = await fetch('http://localhost:5000/api/file/encrypt', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                setUploadStatus('File encrypted successfully!');
                setEncryptedFileUrl(data.encryptedFilePath);
            } else {
                setUploadStatus(`Error: ${data.error}`);
            }
        } catch (error) {
            setUploadStatus('Encryption failed!');
            console.error(error);
        }
    };

    const handleDecryptSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Please select an encrypted file to decrypt!');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploadStatus('Decrypting...');

            const response = await fetch('http://localhost:5000/api/file/decrypt', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                setUploadStatus('File decrypted successfully!');
                setDecryptedFileUrl(data.decryptedFilePath);
            } else {
                setUploadStatus(`Error: ${data.error}`);
            }
        } catch (error) {
            setUploadStatus('Decryption failed!');
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Encrypt and Decrypt PNG File</h2>

            {/* Enkripsi Form */}
            <form onSubmit={handleEncryptSubmit}>
                <div>
                    <label>Select PNG File to Encrypt:</label>
                    <input type="file" onChange={handleFileChange} required />
                </div>
                <button type="submit">Encrypt File</button>
            </form>

            {uploadStatus && <p>{uploadStatus}</p>}

            {encryptedFileUrl && (
                <div>
                    <h3>Encrypted File:</h3>
                    <a href={encryptedFileUrl} target="_blank" rel="noopener noreferrer">
                        {encryptedFileUrl}
                    </a>
                </div>
            )}

            <hr />

            {/* Dekripsi Form */}
            <form onSubmit={handleDecryptSubmit}>
                <div>
                    <label>Select Encrypted File (.enc) to Decrypt:</label>
                    <input type="file" onChange={handleFileChange} required />
                </div>
                <button type="submit">Decrypt File</button>
            </form>

            {decryptedFileUrl && (
                <div>
                    <h3>Decrypted File:</h3>
                    <a href={decryptedFileUrl} target="_blank" rel="noopener noreferrer">
                        {decryptedFileUrl}
                    </a>
                </div>
            )}
        </div>
    );
};

export default EncryptDecryptFile;
