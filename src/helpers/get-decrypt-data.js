
export const getDecryptedData = async (data) => {
    let bufferObjj = Buffer.from(data, "base64"); // Create a buffer from the string
    let decodedString = JSON.parse(bufferObjj.toString("utf8")) // Encode the Buffer as a utf8 string

    let token = decodedString?.token;
    return { token, decodedString };
}