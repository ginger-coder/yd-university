import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { signMessage } from "viem/actions";

const Navbar: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { address, isConnected, isConnecting } = useAccount();
    const { data: walletClient } = useWalletClient();

    // 从 localStorage 初始化 hasSigned 状态
    const [hasSigned, setHasSigned] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(`hasSigned_${address}`);
            return stored === "true";
        }
        return false;
    });

    const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

    // 签名授权
    const signMessageAction = async () => {
        if (!walletClient || !address || hasSigned) {
            console.log(
                "Cannot sign: walletClient, address, or hasSigned condition not met",
                {
                    walletClient: !!walletClient,
                    address: !!address,
                    hasSigned,
                }
            );
            return;
        }

        try {
            const message = `Welcome to Web3 College!\n\nPlease sign this message to authorize your wallet.\n\nAddress: ${address}`;
            const signature = await signMessage(walletClient, { message });
            setHasSigned(true);
            // 存储签名状态到 localStorage
            localStorage.setItem(`hasSigned_${address}`, "true");
            toast.success("Signature authorized successfully!", {
                style: {
                    background: "#2A2A3E",
                    color: "#FFFFFF",
                    border: "1px solid #00FF00",
                },
            });
            console.log("Signature:", signature);
        } catch (error) {
            console.error("Signature failed:", error);
            toast.error("Signature authorization failed.", {
                style: {
                    background: "#2A2A3E",
                    color: "#FFFFFF",
                    border: "1px solid #FF0000",
                },
            });
        }
    };

    // 监听钱包连接状态
    useEffect(() => {
        console.log("useEffect triggered:", {
            isConnected,
            walletClient: !!walletClient,
            hasSigned,
        });
        if (isConnected && walletClient && !hasSigned && !isConnecting) {
            console.log("Showing toast for signature authorization");
            toast(
                (t) => (
                    <div className="flex flex-col items-center space-y-2">
                        <p>Please sign to authorize your wallet.</p>
                        <button
                            onClick={() => {
                                signMessageAction();
                                toast.dismiss(t.id);
                            }}
                            className="bg-[#00FF00] text-black px-4 py-2 rounded-lg hover:bg-[#00CC00] transition"
                        >
                            Sign Now
                        </button>
                    </div>
                ),
                {
                    duration: Infinity,
                    id: `signature-toast-${address}`, // 确保 toast ID 唯一，避免重复弹出
                }
            );
        }
    }, [isConnected, walletClient, hasSigned, isConnecting, address]);

    // 监听地址变化，重置签名状态
    useEffect(() => {
        if (address) {
            const stored = localStorage.getItem(`hasSigned_${address}`);
            setHasSigned(stored === "true");
        } else {
            setHasSigned(false);
        }
    }, [address]);

    return (
        <nav className="bg-[#1A1A2E] text-white p-4 flex justify-between items-center shadow-lg">
            <div className="flex items-center space-x-6">
                <h1 className="text-2xl font-bold text-[#00FF00]">
                    WEB3 COLLEGE
                </h1>
                <div className="flex space-x-6 text-sm font-medium">
                    <a
                        href="#"
                        className="text-gray-400 hover:text-white transition"
                    >
                        Marketplace
                    </a>
                    <a
                        href="#"
                        className="text-gray-400 hover:text-white transition"
                    >
                        Learning Center
                    </a>
                    <a
                        href="#"
                        className="text-gray-400 hover:text-white transition"
                    >
                        Contact
                    </a>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <ConnectKitButton showAvatar={true} />
                <div className="relative group">
                    <button className="flex items-center bg-[#2A2A3E] px-3 py-2 rounded-lg hover:bg-[#3A3A4E] transition">
                        <GlobeAltIcon className="w-5 h-5 mr-2" />
                        <span>{t("navbar.language")}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-32 bg-[#2A2A3E] rounded-lg shadow-lg hidden group-hover:block">
                        <button
                            onClick={() => changeLanguage("en")}
                            className="block w-full text-left px-4 py-2 hover:bg-[#3A3A4E]"
                        >
                            English
                        </button>
                        <button
                            onClick={() => changeLanguage("zh")}
                            className="block w-full text-left px-4 py-2 hover:bg-[#3A3A4E]"
                        >
                            中文
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;