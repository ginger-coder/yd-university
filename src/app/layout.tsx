"use client";
import "./globals.css";
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import en from "../public/locales/en.json";
import zh from "../public/locales/zh.json";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container } from "@tsparticles/engine";
import { Web3Provider } from "@/components/Web3Provider";
import { Toaster } from "react-hot-toast";

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        zh: { translation: zh },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [init, setInit] = useState(false);
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = async (container?: Container): Promise<void> => {
        console.log(container);
    };
    return (
        <html lang="en">
            <body>
                <Web3Provider>
                    <I18nextProvider i18n={i18n}>
                        <div className="relative min-h-screen">
                            {init && (
                                <Particles
                                    id="tsparticles"
                                    particlesLoaded={particlesLoaded}
                                    options={{
                                        background: {
                                            color: { value: "#1A1A2E" },
                                        },
                                        particles: {
                                            number: {
                                                value: 50,
                                                density: {
                                                    enable: true,
                                                    area: 800,
                                                },
                                            },
                                            color: { value: "#00FF00" }, // 绿色粒子
                                            shape: { type: "circle" },
                                            opacity: { value: 0.3 },
                                            size: { value: 3, random: true },
                                            move: {
                                                enable: true,
                                                speed: 1,
                                                direction: "none",
                                                random: true,
                                            },
                                        },
                                    }}
                                    className="particle-background"
                                />
                            )}
                            {children}
                            <Toaster
                                position="top-center"
                                toastOptions={{
                                    style: {
                                        background: "#2A2A3E",
                                        color: "#FFFFFF",
                                        border: "1px solid #00FF00",
                                        zIndex: 9999, // 确保 z-index 足够高
                                    },
                                }}
                            />
                        </div>
                    </I18nextProvider>
                </Web3Provider>
            </body>
        </html>
    );
}
