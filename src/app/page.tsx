"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
    useAccount,
    useReadContract,
    useReadContracts,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import { Course } from "@/types/contracts";
import CourseMarketABI from "@/abis/CourseMarket.json";
import YiDengTokenABI from "@/abis/YiDengToken.json";
import toast from "react-hot-toast";
import { parseEther, formatEther } from "viem";

const courseAddress = process.env
    .NEXT_PUBLIC_COURSE_MARKET_ADDRESS as `0x${string}`;
const tokenAddress = process.env
    .NEXT_PUBLIC_YIDENG_TOKEN_ADDRESS as `0x${string}`;

const Home: React.FC = () => {
    const { t } = useTranslation();
    const { address } = useAccount();
    const [courses, setCourses] = useState<Course[]>([]);
    const [ethAmount, setEthAmount] = useState<string>("");
    const [ydBalance, setYdBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // 获取 YD 余额
    const { data: ydBalanceData, refetch: refetchBalance } = useReadContract({
        address: tokenAddress,
        abi: YiDengTokenABI,
        functionName: "balanceOf",
        args: [address],
        query: {
            enabled: !!address,
        },
    });

    useEffect(() => {
        if (ydBalanceData) {
            setYdBalance(Number(formatEther(ydBalanceData as bigint)));
        }
    }, [ydBalanceData]);

    // Get course count
    const { data: courseCount, isLoading: isLoadingCount } = useReadContract({
        address: courseAddress,
        abi: CourseMarketABI,
        functionName: "courseCount",
    });

    // Fetch multiple courses in parallel
    // Generate contract calls for all courses
    const [courseIds, setCourseIds] = useState<number[]>([]);

    useEffect(() => {
        if (!courseCount) return;

        const totalCourses = Number(courseCount);
        if (totalCourses <= 0) {
            setIsLoading(false);
            return;
        }

        setCourseIds(Array.from({ length: totalCourses }, (_, i) => i + 1));
    }, [courseCount]);

    const { data: coursesData } = useReadContracts({
        contracts: courseIds.map((id) => ({
            address: courseAddress as `0x${string}`,
            abi: CourseMarketABI as any,
            functionName: "getCourse",
            args: [id],
        })),
    });

    // Process the data when it changes
    useEffect(() => {
        if (!coursesData) return;
        const courseList: Course[] = coursesData
            .filter((result) => result.status === "success" && result.result)
            .map((item) => {
                return item.result;
            })
            .filter((course): course is Course =>
                Boolean(course && (course as Course).isActive)
            );

        setCourses(courseList);
        setIsLoading(false);
    }, [coursesData]);

    // ETH 购买 YD 代币
    const {
        data: buyHash,
        writeContract: buyTokens,
        error: buyError,
    } = useWriteContract();
    const { isLoading: isBuying, isSuccess: buySuccess } =
        useWaitForTransactionReceipt({
            hash: buyHash,
        });

    const handleRecharge = async () => {
        if (!address) {
            toast.error(t("wallet.connectWallet"), {
                style: {
                    background: "#2A2A3E",
                    color: "#FFFFFF",
                    border: "1px solid #FF0000",
                },
            });
            return;
        }

        const amount = parseFloat(ethAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error(t("wallet.invalidAmount"), {
                style: {
                    background: "#2A2A3E",
                    color: "#FFFFFF",
                    border: "1px solid #FF0000",
                },
            });
            return;
        }

        try {
            toast.loading(t("wallet.buying"), {
                style: {
                    background: "#2A2A3E",
                    color: "#FFFFFF",
                    border: "1px solid #4CAF50",
                },
            });

            await buyTokens({
                address: tokenAddress,
                abi: YiDengTokenABI,
                functionName: "buyWithETH",
                value: parseEther(ethAmount),
            });
        } catch (error) {
            console.error("Buy tokens failed:", error);
            toast.dismiss();
            toast.error(t("wallet.buyFailed"), {
                style: {
                    background: "#2A2A3E",
                    color: "#FFFFFF",
                    border: "1px solid #FF0000",
                },
            });
        }
    };

    // 购买成功后更新余额
    useEffect(() => {
        if (buySuccess) {
            toast.dismiss();
            toast.success(t("wallet.buySuccess"), {
                style: {
                    background: "#2A2A3E",
                    color: "#FFFFFF",
                    border: "1px solid #4CAF50",
                },
            });
            setEthAmount("");
            refetchBalance(); // 刷新余额
        }
    }, [buySuccess, refetchBalance]);

    // 购买失败时显示错误
    useEffect(() => {
        if (buyError) {
            toast.dismiss();
            toast.error(t("wallet.buyFailed"), {
                style: {
                    background: "#2A2A3E",
                    color: "#FFFFFF",
                    border: "1px solid #FF0000",
                },
            });
        }
    }, [buyError]);

    // 假设 1 ETH = 1000 YD（根据合约实际兑换率调整）
    const calculatedYdTokens = ethAmount ? Number(ethAmount) * 1000 : 0;

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="container mx-auto pt-20 pb-8">
                {/* Top section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Welcome module - Left side */}
                    <div className="flex flex-col justify-center order-2 md:order-1">
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl font-bold text-[#4CAF50] mb-3"
                        >
                            {t("home.welcome")}
                        </motion.h3>
                        <p className="text-gray-400 mb-6">
                            {t("home.welcomeDescription")}
                        </p>
                        <div className="flex space-x-8">
                            <div className="text-center">
                                <span className="text-2xl font-semibold text-white block">
                                    50+
                                </span>
                                <p className="text-sm text-gray-400">
                                    {t("home.courses")}
                                </p>
                            </div>
                            <div className="text-center">
                                <span className="text-2xl font-semibold text-white block">
                                    24/7
                                </span>
                                <p className="text-sm text-gray-400">
                                    {t("home.support")}
                                </p>
                            </div>
                            <div className="text-center">
                                <span className="text-2xl font-semibold text-white block">
                                    1000+
                                </span>
                                <p className="text-sm text-gray-400">
                                    {t("home.students")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recharge module - Right side */}
                    <div className="recharge-card backdrop-blur-sm bg-[#1e1e2d]/60 p-6 rounded-xl border border-gray-700 order-1 md:order-2">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-semibold text-white">
                                {t("wallet.buyTokens")}
                            </h3>
                            <span className="text-sm px-3 py-1 bg-[#4CAF50]/20 rounded-full text-[#4CAF50]">
                                {t("wallet.balance")}: {ydBalance}{" "}
                                {t("currency")}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4 mb-5">
                            <div className="flex-1">
                                <label className="text-sm text-gray-400 block mb-1">
                                    {t("wallet.youPay")}
                                </label>
                                <input
                                    type="number"
                                    value={ethAmount}
                                    onChange={(e) =>
                                        setEthAmount(e.target.value)
                                    }
                                    placeholder="0"
                                    className="w-full bg-[#3A3A4E] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/50"
                                />
                            </div>
                            <span className="text-gray-400 text-xl">→</span>
                            <div className="flex-1">
                                <label className="text-sm text-gray-400 block mb-1">
                                    {t("wallet.youGet")}
                                </label>
                                <input
                                    type="number"
                                    value={calculatedYdTokens}
                                    disabled
                                    className="w-full bg-[#3A3A4E] text-white p-3 rounded-lg"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleRecharge}
                            className="w-full bg-[#4CAF50] text-white px-4 py-3 rounded-lg hover:bg-[#3e8e41] transition font-medium"
                        >
                            {t("wallet.buyNow")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Course list */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">
                    {t("home.popularCourses")}
                </h2>
                <p className="text-gray-400 mb-4">{t("home.findCourses")}</p>
                <div className="flex items-center justify-center">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-500 to-transparent w-full max-w-[600px]"></div>
                </div>
            </div>
            <div className="container mx-auto">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, staggerChildren: 0.15 }}
                >
                    {isLoading ? (
                        <motion.div
                            className="col-span-3 text-center py-16 backdrop-blur-sm bg-[#1e1e2d]/40 rounded-xl border border-gray-700"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="text-gray-400 text-lg">
                                {t("home.loading")}
                            </p>
                        </motion.div>
                    ) : courses.length > 0 ? (
                        courses.map((course, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow:
                                        "0 12px 24px rgba(76, 175, 80, 0.15)",
                                }}
                                className="transform transition-all duration-300 backdrop-blur-sm bg-[#1e1e2d]/60 border border-gray-700 hover:border-[#4CAF50]/50 rounded-xl overflow-hidden shadow-lg hover:shadow-[#4CAF50]/20"
                            >
                                <CourseCard course={course} />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            className="col-span-3 text-center py-16 backdrop-blur-sm bg-[#1e1e2d]/40 rounded-xl border border-gray-700"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="text-gray-400 text-lg">
                                {t("home.noCourses")}
                            </p>
                            <button className="mt-4 px-6 py-2 bg-[#4CAF50]/20 hover:bg-[#4CAF50]/30 text-[#4CAF50] rounded-full transition-all">
                                {t("home.refreshCourses")}
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
