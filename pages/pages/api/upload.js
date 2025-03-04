import formidable from "formidable";
import fs from "fs";
import Jimp from "jimp";
import { startWhatsApp, setProfilePicture, generateQRCode } from "../../utils/whatsapp";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ message: "File upload error" });

        const phone = fields.phone;
        if (!phone) return res.status(400).json({ message: "WhatsApp number required" });

        const file = files.image;
        if (!file) return res.status(400).json({ message: "Image file required" });

        const image = await Jimp.read(file.filepath);
        const size = Math.min(image.bitmap.width, image.bitmap.height);

        image.crop((image.bitmap.width - size) / 2, (image.bitmap.height - size) / 2, size, size);
        image.resize(640, 640);
        const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

        const qrCode = await generateQRCode(phone);
        if (!qrCode) return res.status(500).json({ message: "Failed to generate QR code" });

        await setProfilePicture(phone, buffer);

        res.json({ message: "Profile Picture Updated!", qr: qrCode });
    });
}
