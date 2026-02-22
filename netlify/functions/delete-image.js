const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { public_id } = JSON.parse(event.body);

        if (!public_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'public_id is required' }),
            };
        }

        console.log('Attempting to delete image:', public_id);
        const result = await cloudinary.uploader.destroy(public_id);

        return {
            statusCode: 200,
            body: JSON.stringify({ result }),
        };
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
