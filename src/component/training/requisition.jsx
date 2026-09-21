import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import { useLocation, useNavigate } from "react-router-dom";
import { addReqAttendance, addReqConfirmation, forwardRequisition, getFeedbackList, getFeedbackListByDateRange, getLabMasterData, getRequisitionPrint, getRequisitions, revokeRequisition } from "../../service/training.service";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";
import { MdFeedback } from "react-icons/md";
import { FaEdit, FaUserCheck } from "react-icons/fa";
import RequisitionPrint from "../print/requisition";
import { FaArrowLeft, FaEye, FaForward, FaUsersLine } from "react-icons/fa6";
import { getEmployees, handleApiError } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { usePermission } from "../../common/usePermission";
import RequisitionPreview from "./requisitionPreview";
import Select from "react-select";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { generateFinancialYears, getDefaultFinancialYear } from "../utils/financialYearUtils";


export const financialYearOptions = generateFinancialYears();

const Requisition = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Requisition");

    const location = useLocation();
    const [requisitionList, setRequisitionList] = useState([]);
    const [feedbackList, setFeedbackList] = useState([]);

    const navigate = useNavigate();
    const empId = localStorage.getItem("empId");
    const roleName = localStorage.getItem("roleName");

    const [showModal, setShowModal] = useState(false);
    const [reqData, setShowReqData] = useState(null);
    const [selectedTab, setSelectedTab] = useState(location.state?.selectedTab || "free");
    const [employeeList, setEmployeeList] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAttendModal, setShowAttendModal] = useState(false);

    const [selectedYearOption, setSelectedYearOption] = useState(() => getDefaultFinancialYear(financialYearOptions));


    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployeeId !== null && selectedEmployeeId !== undefined && selectedYearOption) {
            fetchRequisitions(selectedEmployeeId, selectedYearOption);
            fetchFeedbacks(selectedYearOption);
        }
    }, [selectedYearOption, selectedEmployeeId]);

    const fetchRequisitions = async (selectedEmpId, selectedYear) => {
        try {
            const fromDate = format(new Date(selectedYear.startYear, 3, 1), 'yyyy-MM-dd');
            const toDate = format(new Date(selectedYear.endYear, 2, 31), 'yyyy-MM-dd');

            const response = await getRequisitions(empId, roleName, fromDate, toDate, selectedEmpId);
            setRequisitionList(response?.data || []);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
            Swal.fire("Error", "Failed to fetch requisition data. Please try again later.", "error");
        }
    };

    const fetchFeedbacks = async (selectedYear) => {
        let apiEmpId = 0;
        let apiRole = roleName;

        if (roleName !== "ROLE_USER") {
            apiRole = "ROLE_ADMIN";
        }

        if (roleName === "ROLE_USER") {
            apiEmpId = empId;
            apiRole = roleName;
        }

        try {
            const fromDate = format(new Date(selectedYear.startYear, 3, 1), 'yyyy-MM-dd');
            const toDate = format(new Date(selectedYear.endYear, 2, 31), 'yyyy-MM-dd');

            const response = await getFeedbackListByDateRange(apiEmpId, apiRole, fromDate, toDate);
            setFeedbackList(response?.data || []);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const roleToPass = ["ROLE_ADMIN", "ROLE_DH", "ROLE_GH"].includes(roleName) ? roleName : "ROLE_ADMIN";
            const response = await getEmployees(empId, roleToPass);
            const res = response?.data || [];

            const employeeOptions = res.map((e) => ({
                value: e.empId,
                label: `${e.empName}, ${e.empDesigName}`,
                divisionId: e.divisionId,
            }));


            setEmployeeList(employeeOptions);

            if (!["ROLE_USER"].includes(roleName)) {
                setEmployeeList([
                    {
                        value: 0,
                        label: "ALL",
                        divisionId: null,
                    },
                    ...employeeOptions,
                ]);
                setSelectedEmployeeId(0);

            } else if (roleName === "ROLE_DH") {
                setEmployeeList(employeeOptions);

                const exists = employeeOptions.some(
                    (e) => Number(e.value) === Number(empId)
                );
                setSelectedEmployeeId(
                    exists ? Number(empId) : null
                );

            } else {
                const filteredEmployees = employeeOptions.filter(
                    (e) => Number(e.value) === Number(empId)
                );

                setEmployeeList(filteredEmployees);

                setSelectedEmployeeId(
                    filteredEmployees.length > 0
                        ? Number(empId)
                        : null
                );
            }

        } catch (error) {
            console.error("Error fetching employees:", error);
            Swal.fire(
                "Error",
                "Failed to fetch employee data. Please try again later.",
                "error"
            );
        }
    };

    const getTextColor = (bg) => {
        if (!bg) return "#000";
        const color = bg.substring(1);
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? "#000" : "#fff";
    };

    const handleChangeYear = (selectedOption) => {
        setSelectedYearOption(selectedOption);
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Requisition No", selector: (row) => row.requisitionNumber, sortable: true, align: 'text-left' },
        { name: "Participant", selector: (row) => row.initiatingOfficer, sortable: true, align: 'text-left' },
        { name: "Designation", selector: (row) => row.designation, sortable: true, align: 'text-center' },
        { name: "Course", selector: (row) => row.courseName, sortable: true, align: 'text-left' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-left' },
        { name: "Duration (Day)", selector: (row) => row.duration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Status", selector: (row) => row.status, sortable: true, align: 'text-left' },
        { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center' },
    ];

    const freeList = requisitionList.filter(item => item.registrationFee === 0);
    const paidList = requisitionList.filter(item => item.registrationFee > 0);
    const filteredList = selectedTab === "free" ? freeList : paidList;


    const mappedData = () => {
        return filteredList.map((item, index) => {
            const feedbackExists = feedbackList?.some(
                feedback => Number(feedback?.requisitionId) === Number(item?.requisitionId)
            );

            return {
                sn: index + 1,
                requisitionNumber: (
                    <button
                        className="btn btn-sm btn-outline-primary fw-semibold"
                        onClick={() => handlePreview(item)}
                    >
                        {item.requisitionNumber}
                    </button>
                ),
                courseName: item.courseName || "-",
                organizer: item.organizer || "-",
                duration: item.duration || "-",
                fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
                toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
                initiatingOfficer: item.initiatingOfficerName || "-",
                designation: item.empDesigName || "-",
                status:
                    <span
                        className="status-badge-modern"
                        onClick={() => handleView(item)}
                        style={{
                            backgroundColor: item.statusColor || "#cceaff",
                            color: getTextColor(item.statusColor),
                            borderColor: item.statusColor || "#dee2e6"
                        }}
                    >
                        {item.statusName || "Unknown"}
                    </span>,
                action: (
                    <>
                        <Tooltip id="Tooltip" className='text-white' />

                        {canEdit &&
                            <>
                                {["AA", "REV", "RS", "RR", "RV", "CR"].includes(item.status) && (
                                    <>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => handleEdit(item)}
                                            data-tooltip-id="Tooltip"
                                            data-tooltip-content="Edit"
                                            data-tooltip-place="top"
                                        >
                                            <FaEdit className="fs-6" />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-primary me-2"
                                            onClick={() => handleForward(item)}
                                            data-tooltip-id="Tooltip"
                                            data-tooltip-content="Forward"
                                            data-tooltip-place="top"
                                        >
                                            <FaForward className="fs-6" />
                                        </button>
                                    </>
                                )}

                                {Number(item.initiatingOfficer) === Number(empId) && item.status === 'AF' && (
                                    <button
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => handleRevoke(item)}
                                        data-tooltip-id="Tooltip"
                                        data-tooltip-content="Revoke"
                                        data-tooltip-place="top"
                                    >
                                        <FaArrowLeft className="fs-6" />
                                    </button>
                                )}

                                {Number(item.initiatingOfficer) === Number(empId) &&
                                    !feedbackExists && (item.status === "CO" || item.status === "FA") && (
                                        <button
                                            className="btn btn-sm btn-secondary me-2"
                                            onClick={() => handleFeedbackClick(item)}
                                            data-tooltip-id="Tooltip"
                                            data-tooltip-content="Feedback"
                                            data-tooltip-place="top"
                                        >
                                            <MdFeedback className="fs-6" />
                                        </button>
                                    )}
                                {["CO", "FA"].includes(item.status) &&
                                    (item.isConfirmed === "N" || item.isConfirmed === null) &&
                                    ["ROLE_SA_HRT", "ROLE_ADMIN"].includes(roleName) &&
                                    (
                                        <button
                                            className="btn btn-sm btn-success me-2"
                                            onClick={() => handleConfirm(item)}
                                            data-tooltip-id="Tooltip"
                                            data-tooltip-content="Confirmation"
                                            data-tooltip-place="top"
                                        >
                                            <FaUserCheck className="fs-6" />
                                        </button>
                                    )}
                                {["CO", "FA"].includes(item.status) &&
                                    (item.isConfirmed === "Y") &&
                                    (item.isAttend === "N" || item.isAttend === null) &&
                                    ["ROLE_SA_HRT", "ROLE_ADMIN"].includes(roleName) &&
                                    (item.fromDate && new Date(item.fromDate) <= new Date())
                                    &&
                                    (
                                        <button
                                            className="btn btn-sm btn-primary me-2"
                                            onClick={() => handleAttend(item)}
                                            data-tooltip-id="Tooltip"
                                            data-tooltip-content="Attendance"
                                            data-tooltip-place="top"
                                        >
                                            <FaUsersLine className="fs-6" />
                                        </button>
                                    )}
                            </>
                        }

                        {canView && <button
                            className="print"
                            onClick={() => handlePrint(item)}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Print"
                            data-tooltip-place="top"
                        >
                            <FaEye className="fs-6" />
                        </button>
                        }
                    </>
                )
            };
        });
    };

    const handleConfirm = (item) => {
        setShowConfirmModal(true);
        setShowReqData(item);
    };

    const handleConfirmClose = () => {
        setShowConfirmModal(false);
        setShowReqData(null);
    };

    const initialValues = {
        confirmation: "",
        remarks: "",
        file: null,
    };

    const validationSchema = Yup.object({
        confirmation: Yup.string().required("Please select confirmation status"),

        remarks: Yup.string().when("confirmation", {
            is: (confirmation) =>
                confirmation === "Not Confirmed",
            then: (schema) =>
                schema.required("Remarks are required"),
            otherwise: (schema) => schema.notRequired(),
        }),

        file: Yup.mixed().nullable(),
    });

    const handleAttend = (item) => {
        setShowAttendModal(true);
        setShowReqData(item);
    };

    const handleAttendClose = () => {
        setShowAttendModal(false);
        setShowReqData(null);
    }

    const attendSchema = Yup.object({
        attendance: Yup.string().required("Please select attendance status"),
        remarks: Yup.string().when("attendance", {
            is: (attendance) => attendance === "Not Attended",
            then: (schema) => schema.required("Remarks are required"),
            otherwise: (schema) => schema.notRequired(),
        }),
    });

    const handlePreview = (item) => {
        setShowModal(true);
        setShowReqData(item);
    };

    const handleView = (item) => {
        const dto = {
            requisitionId: item.requisitionId,
            requisitionNumber: item.requisitionNumber,
            programName: item.programName,
            fromDate: item.fromDate,
            toDate: item.toDate,
            registrationFee: item.registrationFee,
            isGroup: item.isGroup || "N",
        }
        localStorage.setItem('transactionData', JSON.stringify(dto));
        window.open('/transaction', '_blank');
    }

    const handleAdd = () => {
        const feedbackMissing = [];

        requisitionList
            .filter(item => ["CO", "FA"].includes(item.status))
            .forEach(item => {
                if (Number(item.initiatingOfficer) !== Number(empId)) return;

                const feedbackExists = feedbackList?.some(
                    feedback =>
                        Number(feedback?.requisitionId) ===
                        Number(item?.requisitionId)
                );

                if (!feedbackExists) {
                    feedbackMissing.push(item.courseName);
                }
            });

        if (feedbackMissing.length > 0) {
            Swal.fire({
                title: "Feedback Submission Required",
                icon: "info",
                html: `
                <div style="text-align: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
                    
                    <p style="color: #555; margin-bottom: 12px;">
                        You cannot proceed with a new requisition until feedback is submitted for all previously approved courses.
                    </p>

                    <div style="margin-top: 15px; border-left: 4px solid #3498db; padding-left: 12px;">
                        <strong style="color: #2980b9; font-size: 15px;">
                            Pending Feedback Courses
                        </strong>

                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${feedbackMissing
                        .map(
                            req => `
                                    <span 
                                        style="
                                            background: #ebf5fb;
                                            border: 1px solid #3498db;
                                            color: #21618c;
                                            padding: 4px 10px;
                                            border-radius: 4px;
                                            font-size: 12px;
                                        "
                                    >
                                        ${req}
                                    </span>
                                `
                        )
                        .join("")}
                        </div>
                    </div>
                </div>
            `,
                showCloseButton: true,
                confirmButtonText: "OK",
                confirmButtonColor: "#3085d6",
                customClass: {
                    container: "my-swal-container",
                },
            });

            return;
        }

        navigate("/req-add-edit");
    };

    const handleEdit = async (item) => {
        navigate("/req-add-edit", { state: { requisitionId: item.requisitionId } });
    };

    const handleFeedbackClick = (item) => {
        navigate("/feedback-add", { state: item });
    }

    const handlePrint = async (item) => {
        try {
            if (!item?.requisitionId) {
                Swal.fire("Warning", "Invalid requisition selected.", "warning");
                return;
            }

            const response = await getRequisitionPrint(item.requisitionId);

            if (!response?.data) {
                Swal.fire("Warning", "Requisition data not found.", "warning");
                return;
            }

            const labResponse = await getLabMasterData();

            if (!labResponse?.data) {
                Swal.fire("Warning", "Lab details not found.", "warning");
                return;
            }

            await RequisitionPrint(response.data, labResponse.data);
        } catch (error) {
            console.error("Print Error:", error);

            Swal.fire(
                "Warning",
                error?.response?.data?.message || "Something went wrong while generating the print.",
                "warning"
            );
        }
    };

    const handleForward = async (item) => {
        try {
            const dto = {
                ...item,
                actionBy: empId
            }

            const confirm = await AlertConfirmation({ title: "Are you sure to forward!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await forwardRequisition(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchRequisitions(selectedEmployeeId, selectedYearOption);
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };


    const handleRevoke = async (item) => {
        try {
            const dto = {
                ...item,
                actionBy: empId
            }

            const confirm = await AlertConfirmation({ title: "Are you sure to revoke!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await revokeRequisition(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchRequisitions(selectedEmployeeId, selectedYearOption);
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };

    const handleChangeTab = (tab) => {
        setSelectedTab(tab);
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        const dto = {
            confirmRemarks: values.remarks,
            requisitionId: reqData?.requisitionId,
            isConfirmed: values.confirmation === "Confirmed" ? "Y" : "N",
            multipartFileBrochure: values.file || null,
        };
        const confirm = await AlertConfirmation({ title: "Are you sure to submit!", message: '' });
        if (!confirm) {
            return;
        }
        try {
            const response = await addReqConfirmation(dto);
            if (response && response.success) {
                Swal.fire({
                    title: "Success",
                    text: response.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                });
                handleConfirmClose();
                fetchRequisitions(selectedEmployeeId, selectedYearOption);
            } else {
                Swal.fire("Warning", response.message, "warning");
                setSubmitting(false);
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
            setSubmitting(false);
        }
    }

    const handleAttendSubmit = async (values, { setSubmitting }) => {
        const dto = {
            attendRemarks: values.remarks,
            requisitionId: reqData?.requisitionId,
            isAttend: values.attendance === "Attended" ? "Y" : "N",
        };
        const confirm = await AlertConfirmation({ title: "Are you sure to submit!", message: '' });
        if (!confirm) {
            return;
        }
        try {
            const response = await addReqAttendance(dto);
            if (response && response.success) {
                Swal.fire({
                    title: "Success",
                    text: response.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                });
                handleAttendClose();
                fetchRequisitions(selectedEmployeeId, selectedYearOption);
            } else {
                Swal.fire("Warning", response.message, "warning");
                setSubmitting(false);
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
            setSubmitting(false);
        }
    }


    return (
        <div>
            <h3 className="fancy-heading mt-3">
                Requisition List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="mt-5 mx-3">

                {/* Top Row: Tabs + Filters */}
                <div className="d-flex flex-wrap align-items-center gap-3">

                    {/* Tabs — left side */}
                    <div className="p-2 bg-light rounded-pill border d-inline-flex gap-2 shadow-sm flex-shrink-0">

                        {/* Free Requisition */}
                        <button
                            type="button"
                            onClick={() => handleChangeTab("free")}
                            className={`btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 transition-all ${selectedTab === "free"
                                ? "btn-warning border-0 shadow"
                                : "btn-light border-0 text-secondary"
                                }`}
                        >
                            <span className="fw-bold">Requisition : Free Courses</span>
                            <span className={`badge rounded-pill ${selectedTab === "free" ? "bg-dark" : "bg-secondary text-white"}`}>
                                {freeList.length}
                            </span>
                        </button>

                        {/* Paid Requisition */}
                        <button
                            type="button"
                            onClick={() => handleChangeTab("paid")}
                            className={`btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 transition-all ${selectedTab === "paid"
                                ? "btn-success border-0 shadow text-white"
                                : "btn-light border-0 text-secondary"
                                }`}
                        >
                            <span className="fw-bold">Requisition : Paid Courses</span>
                            <span className={`badge rounded-pill ${selectedTab === "paid" ? "bg-white text-success" : "bg-secondary text-white"}`}>
                                {paidList.length}
                            </span>
                        </button>

                    </div>

                    {/* Filters — right side, wraps below on small screens */}
                    <div className="d-flex flex-wrap align-items-center gap-3 ms-auto">

                        {/* Employee */}
                        <div className="d-flex align-items-center gap-2">
                            <label className="fw-bold mb-0 text-nowrap">Employee :</label>
                            <Select
                                options={employeeList}
                                value={employeeList?.find((e) => e.value === selectedEmployeeId) || null}
                                onChange={(opt) => setSelectedEmployeeId(opt?.value ?? "")}
                                isSearchable
                                styles={{
                                    container: (provided) => ({
                                        ...provided,
                                        minWidth: "180px",
                                        width: "100%",
                                    }),
                                    singleValue: (provided) => ({
                                        ...provided,
                                        textAlign: "left",
                                    }),
                                }}
                                menuPortalTarget={document.body}
                            />
                        </div>

                        {/* Year Dropdown */}
                        <div className="d-flex align-items-center gap-2">
                            <label className="fw-bold mb-0 text-nowrap">Year :</label>
                            <div style={{ width: '180px' }} className="text-start">
                                <Select
                                    options={financialYearOptions}
                                    value={selectedYearOption}
                                    onChange={handleChangeYear}
                                    placeholder="Select Year"
                                    isSearchable={false}
                                />
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

            <div>
                {canAdd && <button
                    className="add"
                    onClick={handleAdd}>
                    ADD NEW
                </button>
                }
            </div>

            {showModal &&
                <RequisitionPreview
                    reqData={reqData}
                    setShowModal={setShowModal}
                />
            }

            {showConfirmModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={handleConfirmClose}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">

                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">Confirmation for Req no : {reqData?.requisitionNumber}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleConfirmClose}
                                    ></button>
                                </div>

                                <div className="modal-body p-4">
                                    {/* Context Header Card */}
                                    <div className="card border-0 bg-light-subtle rounded-3 p-3 mb-2 shadow-sm border-start border-4 border-info">
                                        <div className="d-flex align-items-start gap-2">
                                            <div className="w-100">
                                                <div className="row g-2 mb-4 text-start">
                                                    <div className="col-12 col-md-7">
                                                        <span className="text-muted d-block small text-uppercase fw-semibold mb-1">Course</span>
                                                        <span className="text-dark fw-semibold fs-6 d-block text-break">{reqData?.courseName || 'N/A'}</span>
                                                    </div>
                                                    <div className="col-12 col-md-5">
                                                        <span className="text-muted d-block small text-uppercase fw-semibold mb-1">Participant</span>
                                                        <span className="text-dark fw-semibold d-block">{reqData?.initiatingOfficerName}, <span className="text-muted small">{reqData?.empDesigName}</span></span>
                                                    </div>
                                                </div>
                                                <hr className="my-3 opacity-25" />

                                                <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                                                    <span className="badge bg-info-subtle text-info-emphasis rounded-pill">Action Required</span>
                                                    Please update the confirmation status below.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Segment */}
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                    >
                                        {({ setFieldValue, values }) => (
                                            <Form autoComplete="off" className="d-flex flex-column gap-4">

                                                {/* Section: Decision */}
                                                <div className="card border shadow-sm rounded-3">
                                                    <div className="card-body p-3">
                                                        <label className="form-label fw-bold text-dark-emphasis mb-3">
                                                            Confirmation Status <span className="text-danger">*</span>
                                                        </label>

                                                        {/* Modern Button-Card Grid Selection */}
                                                        <div className="row g-2">
                                                            <div className="col-6">
                                                                <label className={`w-100 p-2 rounded-3 border d-flex align-items-center gap-2 cursor-pointer transition-all ${values.confirmation === 'Confirmed' ? 'border-success bg-success-subtle text-success-emphasis fw-semibold shadow-sm' : 'bg-body'}`}>
                                                                    <Field
                                                                        type="radio"
                                                                        name="confirmation"
                                                                        value="Confirmed"
                                                                        className="form-check-input mt-0 accent-success"
                                                                    />
                                                                    <div>
                                                                        <div className="fs-6">Confirm</div>
                                                                        <small className={values.confirmation === 'Confirmed' ? 'text-success-emphasis' : 'text-muted'}>Approve participation</small>
                                                                    </div>
                                                                </label>
                                                            </div>

                                                            <div className="col-6">
                                                                <label className={`w-100 p-2 rounded-3 border d-flex align-items-center gap-2 cursor-pointer transition-all ${values.confirmation === 'Not Confirmed' ? 'border-danger bg-danger-subtle text-danger-emphasis fw-semibold shadow-sm' : 'bg-body'}`}>
                                                                    <Field
                                                                        type="radio"
                                                                        name="confirmation"
                                                                        value="Not Confirmed"
                                                                        className="form-check-input mt-0 accent-danger"
                                                                    />
                                                                    <div>
                                                                        <div className="fs-6">Not Confirm</div>
                                                                        <small className={values.confirmation === 'Not Confirmed' ? 'text-danger-emphasis' : 'text-muted'}>Decline/Postpone</small>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <ErrorMessage
                                                            name="confirmation"
                                                            component="div"
                                                            className="text-danger small mt-2 fw-medium"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Conditional Section: Remarks */}
                                                {values.confirmation === "Not Confirmed" && (
                                                    <div className="card border shadow-sm rounded-3 border-start border-danger border-2 animation-fade-in">
                                                        <div className="card-body p-2">
                                                            <label className="form-label fw-bold text-dark-emphasis mb-2">
                                                                Remarks <span className="text-danger">*</span>
                                                            </label>
                                                            <Field
                                                                as="textarea"
                                                                rows="3"
                                                                name="remarks"
                                                                className="form-control focus-ring"
                                                                placeholder="Please provide specific details or justifications for declining..."
                                                            />
                                                            <ErrorMessage
                                                                name="remarks"
                                                                component="div"
                                                                className="text-danger small mt-2 fw-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Section: Supporting Document */}
                                                <div className="card border shadow-sm rounded-3">
                                                    <div className="card-body p-2">
                                                        <label className="form-label fw-bold text-dark-emphasis mb-1">
                                                            Attachment <span className="text-muted fw-normal small ms-1">(Optional)</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            onChange={(event) =>
                                                                setFieldValue("file", event.currentTarget.files[0])
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                {/* Form Control Buttons */}
                                                <div className="d-flex align-items-center justify-content-center mt-2 pt-3 border-top">
                                                    <button
                                                        type="submit"
                                                        className="submit"
                                                    >
                                                        Submit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="back"
                                                        onClick={handleConfirmClose}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>

                                            </Form>
                                        )}
                                    </Formik>
                                </div>

                            </div>
                        </div>
                    </div>
                </>
            )
            }

            {showAttendModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={handleAttendClose}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">

                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">Attendance for Req no : {reqData?.requisitionNumber}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleAttendClose}
                                    ></button>
                                </div>

                                <div className="modal-body p-4">
                                    {/* Context Header Card */}
                                    <div className="card border-0 bg-light-subtle rounded-3 p-3 mb-2 shadow-sm border-start border-4 border-success">
                                        <div className="d-flex align-items-start gap-2">
                                            <div className="w-100">
                                                <div className="row g-2 mb-4 text-start">
                                                    <div className="col-12 col-md-7">
                                                        <span className="text-muted d-block small text-uppercase fw-semibold mb-1">Course</span>
                                                        <span className="text-dark fw-semibold fs-6 d-block text-break">{reqData?.courseName || 'N/A'}</span>
                                                    </div>
                                                    <div className="col-12 col-md-5">
                                                        <span className="text-muted d-block small text-uppercase fw-semibold mb-1">Participant</span>
                                                        <span className="text-dark fw-semibold d-block">{reqData?.initiatingOfficerName}, <span className="text-muted small">{reqData?.empDesigName}</span></span>
                                                    </div>
                                                </div>
                                                <hr className="my-3 opacity-25" />

                                                <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                                                    <span className="badge bg-success-subtle text-success-emphasis rounded-pill">Action Required</span>
                                                    Please update the attendance status below.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Segment */}
                                    <Formik
                                        initialValues={
                                            {
                                                attendance: "",
                                                remarks: "",
                                            }
                                        }
                                        validationSchema={attendSchema}
                                        onSubmit={handleAttendSubmit}
                                    >
                                        {({ setFieldValue, values }) => (
                                            <Form autoComplete="off" className="d-flex flex-column gap-4">

                                                {/* Section: Decision */}
                                                <div className="card border shadow-sm rounded-3">
                                                    <div className="card-body p-3">
                                                        <label className="form-label fw-bold text-dark-emphasis mb-3">
                                                            Attendance Status <span className="text-danger">*</span>
                                                        </label>

                                                        {/* Modern Button-Card Grid Selection */}
                                                        <div className="row g-2">
                                                            <div className="col-6">
                                                                <label className={`w-100 p-2 rounded-3 border d-flex align-items-center gap-2 cursor-pointer transition-all ${values.attendance === 'Attended' ? 'border-success bg-success-subtle text-success-emphasis fw-semibold shadow-sm' : 'bg-body'}`}>
                                                                    <Field
                                                                        type="radio"
                                                                        name="attendance"
                                                                        value="Attended"
                                                                        className="form-check-input mt-0 accent-success"
                                                                    />
                                                                    <div>
                                                                        <div className="fs-6">Attended</div>
                                                                        <small className={values.attendance === 'Attended' ? 'text-success-emphasis' : 'text-muted'}>Approve attendance</small>
                                                                    </div>
                                                                </label>
                                                            </div>

                                                            <div className="col-6">
                                                                <label className={`w-100 p-2 rounded-3 border d-flex align-items-center gap-2 cursor-pointer transition-all ${values.attendance === 'Not Attended' ? 'border-danger bg-danger-subtle text-danger-emphasis fw-semibold shadow-sm' : 'bg-body'}`}>
                                                                    <Field
                                                                        type="radio"
                                                                        name="attendance"
                                                                        value="Not Attended"
                                                                        className="form-check-input mt-0 accent-danger"
                                                                    />
                                                                    <div>
                                                                        <div className="fs-6">Not Attended</div>
                                                                        <small className={values.attendance === 'Not Attended' ? 'text-danger-emphasis' : 'text-muted'}>Decline/Postpone</small>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <ErrorMessage
                                                            name="attendance"
                                                            component="div"
                                                            className="text-danger small mt-2 fw-medium"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Conditional Section: Remarks */}
                                                {values.attendance === "Not Attended" && (
                                                    <div className="card border shadow-sm rounded-3 border-start border-danger border-2 animation-fade-in">
                                                        <div className="card-body p-2">
                                                            <label className="form-label fw-bold text-dark-emphasis mb-2">
                                                                Remarks <span className="text-danger">*</span>
                                                            </label>
                                                            <Field
                                                                as="textarea"
                                                                rows="3"
                                                                name="remarks"
                                                                className="form-control focus-ring"
                                                                placeholder="Please provide specific details or justifications for declining..."
                                                            />
                                                            <ErrorMessage
                                                                name="remarks"
                                                                component="div"
                                                                className="text-danger small mt-2 fw-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                )}


                                                {/* Form Control Buttons */}
                                                <div className="d-flex align-items-center justify-content-center mt-2 pt-3 border-top">
                                                    <button
                                                        type="submit"
                                                        className="submit"
                                                    >
                                                        Submit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="back"
                                                        onClick={handleAttendClose}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>

                                            </Form>
                                        )}
                                    </Formik>
                                </div>

                            </div>
                        </div>
                    </div>
                </>
            )
            }

        </div >
    )
}

export default Requisition;