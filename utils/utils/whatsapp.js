import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
import QRCode from "qrcode";

let clients = {};

export async function startWhatsApp(phone) {
    if (clients[phone]) return clients[phone];

    const { state, saveCreds } = await useMultiFileAuthState(`auth-${phone}`);
    const client = makeWASocket({ auth: state });

    client.ev.on("creds.update", saveCreds);
    clients[phone] = client;

    return client;
}

export async function generateQRCode(phone) {
    const client = await startWhatsApp(phone);
    if (!client) return null;

    return new Promise((resolve) => {
        client.ev.on("connection.update", async (update) => {
            if (update.qr) {
                const qrImage = await QRCode.toDataURL(update.qr);
                resolve(qrImage);
            }
        });
    });
}

export async function setProfilePicture(phone, buffer) {
    const client = await startWhatsApp(phone);
    if (!client) return false;

    await client.updateProfilePicture(phone, { url: buffer });
    return true;
}
