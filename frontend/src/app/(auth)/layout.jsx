"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import MainConfig from "@/mainconfig";

export default function Page({ children }) {
    const API_BASE_URL = MainConfig.API_BASE_URL;
    const router = useRouter();

    useEffect(() => {
       
        const curtishCleanAuthToken = localStorage.getItem("curtishCleanAuthToken");
console.log(curtishCleanAuthToken,'curtishCleanAuthToken');

        if (curtishCleanAuthToken) {
            const fetchUserProfile = async (token) => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/auth/profileDetails`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const activeSubscription = response?.data?.activeSubscription;

                    console.log(response,'useresponser');
                    if (activeSubscription) {
                        toast.error("You cannot access this page as a logged-in user.");
                        router.push("/clinic");
                        
                    } 

                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            };
            fetchUserProfile(curtishCleanAuthToken);
        }
        
    }, [router, API_BASE_URL]);

    return <>{children}</>;
}
