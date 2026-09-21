import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Login from "../component/login/login";
import Dashboard from "../component/dashboard/dashboard";
import Employee from "../component/master/Employee";
import Designation from "../component/master/designation";
import Division from "../component/master/division";
import OrganizerList from "../component/master/organizerList";
import UserManagerList from "../component/admin/userMangerList";
import FormRoleAccess from "../component/admin/roleAccess";
import Requisition from "../component/training/requisition";
import Feedback from "../component/training/feedback";
import FeedbackList from "../component/training/feedbackList";
import Calendar from "../component/training/calendar";
import AddEditRequisition from "../component/training/addEditRequisition";
import SignAuthority from "../component/master/signAuthority";
import config from "../environment/config.js"
import { useState } from 'react';
import { setLocalStorageData } from "../service/auth.service.jsx";
import RequisitionApproval from "../component/training/requisitionApproval.jsx";
import Transaction from "../component/transaction/transaction.jsx";
import Evaluation from "../component/training/evaluation.jsx";
import Eligibility from "../component/master/eligibility.jsx";
import AllReportsTemplate from "../component/reports/AllReportsTemplate.jsx";
import HigherDegreeMtech from "../component/sponsorship/higherDegreeMtech.jsx";
import HigherDegreePhD from "../component/sponsorship/higherDegreePhD.jsx";
import HigherDegreeAddEdit from "../component/sponsorship/higherDegreeAddEdit.jsx";
import RequisitionApprovedList from "../component/approval/requisitionApprovedList.jsx";
import CepComponent from "../component/training/cep.jsx";
import AddEditCepComponent from "../component/training/addEditcep.jsx";
import DistributionComponent from "../component/training/distribution.jsx";
import AddEditDistributionComponent from "../component/training/distributionaddEdit.jsx";
import AuditStampingList from "../component/admin/auditStamping.jsx";
import Journal from "../component/training/journal.jsx";
import MandatoryTraining from "../component/training/mandatoryTraining.jsx";
import MandatoryTrainingAddEdit from "../component/training/mandatoryTrainingAddEdit.jsx";
import LicenseExp from "../component/license/licenseExp.component.jsx";
import ChangePassword from "../component/admin/changePassword.jsx";
import HandingOverList from "../component/admin/handingOverList.jsx";
import CashLimit from "../component/admin/cashLimit.jsx";
import SAHRTApprovalList from "../component/approval/saHrtApprovalLIst.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Layout from "./Layout.jsx";
import CourseList from "../component/master/courseList.jsx";


function AppRoutes() {

  const TMDS_URL = config.TMDS_URL;


  // NEW: Check if we are in a sync process immediately on load
  const isSyncing = new URLSearchParams(window.location.search).get("hrms") === "true";
  const [isCheckingSession, setIsCheckingSession] = useState(isSyncing);

  const location = useLocation();
  const navigate = useNavigate();
  // If syncing, ignore the current 'user' in storage for the first render
  const user = isSyncing ? null : JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const handleMessage = async (event) => {
      const URLs = config.URLs;
      // Security: Discard messages from untrusted origins
      if (!URLs.includes(event.origin)) return;

      // 1. Explicitly check for the LOGIN_SUCCESS type
      if (event.data?.type === "LOGIN_SUCCESS" && event.data?.user) {
        
        // 2. IMMEDIATELY send acknowledgment back to the parent
        if (event.source) {
          event.source.postMessage({ type: "LOGIN_ACK" }, event.origin);
        }

        // 3. Process the login payload
        localStorage.clear();
        localStorage.setItem("user", JSON.stringify(event.data.user));

        if (event.data.user.username) {
          await setLocalStorageData(event.data.user.username);
        }

        const module = event?.data?.module || "dashboard";
        sessionStorage.setItem("launchModule", module);
        sessionStorage.setItem("launchMode", module !== "dashboard");

        setIsCheckingSession(false);

        // 4. Safely clean up the URL without a page refresh
        const currentUrl = new URL(window.location.href);
        // Assuming 'ems' is the code. You might want to make this dynamic 
        // based on the app.code passed from the parent if multiple apps use this.
        currentUrl.searchParams.delete("hrms"); 
        window.history.replaceState({}, document.title, currentUrl.pathname + currentUrl.search);
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Failsafe timer: If handshake fails or takes too long, stop loading spinner
    const timer = setTimeout(() => {
      setIsCheckingSession(false);
    }, 3000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timer);
    };
  }, []);


  useEffect(() => {
    if (isCheckingSession) return;

    const publicPaths = ["/", "/login", "/license-exp"];
    if (!user && !publicPaths.includes(location.pathname)) {
      navigate("/login");
    }
  }, [user, location.pathname, navigate, isCheckingSession]);


  if (isCheckingSession && !user) {
    return (
      <div className="sync-overlay">
        <div className="loader-content">
          <div className="pulse-loader">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <h2 className="loading-text">Synchronizing Session</h2>
          <div className="loading-bar-container">
            <div className="loading-bar-fill"></div>
          </div>
        </div>
      </div>
    );
  };

  const hideHeader = ["/", "/login", "/license-exp"].includes(location.pathname);


  return (
    <>
      {!hideHeader}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute> <Layout /> </ProtectedRoute>} >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/designation" element={<Designation />} />
          <Route path="/division" element={<Division />} />
          <Route path="/course" element={<CourseList />} />
          <Route path="/organizer" element={<OrganizerList />} />
          <Route path="/users" element={<UserManagerList />} />
          <Route path="/roleaccess" element={<FormRoleAccess />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/cash-limit" element={<CashLimit />}/>
          <Route path="/requisition" element={<Requisition />} />
          <Route path="/feedback-add" element={<Feedback />} />
          <Route path="/feedback" element={<FeedbackList />} />
          <Route path="/req-add-edit" element={<AddEditRequisition />} />
          <Route path="/req-approval" element={<RequisitionApproval />} />
          <Route path="/sign-authority" element={<SignAuthority />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/eligibility" element={<Eligibility />} />
          <Route path="/reports" element={<AllReportsTemplate />} />
          <Route path="/degree-mtech" element={<HigherDegreeMtech />} />
          <Route path="/degree-phd" element={<HigherDegreePhD />} />
          <Route path="/higherDegree-add" element={<HigherDegreeAddEdit />} />
          <Route path="/req-approved-list" element={<RequisitionApprovedList />} />
          <Route path="/cep" element={<CepComponent />} />
          <Route path="/cep-add" element={<AddEditCepComponent />} />
          <Route path="/hr-distribution" element={<DistributionComponent />} />
          <Route path="/hr-distribution-add" element={<AddEditDistributionComponent />} />
          <Route path="/audit-stamping" element={<AuditStampingList />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/mandatory-training" element={<MandatoryTraining />} />
          <Route path="/mandatory-training-add" element={<MandatoryTrainingAddEdit />} />
          <Route path='/license-exp' element={<LicenseExp />} />
          <Route path="/password-change" element={<ChangePassword />} />
          <Route path="/handing-over" element={<HandingOverList />} />
          <Route path="/req-sa-approval" element={<SAHRTApprovalList />} />
        </Route>
      </Routes>

    </>
  );

}
export default AppRoutes;
