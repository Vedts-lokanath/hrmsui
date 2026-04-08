import { useEffect, useMemo, useState } from "react";
import Navbar from "../navbar/Navbar";
import { getCourseDashboardCount, getRequisitionDashboardCount, getRequisitionUserDashboardCount } from "../../service/dashboard.service";
import "./dashboard.css";
import { FaBookReader, FaCheckCircle, FaClock, FaDatabase, FaList, FaShare, FaThumbsUp, FaUniversity } from "react-icons/fa";
import { BsFillBookmarkStarFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import DashboardReminderPopup from "./dashboardReminderPopup";
import { getFeedbackList, getRequisitions } from "../../service/training.service";

export const getCurrentFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    if (month >= 4) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};

export const generateFinancialYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 6; i++) {
        const start = currentYear - i;
        years.push(`${start}-${start + 1}`);
    }

    return years;
};

const Dashboard = () => {

    const navigate = useNavigate();
    const [financialYear, setFinancialYear] = useState(getCurrentFinancialYear());
    const [courseData, setCourseData] = useState([]);
    const [requisitionData, setRequisitionData] = useState([]);
    const [requisitionUserData, setRequisitionUserData] = useState([]);
    const [requisitionUser, setRequisitionUser] = useState([]);
    const [feedbackList, setFeedbackList] = useState([]);
    const roleName = localStorage.getItem("roleName");
    const employeeId = localStorage.getItem("empId");

    const financialYears = generateFinancialYears();

    const getFinancialYearDates = (financialYear) => {
        if (!financialYear) return {};

        const [start, end] = financialYear.split("-");

        return {
            startDate: `${start}-04-01`,
            endDate: `${end}-03-31`
        };
    };

    useEffect(() => {
        if (!financialYear) return;

        if (["ROLE_ADMIN", "ROLE_AD_HRT", "ROLE_SA_HRT", "ROLE_DH", "ROLE_DIRECTOR"].includes(roleName)) {
            fetchAdminDashboards();
        } else {
            fetchReqUserDashboard();
        }
    }, [financialYear, roleName]);

    const fetchAdminDashboards = async () => {
        const { startDate, endDate } = getFinancialYearDates(financialYear);
        try {
            const [courseRes, reqRes, feedRes] = await Promise.all([
                getCourseDashboardCount(startDate, endDate),
                getRequisitionDashboardCount(startDate, endDate),
                getFeedbackList(employeeId, roleName)
            ]);
            setCourseData(courseRes || []);
            setRequisitionData(reqRes || []);
            setFeedbackList(feedRes?.data || []);
        } catch (error) {
            console.error("Admin Dashboard Error:", error);
        }
    };

    const fetchReqUserDashboard = async () => {
        const { startDate, endDate } = getFinancialYearDates(financialYear);
        try {
            const [dashRes, reqRes, feedRes] = await Promise.all([
                getRequisitionUserDashboardCount(employeeId, startDate, endDate),
                getRequisitions(employeeId, roleName),
                getFeedbackList(employeeId, roleName)
            ]);
            setRequisitionUserData(dashRes || []);
            setRequisitionUser(reqRes?.data || []);
            setFeedbackList(feedRes?.data || []);
        } catch (error) {
            console.error("User Dashboard Error:", error);
        }
    };


    const getColClass = (count) => {
        if (count === 1) return "col-md-4 offset-md-4";
        if (count === 2) return "col-md-3 offset-md-2";
        if (count === 3) return "col-md-4";
        if (count === 4) return "col";
        if (count === 5) return "col";
        return "col-xl-2 col-lg-3 col-md-4 col-sm-6";
    };

    const handleCourseView = (organizerId) => {
        navigate("/course", { state: organizerId });
    };

    const { totalFeedbackCount, reqPendingCount } = useMemo(() => {
        const isAdminRole = ["ROLE_ADMIN", "ROLE_AD_HRT", "ROLE_SA_HRT", "ROLE_DH", "ROLE_DIRECTOR"].includes(roleName);

        // Create Set with String IDs to avoid type mismatch bugs
        const feedbackIdSet = new Set(feedbackList?.map(item => String(item.requisitionId)) || []);

        // Calculate Requisition Pending Count
        const dataSource = isAdminRole ? requisitionData : requisitionUserData;
        const pendingCount = dataSource?.reduce((sum, item) => sum + (Number(item.pending) || 0), 0) || 0;

        // Calculate Feedback Counts based on role
        let feedbackCount = 0;
        if (isAdminRole) {
            feedbackCount = feedbackList.filter(feed => feed.isAccepted === "N").length;
        } else {
            feedbackCount = requisitionUser.filter(req =>
                req.status === "AV" && !feedbackIdSet.has(String(req.requisitionId))
            ).length;
        }

        return {
            totalFeedbackCount: feedbackCount || 0,
            reqPendingCount: pendingCount
        };
    }, [feedbackList, requisitionData, requisitionUserData, requisitionUser, roleName]);

    return (
        <div>
            <Navbar />
            <div className="dashboard-container container mt-4">

                {/* HEADER */}
                <div className="dashboard-header d-flex justify-content-between align-items-center mb-4">

                    <h4 className="dashboard-title">
                        Training Dashboard
                    </h4>

                    <select
                        className="form-select dashboard-select"
                        value={financialYear}
                        onChange={(e) => setFinancialYear(e.target.value)}
                    >
                        {financialYears.map((fy) => (
                            <option key={fy} value={fy}>
                                FY {fy}
                            </option>
                        ))}
                    </select>

                </div>

                {["ROLE_ADMIN", "ROLE_AD_HRT", "ROLE_SA_HRT", "ROLE_DH", "ROLE_DIRECTOR"].includes(roleName) ? (
                    <>
                        {/* ================= COURSE DASHBOARD ================= */}

                        <div className="dashboard-section">

                            <h5 className="section-title">
                                <FaBookReader className="me-2" />
                                Organizer Wise Courses
                            </h5>

                            <div className="row g-4">

                                {courseData.length > 0 ? (

                                    courseData.map((item) => (

                                        <div className={getColClass(courseData.length)} key={item.organizerId}>

                                            <div className="dashboard-card course-card"
                                                onClick={() => handleCourseView(item.organizerId)}
                                            >
                                                <div className="card-body text-center">

                                                    <div className="dashboard-icon">
                                                        <BsFillBookmarkStarFill />
                                                    </div>

                                                    <h6 className="dashboard-label">
                                                        {item.organizerName}
                                                    </h6>

                                                    <h2 className="dashboard-count">
                                                        {item.courseCount}
                                                    </h2>

                                                    <p className="dashboard-subtext">
                                                        Total Courses
                                                    </p>

                                                </div>
                                            </div>

                                        </div>

                                    ))

                                ) : (

                                    <div className="no-data-container">
                                        <FaDatabase className="no-data-icon" />
                                        <p>No Courses Available</p>
                                    </div>

                                )}

                            </div>

                        </div>


                        {/* ================= REQUISITION DASHBOARD ================= */}

                        <div className="dashboard-section mt-5">

                            <h5 className="section-title">
                                <FaUniversity className="me-2" /> Organizer Wise Requisitions
                            </h5>

                            <div className="requisition-table-wrapper">

                                <table className="table requisition-table">

                                    <thead>

                                        <tr>

                                            <th>Organizer</th>

                                            <th>
                                                <FaList className="me-1" /> Total
                                            </th>

                                            <th>
                                                <FaClock className="me-1" /> In Progress
                                            </th>

                                            <th>
                                                <FaShare className="me-1" /> Forwarded
                                            </th>

                                            <th>
                                                <FaThumbsUp className="me-1" /> Recommended
                                            </th>

                                            <th>
                                                <FaCheckCircle className="me-1" /> Approved
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {requisitionData.length > 0 ? (

                                            requisitionData.map((item, index) => (

                                                <tr
                                                    key={item.organizerId}
                                                    style={{ animationDelay: `${index * 0.08}s` }}
                                                    className="table-row-animate"
                                                >

                                                    <td className="org-name text-center">
                                                        {item.organizerName}
                                                    </td>

                                                    <td className="text-center">
                                                        <span className="badge badge-total">{item.total}</span>
                                                    </td>

                                                    <td className="text-center">
                                                        <span className="badge badge-pending">{item.pending}</span>
                                                    </td>

                                                    <td className="text-center">
                                                        <span className="badge badge-forwarded">{item.forwarded}</span>
                                                    </td>

                                                    <td className="text-center">
                                                        <span className="badge badge-recommended">{item.recommended}</span>
                                                    </td>

                                                    <td className="text-center">
                                                        <span className="badge badge-approved">{item.approved}</span>
                                                    </td>

                                                </tr>

                                            ))

                                        ) : (

                                            <tr>
                                                <td colSpan="6">
                                                    <div className="no-data-container">
                                                        <FaDatabase className="no-data-icon" />
                                                        <p>No Requisition Data Available</p>
                                                    </div>
                                                </td>
                                            </tr>

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>
                    </>

                ) : (
                    <div className="dashboard-section mt-5">

                        <h5 className="section-title">
                            <FaUniversity className="me-2" /> Organizer Wise Requisitions
                        </h5>

                        <div className="requisition-table-wrapper">

                            <table className="table requisition-table">

                                <thead>

                                    <tr>

                                        <th>Organizer</th>

                                        <th>
                                            <FaList className="me-1" /> Total
                                        </th>

                                        <th>
                                            <FaClock className="me-1" /> In Progress
                                        </th>

                                        <th>
                                            <FaShare className="me-1" /> Forwarded
                                        </th>

                                        <th>
                                            <FaThumbsUp className="me-1" /> Recommended
                                        </th>

                                        <th>
                                            <FaCheckCircle className="me-1" /> Approved
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {requisitionUserData.length > 0 ? (

                                        requisitionUserData.map((item, index) => (

                                            <tr
                                                key={item.organizerId}
                                                style={{ animationDelay: `${index * 0.08}s` }}
                                                className="table-row-animate"
                                            >

                                                <td className="org-name text-center">
                                                    {item.organizerName}
                                                </td>

                                                <td className="text-center">
                                                    <span className="badge badge-total">{item.total}</span>
                                                </td>

                                                <td className="text-center">
                                                    <span className="badge badge-pending">{item.pending}</span>
                                                </td>

                                                <td className="text-center">
                                                    <span className="badge badge-forwarded">{item.forwarded}</span>
                                                </td>

                                                <td className="text-center">
                                                    <span className="badge badge-recommended">{item.recommended}</span>
                                                </td>

                                                <td className="text-center">
                                                    <span className="badge badge-approved">{item.approved}</span>
                                                </td>

                                            </tr>

                                        ))

                                    ) : (

                                        <tr>
                                            <td colSpan="6">
                                                <div className="no-data-container">
                                                    <FaDatabase className="no-data-icon" />
                                                    <p>No Requisition Data Available</p>
                                                </div>
                                            </td>
                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>
                )
                }
            </div>

            <DashboardReminderPopup
                requisitionCount={reqPendingCount}
                feedbackCount={totalFeedbackCount}
            />

        </div>
    )
}

export default Dashboard;