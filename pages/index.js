import { useState } from "react";

export default function Home() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [phone, setPhone] = useState("");
    const [qrCode, setQrCode] = useState(null);
    const [message, setMessage] = useState("");

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!image) return alert("Please upload an image!");
        if (!phone) return alert("Please enter your WhatsApp number!");

        const formData = new FormData();
        formData.append("image", image);
        formData.append("phone", phone);

        setMessage("Processing... Please wait.");

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (data.qr) {
            setQrCode(data.qr);
            setMessage("Scan the QR code to link your WhatsApp.");
        } else {
            setMessage(data.message);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Set WhatsApp Full DP</h1>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {preview && <img src={preview} alt="Preview" style={{ width: "200px", height: "200px", objectFit: "cover" }} />}
            
            <input type="text" placeholder="Enter WhatsApp Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            
            <button onClick={handleSubmit}>Upload & Set DP</button>

            {qrCode && <img src={qrCode} alt="Scan QR Code" />}
            {message && <p>{message}</p>}
        </div>
    );
}
