"use client";
import React from "react";
import Link from "next/link";
import MainConfig from "@/mainconfig";

export default function AdminFooter() {
    const currentYear = new Date().getFullYear();

    return (
       <div className="footer text-center bg-white p-2 border-top">
      <p className="text-dark mb-0">2025 &copy; <a href="javascript:void(0);" className="link-primary">Service Cue</a>, All Rights Reserved | Designed & Developed by <a href="https://supportsoft.com.au/" target="_blank">Supportsoft Technologies</a></p>
    </div>
    );
}
