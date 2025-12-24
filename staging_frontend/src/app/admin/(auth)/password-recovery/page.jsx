"use client"
import Link from "next/link";
import {useState, useEffect} from "react";
import {useRouter} from 'next/navigation';
import axios from 'axios';
import {toast} from 'react-hot-toast';
import { handleSuccessResponse, handleErrorResponse } from "@utility/handleApiResponse";
import MainConfig from "@/mainconfig";

export default function PasswordRecoveryPage() {
    const API_BASE_URL = MainConfig.API_BASE_URL;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
    });

    const handelInputChange = (e) => {
        const {name,value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]:value,
        }));
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        
        try {
            const payLoad = {
                email: formData.email,
                category:'forgot',
            };

            const response = await axios.post(`${API_BASE_URL}/auth/sendOtp`, payLoad);
            handleSuccessResponse(response.data);
            localStorage.setItem('forgotEmail', formData.email);
            router.push('/otp-verification');
        } 
        catch (error) {
            handleErrorResponse(error);
        }
        finally {
            setIsLoading(false);
        }
    };
    
    return (
        
            <div className="main-wrapper auth-bg position-relative overflow-hidden">
  <div className="container-fluid position-relative z-1">
    <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100 bg-white">
         <div className="row">
        {/* Left Side */}
        <div className="col-lg-6 p-0">
          <div className="login-backgrounds login-covers bg-theme-clr d-lg-flex align-items-center justify-content-center d-none flex-wrap p-4 position-relative h-100 z-0">
            <div className="authentication-card w-100">
              <div className="authen-overlay-item w-100">
                <div className="authen-head text-center">
                  <h1 className="text-white fs-32 fw-bold mb-2">
                    Seamless Client & Healthcare Staff Tracking Dashboard
                  </h1>
                  <p className="text-light fw-normal">
                    Experience efficient, secure, and user-friendly clinic management designed for clients and staff management.
                  </p>
                </div>
                <div className="mt-4 mx-auto authen-overlay-img">
                  <img src="web/assets/img/auth/cover-imgs-1.png" alt="Img" />
                </div>
              </div>
            </div>
            <img src="web/assets/img/auth/cover-imgs-2.png" alt="cover-imgs-2" className="img-fluid cover-img" />
          </div>
        </div>
        {/* Right Side */}
        <div className="col-lg-6 col-md-12 col-sm-12">
          <div className="row justify-content-center align-items-center overflow-auto flex-wrap vh-100 py-4">
            <div className="col-md-9 mx-auto">
                      <form onSubmit={handleSubmit}>
                        <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill">
                  <div className="mx-auto mb-4 text-center">
                    <img src="web/assets/img/logo.png" width="220" className="img-fluid" alt="Logo" />
                  </div>
                  <div className="card border-1 p-lg-3 shadow-md rounded-3 m-0">
                    <div className="card-body">
                                      <div class="text-center mb-3">
                            <h5 class="mb-1 fs-20 fw-bold">Forgot Password</h5>
                            <p className="text-center mb-4 lh-50">Please enter the email address associated with the account so that we can send you an OTP to reset the password.</p>
                            </div>
                                  <div class="mb-3">
                                                    <label class="form-label">Email Address</label>
                                                    <div class="input-group">
                                                        <span class="input-group-text border-end-0 bg-white">
                                                            <i class="ti ti-mail fs-19 text-dark"></i>
                                                        </span>
                     <input type="email" name="email" className="form-control" placeholder="Enter registered email address*" value={formData.email}
                                    onChange={handelInputChange} required />
                                                    </div>
                                                </div>
                            <div className="form-group mb-3">
                                <button type="submit" className="btn btn-lg bg-theme-clr text-white w-100" disabled={isLoading}>
                                    {isLoading ? (<span>Processing..</span>) : (<span>Reset Password</span>)}
                                </button>
                            </div>
                            <div class="text-center">
                            <h6 class="fw-normal fs-14 text-dark mb-0">Return to
                            <Link href="/login" className="hover-a">login</Link>
                            </h6>
                            </div>
                            </div>
                            </div>
                            </div>
                        </form>
              <p className="fs-14 text-dark text-center mt-4">
                Copyright  &copy; {new Date().getFullYear()} - ServiceCue.
              </p>
            </div>
          </div>
        </div>
      </div>
</div>
  </div>
</div>

        
    );
}
