import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Login from "../component/login/login";
import Dashboard from "../component/dashboard/dashboard";
import Employee from "../component/master/Employee";
import Designation from "../component/master/designation";
import Division from "../component/master/division";
import ProgramList from "../component/master/programList";
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
    // 1. Security check
    if (event.origin !== TMDS_URL) return;

    if (event.data.user) {
      
      // 2. Clear everything to prevent User A's data from hanging around
      localStorage.clear(); 
      localStorage.setItem("user", JSON.stringify(event.data.user));

      if (event.data.user.username) {
        await setLocalStorageData(event.data.user.username);
      }
      setIsCheckingSession(false);
      
      // This removes "?ibas=true" from the address bar WITHOUT refreshing the page
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  window.addEventListener("message", handleMessage);
  
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

    const publicPaths = ["/", "/login"];
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

  const hideHeader = ["/", "/login"].includes(location.pathname);


  return (
    <>
      {!hideHeader}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/designation" element={<Designation />} />
        <Route path="/division" element={<Division />} />
        <Route path="/course" element={<ProgramList />} />
        <Route path="/organizer" element={<OrganizerList />} />
        <Route path="/users" element={<UserManagerList />} />
        <Route path="/roleaccess" element={<FormRoleAccess />} />
        <Route path="/calendar" element={<Calendar />} />
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
      </Routes>

    </>
  );

}
export default AppRoutes;
