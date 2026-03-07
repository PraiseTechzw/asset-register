"use client";

import { useEffect } from "react";

export default function SWRegistration() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((reg) => console.log("Service Worker registered"))
                .catch((err) => console.error("Service Worker registration failed", err));
        }
    }, []);

    return null;
}
