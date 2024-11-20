const AWS = require('aws-sdk');
const middy = require('@middy/core');
const multipartParser = require('@middy/multipart-parser');
const S3 = new AWS.S3();
const DynamoDB = new AWS.DynamoDB.DocumentClient();

// Upload photo to S3
const uploadPhoto = async (event) => {
  try {
    // Photo parsing via middleware
    const { photo } = event.body; // `event.body` is now parsed by the `multipartParser` middleware

    if (!photo) {
      throw new Error("Photo file not found in the request.");
    }

    const photoId = `${Date.now()}`;
    const params = {
      Bucket: process.env.BUCKET_NAME, // Make sure the bucket name is set in the environment
      Key: `${photoId}-${photo.filename}`,
      Body: photo.content, // The content of the file (already parsed by multipartParser)
      ContentType: photo.contentType, // The content type of the file
    };

    // Upload the photo to S3
    await S3.upload(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Photo uploaded successfully!',
        photoId,
        fileName: `${photoId}-${photo.filename}`,
      }),
    };
  } catch (error) {
    console.error("Upload photo error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Photo upload failed',
        error: error.message,
      }),
    };
  }
};

module.exports.uploadPhoto = middy(uploadPhoto)
  .use(multipartParser()); // Use the multipartParser middleware

// Get photos (by ID) from S3
const getPhotos = async (event) => {
  try {
    const { photoId } = event.pathParameters; // Example of accessing the photoId from the path parameters

    if (!photoId) {
      throw new Error("Photo ID is required.");
    }

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: photoId,
    };

    const data = await S3.getObject(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Photo retrieved successfully!',
        data, // You may choose to return metadata or content, depending on the use case
      }),
    };
  } catch (error) {
    console.error("Get photo error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Photo retrieval failed',
        error: error.message,
      }),
    };
  }
};

module.exports.getPhotos = middy(getPhotos);
