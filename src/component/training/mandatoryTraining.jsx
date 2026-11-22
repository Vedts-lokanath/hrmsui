import { useEffect, useState } from "react";
import { usePermission } from "../../common/usePermission";
import Datatable from "../../datatable/Datatable";
import { Tooltip } from "react-tooltip";
import { FaEdit } from "react-icons/fa";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { acceptMandatoryTraining, addReqAttendance, getFeedbackListByDateRange, getMandatoryTrainingList } from "../../service/training.service";
import { MdFeedback, MdLibraryAddCheck } from "react-icons/md";
import Swal from "sweetalert2";
import { getEmployees, handleApiError } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { FaUsersLine } from "react-icons/fa6";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { generateFinancialYears, getDefaultFinancialYear } from "../utils/financialYearUtils";
import Select from "react-select";



export const financialYearOptions = generateFinancialYears();

const MandatoryTraining = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Mandatory Training");

    const navigate = useNavigate();
    const [trainingList, setTrainingList] = useState([]);
    const [feedbackList, setFeedbackList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

    const [selectedYearOption, setSelectedYearOption] = useState(() => getDefaultFinancialYear(financialYearOptions));

    const empId = localStorage.getItem("empId");
    const roleName = localStorage.getItem("roleName");

    const [showAttendModal, setShowAttendModal] = useState(false);
    const [reqData, setShowReqData] = useState(null);

    useEffect(() => {
        if (selectedEmployeeId !== null && selectedEmployeeId !== undefined && selectedYearOption) {
            fetchMandatoryTrainings(selectedEmployeeId, selectedYearOption);
            fetchFeedbacks(selectedYearOption);
        }
    }, [selectedEmployeeId, selectedYearOption]);


    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchMandatoryTrainings = async (selectedEmpId, selectedYear) => {
        try {

            const fromDate = format(new Date(selectedYear.startYear, 3, 1), 'yyyy-MM-dd');
            const toDate = format(new Date(selectedYear.endYear, 2, 31), 'yyyy-MM-dd');

            const response = await getMandatoryTrainingList(empId, roleName, fromDate, toDate, selectedEmpId);
            setTrainingList(response?.data || []);
        } catch (error) {
            console.error("Error fetching mandatory trainings:", error);
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

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Requisition No", selector: (row) => row.requisitionNumber, sortable: true, align: 'text-left' },
        { name: "Participant", selector: (row) => row.participantName, sortable: true, align: 'text-start' },
        { name: "Designation", selector: (row) => row.empDesigName, sortable: true, align: 'text-center' },
        { name: "Course Name", selector: (row) => row.courseName, sortable: true, align: 'text-start' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-center' },
        { name: "Duration", selector: (row) => row.duration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Venue", selector: (row) => row.venue, sortable: true, align: 'text-start' },
        { name: "Registration Fee (₹)", selector: (row) => row.registrationFee, sortable: true, align: 'text-end' },
        ...(canEdit ? [{ name: "Action", selector: (row) => row.action, sortable: false, align: "text-center", }] : [])
    ];

    const mappedData = () => {
        return trainingList.map((item, index) => {

            const feedbackExists = feedbackList?.some(
                feedback => Number(feedback?.requisitionId) === Number(item?.requisitionId)
            );

            return {
                sn: index + 1,
                requisitionNumber: item.requisitionNumber || "-",
                participantName: item.initiatingOfficerName || "-",
                empDesigName: item.empDesigName || "-",
                courseName: item.courseName || "-",
                organizer: item.organizer || "-",
                duration: item.duration || "-",
                fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
                toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
                venue: item.venue || "-",
                registrationFee: item.registrationFee || "-",
                action: (
                    <>
                        <Tooltip id="Tooltip" className='text-white' />
                        {item.status === "AP" ? (
                            <>
                                <button
                                    className="btn btn-sm btn-warning me-2"
                                    data-tooltip-id="Tooltip"
                                    data-tooltip-content="Edit"
                                    data-tooltip-place="top"
                                    onClick={() => handleEdit(item)}
                                >
                                    <FaEdit className="fs-6" />
                                </button>
                                {["ROLE_ADMIN", "ROLE_SA_HRT", "ROLE_AD_HRT"].includes(roleName) &&
                                    <button
                                        className="btn btn-sm btn-success me-2"
                                        onClick={() => handleAccept(item)}
                                        data-tooltip-id="Tooltip"
                                        data-tooltip-content="Accept"
                                        data-tooltip-place="top"
                                    >
                                        <MdLibraryAddCheck className="fs-6" />
                                    </button>
                                }
                            </>
                        ) : (
                            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 fw-semibold me-2">
                                Approved
                            </span>
                        )}
                        {(item.isAttend === "N" || item.isAttend === null) &&
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

                        {(Number(item.initiatingOfficer) === Number(empId) ||
                            ["ROLE_SA_HRT", "ROLE_ADMIN"].includes(roleName)) &&
                            !feedbackExists && (item.isAttend === "Y" && item.status === "PA") && (
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
                    </>
                )
            }
        });
    };

    const handleFeedbackClick = (item) => {
        navigate("/feedback-add", { state: item });
    }

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
                fetchMandatoryTrainings(selectedEmployeeId, selectedYearOption);
            } else {
                Swal.fire("Warning", response.message, "warning");
                setSubmitting(false);
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
            setSubmitting(false);
        }
    }

    const handleAccept = async (item) => {
        try {
            const dto = {
                requisitionId: item.requisitionId,
                actionBy: empId
            }

            const confirm = await AlertConfirmation({ title: "Are you sure to submit!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await acceptMandatoryTraining(dto);
            if (response && response.success) {
                Swal.fire({
                    title: "Success",
                    text: response.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                });
                fetchMandatoryTrainings(selectedEmployeeId, selectedYearOption);
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };


    const handleAdd = () => {
        navigate("/mandatory-training-add");
    };

    const handleEdit = async (item) => {
        navigate("/mandatory-training-add", { state: { requisitionId: item.requisitionId } });
    };

    const handleChangeYear = (selectedOption) => {
        setSelectedYearOption(selectedOption);
    };


    return (
        <div>

            <h3 className="fancy-heading mt-3">
                Mandatory Training List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="d-flex flex-wrap align-items-end justify-content-end gap-3 me-3 mt-2">

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

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>


            {canAdd &&
                <div>
                    <button
                        className="add"
                        onClick={handleAdd}
                    >
                        ADD NEW
                    </button>
                </div>
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

        </div>
    )
};

export default MandatoryTraining;