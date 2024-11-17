const Jimp = require('jimp');

// Fungsi untuk menambahkan watermark (menggunakan LSB)
const addWatermark = async (imagePath, watermarkText) => {
    try {
        console.log('Processing image at:', imagePath);  // Log file path
        const image = await Jimp.read(imagePath);
        const width = image.bitmap.width;
        const height = image.bitmap.height;

        const watermarkBuffer = Buffer.from(watermarkText, 'utf-8');
        let watermarkIndex = 0;

        image.scan(0, 0, width, height, (x, y, idx) => {
            if (watermarkIndex < watermarkBuffer.length) {
                const byte = watermarkBuffer[watermarkIndex++];
                const pixel = image.getPixelColor(x, y);
                const red = (pixel >> 24) & 0xFF;
                const green = (pixel >> 16) & 0xFF;
                const blue = (pixel >> 8) & 0xFF;

                image.setPixelColor(
                    (red & 0xFE) << 24 | (green & 0xFE) << 16 | (blue & 0xFE) << 8 | (byte & 0xFF),
                    x,
                    y
                );
            }
        });

        const timestamp = Date.now();
        const watermarkedImagePath = `uploads/watermarked_image_${timestamp}.png`;
        await image.writeAsync(watermarkedImagePath);
        console.log('Watermarked image saved to:', watermarkedImagePath);  // Log image saved path
        return watermarkedImagePath;
    } catch (error) {
        console.error('Error in watermarking process:', error);  // Log error
        throw new Error('Failed to add watermark');
    }
};

module.exports = { addWatermark };