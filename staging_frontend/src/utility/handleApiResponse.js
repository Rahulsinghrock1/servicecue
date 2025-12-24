"use client";

import { toast } from "react-hot-toast";


export const handleSuccessResponse = (successResponse) => {
    const message = successResponse.message;
    if (message) {
        toast.success(message);
    }
    return true;
};


export const handleErrorResponse = (errorResponse) => {
    const statusCode = errorResponse.status || 500;
    let message = null;

    if (errorResponse.response) {
        message = errorResponse.response.data.message;
    } else {
        message = errorResponse.message;
    }

    if (message) {
        toast.error(message);
    }

    return true;
};
