import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Course } from "../types/contracts";
import BuyButton from "./BuyButton";
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import CourseMarketABI from "@/abis/CourseMarket.json";
import YiDengTokenABI from "@/abis/YiDengToken.json";

interface CourseCardProps {
    course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const { t } = useTranslation();
    const { address } = useAccount();
    const [purchasing, setPurchasing] = useState(false);

    const { data: approveHash, writeContract: approve } = useWriteContract();
    const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({
        hash: approveHash,
    });

    const { data: purchaseHash, writeContract: purchase } = useWriteContract();
    const { isSuccess: purchaseSuccess } = useWaitForTransactionReceipt({
        hash: purchaseHash,
    });

    const buyCourse = async () => {
        if (!address) {
            alert("Please connect wallet");
            return;
        }
        setPurchasing(true);

        try {
            await approve({
                address: process.env
                    .NEXT_PUBLIC_YIDENG_TOKEN_ADDRESS as `0x${string}`,
                abi: YiDengTokenABI,
                functionName: "approve",
                args: [
                    process.env.NEXT_PUBLIC_COURSE_MARKET_ADDRESS,
                    course.price,
                ],
            });
        } catch (error) {
            console.error("Approve failed:", error);
            setPurchasing(false);
            alert("Approve failed");
        }
    };

    useEffect(() => {
        if (approveSuccess && !purchaseHash) {
            purchase({
                address: process.env
                    .NEXT_PUBLIC_COURSE_MARKET_ADDRESS as `0x${string}`,
                abi: CourseMarketABI,
                functionName: "purchaseCourse",
                args: [course.web2CourseId],
            });
        }
    }, [approveSuccess, purchaseHash]);

    useEffect(() => {
        if (purchaseSuccess) {
            setPurchasing(false);
            alert("Course purchased successfully!");
        }
    }, [purchaseSuccess]);

    return (
        <div className="card flex flex-col bg-white shadow-sm hover:shadow-lg p-5 rounded-xl transition-all duration-300 border-t border-l border-indigo-50">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-400 font-medium">
                    {new Date("2024-12-26").toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-full">
                    <span className="text-amber-500">★</span>
                    <span className="text-xs font-medium text-gray-700">
                        4.8
                    </span>
                </div>
            </div>

            <h3 className="text-lg font-bold mb-2 text-gray-800">
                {course.name}
            </h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2 font-light">
                {course.web2CourseId}
            </p>

            <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                <span className="text-base font-semibold text-indigo-600">
                    {course.price} YD
                </span>
                <BuyButton
                    onClick={buyCourse}
                    purchasing={purchasing}
                    className="group bg-green-600 text-white p-2.5 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-70 flex items-center justify-center"
                />
            </div>
        </div>
    );
};

export default CourseCard;
