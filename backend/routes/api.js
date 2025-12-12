require('module-alias/register');
const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
destination: (req, file, cb) => {
        cb(null, "uploads/categories"); // folder path
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    },
});
const portfolioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/portfolio"); // Portfolio का folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const uploadPortfolio = multer({ storage: portfolioStorage });
const upload = multer({ storage: storage });
const uploadProfilePic = require("@helpers/imageUpload");

const WebsiteController = require('@controllers/api/WebsiteController');
const validators = require('@validators/ApiValidator');
const { SplashScreens,Category,ProductCategory,sendEnquiry,clinicProfessionals,myEnquiry,faqs,getPage,Users,deleteUser,toggleUserStatus,admindashboardData,Pages,updatePage,forgotPassword,CategoryServices,CategoryTreatment,editProductPrescriptionsoptions,ProductType,ProductDose,dashboardData,lastactivetreatment,support,notifications,deleteNotifications, sendNewsletter, sendContactUsEnquiry,sendTreatmentNotifications } = require('@controllers/Common/commonController');
const { sendOtp,Logout,verifyOtp,register,clinicRegister,profileDetails,login,skiplogin,editProfile,changePassword,deleteAccount,clinicchangePassword } = require('@controllers/app/auth/authController');
const { createOrUpdate,getComments,editComment,addComment } = require('@controllers/app/ProgressController');
const { Clinic,ClinicDetails,addReview,getReviews,FollowClinic} = require('@controllers/app/ClinicController');
const { TreatmentPlan,AssignClient,createOrUpdateTreatmentPlan,deleteTreatmentPlan,clientDetails,Clients,clientTreatmentDetails,removeTreatmentImage,CompleteTreatmentPlan,changeGoalStatus,changeTreatmentStatus,dashboard,TreatmentDetails,TreatmentProgressDetails,clientTreatmentgoal,PreviousTreatmentPlan,markdonetreatment,markdoneproduct,newdashboard,productrepurchase} = require('@controllers/app/StaffController');
const { addSelectedProducts,createOrUpdateProduct,getProducts,allProducts,deleteProduct,ProductsDetails,deleteProductImage,ProductPrescriptions,treatmentProducts} = require('@controllers/api/ClinicController');
const authMiddleware = require('@middleware/authMiddleware');
router.post('/book-demo', validators.demoBookingValidator, WebsiteController.bookedDemo);
router.post('/addProduct', authMiddleware, createOrUpdateProduct);
router.post('/addSelectedProducts', authMiddleware, addSelectedProducts);
router.post('/getProducts', authMiddleware, getProducts);
router.post('/allProducts', authMiddleware, allProducts);
router.post('/treatmentProducts', authMiddleware, treatmentProducts);
router.post('/editProductPrescriptions', authMiddleware, ProductPrescriptions);
router.post('/ProductsDetails', authMiddleware, ProductsDetails);
router.delete('/products/:id', authMiddleware, deleteProduct);
router.delete('/deleteProductImage/:id', deleteProductImage);
router.get('/auth/profileDetails', authMiddleware, profileDetails);
router.get('/SplashScreens', SplashScreens);
router.get('/sendTreatmentNotifications', sendTreatmentNotifications);
router.get('/editProductPrescriptionsoptions', editProductPrescriptionsoptions);
router.get('/support', support);
router.post('/dashboardData', dashboardData);
router.post('/admindashboardData', admindashboardData);
router.post('/lastactivetreatment', lastactivetreatment);
router.post('/ProductType', ProductType);
router.post('/ProductDose', ProductDose);
router.post('/forgotPassword', forgotPassword);
router.get('/Pages', Pages);
router.post('/users', Users);
router.delete('/users/:id', deleteUser);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.put("/page/update/:slug", updatePage);
router.get('/faqs', faqs);
router.get('/pages/:slug', getPage);
router.post('/Category', Category);
router.post('/ProductCategory', ProductCategory);
router.post('/CategoryServices', CategoryServices);
router.post('/CategoryTreatment', CategoryTreatment);
router.post('/auth/sendOtp', sendOtp);
router.post('/auth/verifyOtp', verifyOtp);
router.post('/auth/register', register);
router.post('/auth/clinicRegister', clinicRegister);
router.post('/auth/login', login);
router.post('/skiplogin', skiplogin);
router.post('/auth/logout', authMiddleware, Logout);
router.get('/auth/profileDetails', authMiddleware, profileDetails);
router.post('/auth/changePassword', authMiddleware, changePassword);
router.post('/clinicchangePassword', clinicchangePassword);
router.post('/auth/deleteAccount', authMiddleware, deleteAccount);
router.post('/auth/editProfile', authMiddleware, editProfile);
router.post('/auth/sendEnquiry', authMiddleware, sendEnquiry);
router.post('/auth/myEnquiry', authMiddleware, myEnquiry);
router.post('/auth/Progress/createOrUpdate', authMiddleware, createOrUpdate);
router.post('/auth/Progress/getComments', authMiddleware, getComments);
router.put('/auth/Progress/editComment', authMiddleware, editComment);
router.post('/auth/Progress/addComment', authMiddleware, addComment);
router.put('/auth/changeGoalStatus', authMiddleware, changeGoalStatus);
router.put('/auth/removeTreatmentImage', authMiddleware, removeTreatmentImage);
router.post('/auth/CompleteTreatmentPlan', authMiddleware, CompleteTreatmentPlan);
router.put('/auth/changeTreatmentStatus', authMiddleware, changeTreatmentStatus);
router.put('/auth/markdonetreatment', authMiddleware, markdonetreatment);
router.put('/auth/productrepurchase', authMiddleware, productrepurchase);
router.get('/auth/notifications', authMiddleware, notifications);
router.post('/auth/deleteNotifications', authMiddleware, deleteNotifications);
router.post('/auth/markdoneproduct', authMiddleware, markdoneproduct);
router.post('/auth/clinicProfessionals', authMiddleware, clinicProfessionals);
router.post('/auth/Clinic', authMiddleware, Clinic);
router.post('/auth/Clinic/addReview', authMiddleware, addReview);
router.get('/auth/Clinic/:id', authMiddleware, ClinicDetails);
router.post('/auth/Clinic/FollowClinic', authMiddleware,FollowClinic);
router.get('/auth/Clinic/getReviews/:id', authMiddleware, getReviews);
router.get('/auth/Client/AssignClient', authMiddleware, AssignClient);
router.post('/auth/Client/Clients', authMiddleware, Clients);
router.get('/auth/Client/clientDetails/:id', authMiddleware, clientDetails);
router.get('/auth/Client/clientTreatmentDetails/:id', authMiddleware, clientTreatmentDetails);
router.get('/auth/Client/clientTreatmentgoal/:id', authMiddleware, clientTreatmentgoal);
router.get('/auth/Client/TreatmentProgressDetails/:id', authMiddleware, TreatmentProgressDetails);
router.get('/auth/Client/TreatmentDetails/:id', authMiddleware, TreatmentDetails);
router.post('/auth/Client/AddTreatmentPlan', authMiddleware, createOrUpdateTreatmentPlan);
router.post('/auth/Client/TreatmentPlan', authMiddleware, TreatmentPlan);
router.post('/auth/Client/PreviousTreatmentPlan', authMiddleware, PreviousTreatmentPlan);
router.post('/auth/Client/dashboard', authMiddleware, newdashboard);
router.post('/auth/Client/newdashboard', authMiddleware, newdashboard);
router.delete('/Client/TreatmentPlan/:id', authMiddleware, deleteTreatmentPlan);
// WEB
const FaqController = require('@controllers/admin/FaqController');
const serviceController = require("@controllers/admin/serviceController");
const categoryController = require("@controllers/admin/categoryController");
const authController = require("@controllers/admin/authController");
const ClinicServicesController = require("@controllers/clinic/ClinicServicesController");
const ClinicStaffController = require("@controllers/clinic/ClinicStaffController");
const ClinicClientController = require("@controllers/clinic/ClinicClientController");
const ClinicProductController = require("@controllers/clinic/ClinicProductController");
const DealerSubscriptionController = require("@controllers/SubscriptionController");
// FAQ
router.post('/faqs', FaqController.addFaq);
router.put('/faqs/:id', FaqController.editFaq);
router.delete('/faqs/:id', FaqController.deleteFaq);
// Services
router.get("/services", serviceController.getServices);
router.post("/services", serviceController.createService);
router.put("/services/:id", serviceController.updateService);
router.delete("/services/:id", serviceController.deleteService);
// Category
router.post("/Category/create", upload.single("image"), categoryController.create);
router.post("/Category/update/:id", upload.single("image"), categoryController.update);
router.delete("/Category/:id", categoryController.delete);
router.post("/updateProfile", authController.updateProfile);
router.post("/SaveClinicServices", ClinicServicesController.SaveClinicServices);
router.post("/GetClinicServices", ClinicServicesController.GetClinicServices);
router.post(
  "/clinic-portfolio/save",
  uploadPortfolio.array("images", 20), 
  ClinicServicesController.SaveClinicPortfolio
);
router.post("/clinic-portfolio/get", ClinicServicesController.GetClinicPortfolio);
router.delete("/clinic-portfolio/:id", ClinicServicesController.DeleteClinicPortfolio);

// Save / Update
router.post("/clinic-operational-details", ClinicServicesController.SaveClinicOperational);
router.post("/AddClinicTreatment", ClinicServicesController.AddClinicTreatment);
router.post("/SaveClinicServiceInstructions", ClinicServicesController.SaveClinicServiceInstructions);
router.post("/ClinicServiceInstructions", ClinicServicesController.ClinicServiceInstructions);
// Get by clinic_id
router.post("/clinic-operational-details/get", ClinicServicesController.GetClinicOperational);
// Delete by clinic_id
router.delete("/clinic-operational-details/:clinic_id", ClinicServicesController.DeleteClinicOperational);
router.get('/Clinic/details/:id', serviceController.ClinicDetails);
// Staff
router.post('/add-staff', uploadProfilePic, ClinicStaffController.SaveOrUpdateStaff);
router.post('/assign-clients', ClinicStaffController.AssignedClients);
router.post('/assignedclientslist', ClinicStaffController.getAssignedClientsByStaff);
router.post('/staffList', ClinicStaffController.getStaffsWithClientCount);
router.post('/unassignClient', ClinicStaffController.unassignClient);
router.post('/unassignStaff', ClinicStaffController.unassignStaff);
router.get('/staff/details/:id', ClinicStaffController.staffDetails);
router.post('/staff/certificates', ClinicStaffController.staffCertificates);
router.delete("/staff-certificates/:id", ClinicStaffController.DeleteStaffCertificates);
// Client
router.post('/add-client', uploadProfilePic, ClinicClientController.SaveOrUpdateClient);
router.post('/add-client-ByStaff', uploadProfilePic, ClinicClientController.SaveOrUpdateClientByStaff);
router.post('/assignedclientBystaff', uploadProfilePic, ClinicClientController.assignedclientBystaff);
router.post('/search-client', ClinicClientController.searchClient);
router.get('/client/details/:id', ClinicClientController.clientDetails);
router.delete('/client/delete/:id', ClinicClientController.deleteClient);
router.post('/Clinic/enquiries/', ClinicClientController.getEnquiries);
router.delete('/Clinic/enquiries/delete/:id', ClinicClientController.deleteEnquiries);
router.post('/clientList', ClinicClientController.getClientWithStaffCount);
router.post('/assignedstafflist', ClinicClientController.assignedStaffList);
router.patch("/client/:id/toggle-status", ClinicClientController.toggleClientStatus);
router.post('/assign-staff', ClinicClientController.AssignedStaff);
router.post('/past-treatment-planList', ClinicClientController.PastTreatmentPlanList);
// Product
router.post('/add-product', uploadProfilePic, ClinicProductController.SaveOrUpdateProduct);
router.patch("/product/:id/toggle-status", ClinicProductController.toggleProductStatus);

router.get('/get-plans-list', DealerSubscriptionController.getPlansList);
router.post('/subscribe-user', DealerSubscriptionController.subscribeUser);
router.get('/my-subscription', DealerSubscriptionController.mySubscription);
router.get('/my-subscription-details', DealerSubscriptionController.getMySubscriptionDetails);
router.post('/change-plan', DealerSubscriptionController.changePlan);
router.post('/cancel-subscription', DealerSubscriptionController.cancelSubscription);


router.post('/send-newsletter', sendNewsletter);
router.post('/contact-us-form', sendContactUsEnquiry);


module.exports = router;
