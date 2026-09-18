import { ErrorMessage, Field, Form, Formik } from "formik";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { useEffect, useRef, useState } from "react";
import { addRequisitionData, getAgencies, getCourseList, getJournalList, getRequisitionById, reqFileDownload, updateRequisitionData } from "../../service/training.service";
import Swal from "sweetalert2";
import { handleApiError } from "../../service/master.service";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { format } from "date-fns";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { FaCheckCircle } from "react-icons/fa";
import { BsFileEarmark } from "react-icons/bs";
import CourseModal from "../master/courseModal";


const AddEditRequisition = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const requisitionId = location.state?.requisitionId;

    const [courseList, setCourseList] = useState([]);
    const [organizerList, setOrganizerList] = useState([]);

    const formikRef = useRef(null);

    const empId = localStorage.getItem("empId");
    const title = localStorage.getItem("title");
    const salutation = localStorage.getItem("salutation");
    const empName = localStorage.getItem("empName");
    const designationCode = localStorage.getItem("designationCode");

    const [existingFiles, setExistingFiles] = useState({});
    const [feeOptions, setFeeOptions] = useState([]);
    const [reqNo, setReqNo] = useState(null);
    const [journalList, setJournalList] = useState([]);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [courseData, setCourseData] = useState(null);

    const [initialValues, setInitialValues] = useState({
        courseId: "",
        fromDate: null,
        toDate: null,
        duration: "",
        reference: "",
        organizedBy: "",
        courseType: "",
        modeOfPayment: "ECS",
        initiatingOfficer: Number(empId) || "",
        isSubmitted: "N",
        isPaperPresent: "N",
        necessity: "",
        venue: "",
        offlineRegistrationFee: "",
        reason: "",
        journalId: 0,
        isMandatory: "N",
        multipartFileEcs: null,
        multipartFileCheque: null,
        multipartFilePan: null,
        multipartFileBrochure: null,
        multipartCommitteeApproval: null,
        multipartAcceptanceLetter: null,
        multipartPaper: null,
    });

    useEffect(() => {
        fetchPrograms();
        fetchJournals();
        fetchAgencies();
    }, []);


    const fetchAgencies = async () => {
        try {
            const response = await getAgencies();
            setOrganizerList(response?.data || []);
        } catch (error) {
            console.error("Error fetching agencies:", error);
            Swal.fire("Error", "Failed to fetch organizer data. Please try again later.", "error");
        }
    };

    const fetchPrograms = async () => {
        try {
            const response = await getCourseList(0);
            const filteredCourses = response?.data?.filter(course => course.courseType !== "Mandatory Training") || [];
            setCourseList(filteredCourses || []);
        } catch (error) {
            console.error("Error fetching programs:", error);
            Swal.fire("Error", "Failed to fetch program data. Please try again later.", "error");
        }
    };


    const fetchJournals = async () => {
        try {
            const response = await getJournalList(empId, "ROLE_USER");
            setJournalList(response?.data || []);
        } catch (error) {
            console.error("Error fetching journals:", error);
        }
    };

    useEffect(() => {
        if (requisitionId) {
            fetchRequisitionById(requisitionId);
        }
    }, [requisitionId]);


    const fetchRequisitionById = async (id) => {
        try {
            const response = await getRequisitionById(id);
            if (response && response.data) {
                const data = response.data;
                setInitialValues({
                    courseId: data.courseId || "",
                    courseType: data.courseType || "",
                    fromDate: data.fromDate ? new Date(data.fromDate) : null,
                    toDate: data.toDate ? new Date(data.toDate) : null,
                    duration: data.duration || "",
                    venue: data.venue || "",
                    offlineRegistrationFee: data.registrationFee || "0",
                    reference: data.reference || "",
                    organizedBy: data.organizer || "",
                    modeOfPayment: data.modeOfPayment || "ECS",
                    initiatingOfficer: data.initiatingOfficer || "",
                    isSubmitted: data.isSubmitted || "N",
                    isPaperPresent: data.isPaperPresent || "N",
                    necessity: data.necessity || "",
                    reason: data.reason || "",
                    journalId: data.journalId || 0,
                    isMandatory: data.isMandatory || "N",
                    multipartFileEcs: null,
                    multipartFileCheque: null,
                    multipartFilePan: null,
                    multipartFileBrochure: null,
                    multipartCommitteeApproval: null,
                    multipartAcceptanceLetter: null,
                    multipartPaper: null,
                });
                const fees = [];
                if (data.offlineRegistrationFee > 0) {
                    fees.push({
                        value: data.offlineRegistrationFee,
                        label: `Offline - ₹${data.offlineRegistrationFee}`,
                    });
                }
                if (data.onlineRegistrationFee > 0) {
                    fees.push({
                        value: data.onlineRegistrationFee,
                        label: `Online - ₹${data.onlineRegistrationFee}`,
                    });
                }
                setFeeOptions(fees);
                setReqNo(data.requisitionNumber);
                setExistingFiles({
                    multipartFileEcs: data.fileEcs ? { name: data.fileEcs } : null,
                    multipartFileCheque: data.fileCheque ? { name: data.fileCheque } : null,
                    multipartFilePan: data.filePan ? { name: data.filePan } : null,
                    multipartFileBrochure: data.fileBrochure ? { name: data.fileBrochure } : null,
                    multipartCommitteeApproval: data.fileCommitteeApproval ? { name: data.fileCommitteeApproval } : null,
                    multipartAcceptanceLetter: data.fileAcceptanceLetter ? { name: data.fileAcceptanceLetter } : null,
                    multipartPaper: data.filePaper ? { name: data.filePaper } : null,
                });
            } else {
                Swal.fire("Error", "Failed to fetch requisition details. Please try again later.", "error");
            }
        } catch (error) {
            console.error("Error fetching requisition details:", error);
            Swal.fire("Error", "Failed to fetch requisition details. Please try again later.", "error");
        }
    };

    const handleBack = () => {
        navigate("/requisition");
    };

    const handleDownload = async (reqId, file) => {

        let response = await reqFileDownload(reqId, file);

        const { data, fileName, contentType } = response;

        if (data === '0') {
            Swal.fire("Error", "File not found", "error");
            return;
        }

        const blob = new Blob([data], { type: contentType });

        if (contentType === "application/pdf") {
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
        } else {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    };

    const formatName = () => {
        const cleanTitle = (salutation && salutation !== "null") ? salutation : (title && title !== "null") ? title : "";
        const cleanName = (empName && empName !== "null") ? empName : "";
        const cleanDesignation = (designationCode && designationCode !== "null") ? `, ${designationCode}` : "";

        return `${cleanTitle} ${cleanName}`.trim() + cleanDesignation;
    };

    const courseOptions = [
        { value: 0, label: "Add New", data: null },
        ...courseList.map((item) => ({
            value: item.courseId,
            label: item.courseName,
            data: item
        }))
    ];

    const SUPPORTED_FORMATS = [
        "application/pdf",
        "image/jpg",
        "image/jpeg",
        "image/png"
    ];
    const FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const requiredFileValidation = (fieldName) =>
        Yup.mixed()
            .required(`${fieldName} is required`)
            .test("fileSize", "File size must be less than 10MB", (value) => {
                return value && value.size <= FILE_SIZE;
            })
            .test("fileFormat", "Only PDF or Image files are allowed", (value) => {
                return value && SUPPORTED_FORMATS.includes(value.type);
            });

    const optionalFileValidation = (fieldName) =>
        Yup.mixed()
            .nullable()
            .test("fileSize", "File size must be less than 10MB", (value) => {
                if (!value) return true;
                return value.size <= FILE_SIZE;
            })
            .test("fileFormat", "Only PDF or Image files are allowed", (value) => {
                if (!value) return true;
                return SUPPORTED_FORMATS.includes(value.type);
            });

    const buildValidationSchema = (isEdit) => Yup.object().shape({
        courseId: Yup.string().required("Course is required"),
        courseType: Yup.string().required("Course Type is required"),
        fromDate: Yup.date().required("From Date is required"),
        toDate: Yup.date()
            .required("To Date is required")
            .min(Yup.ref("fromDate"), "To Date must be after From Date"),
        organizedBy: Yup.string().trim().required("Organized By is required"),
        venue: Yup.string().trim().required("Venue is required").nullable(),
        offlineRegistrationFee: Yup.number()
            .typeError("Registration Fee must be a number")
            .min(0, "Registration Fee cannot be negative")
            .required("Registration Fee is required"),
        modeOfPayment: Yup.string().trim().required("Payment Mode is required"),
        initiatingOfficer: Yup.string().required("Initiating Officer is required"),
        necessity: Yup.string().trim().required("Necessity of course is required"),
        reason: Yup.string().when("modeOfPayment", {
            is: "Self Payment",
            then: (schema) => schema.required("Reason is required"),
            otherwise: (schema) => schema.nullable()
        }),
        journalId: Yup.string().when("isPaperPresent", {
            is: "Y",
            then: (schema) => schema.required("Title of Paper is required"),
            otherwise: (schema) => schema.nullable()
        }),

        multipartFileEcs: Yup.mixed().when("modeOfPayment", {
            is: "ECS",
            then: () =>
                isEdit
                    ? optionalFileValidation("ECS file")
                    : requiredFileValidation("ECS file"),
            otherwise: (schema) => schema.nullable()
        }),

        multipartFileCheque: Yup.mixed().when("modeOfPayment", {
            is: "ECS",
            then: () =>
                isEdit
                    ? optionalFileValidation("Cheque file")
                    : requiredFileValidation("Cheque file"),
            otherwise: (schema) => schema.nullable()
        }),

        multipartFilePan: Yup.mixed().when("modeOfPayment", {
            is: "ECS",
            then: () =>
                isEdit
                    ? optionalFileValidation("PAN file")
                    : requiredFileValidation("PAN file"),
            otherwise: (schema) => schema.nullable()
        }),

        multipartFileBrochure: Yup.mixed().when("modeOfPayment", {
            is: (value) => value === "ECS" || value === "Self Payment",
            then: () =>
                isEdit
                    ? optionalFileValidation("Brochure file")
                    : requiredFileValidation("Brochure file"),
            otherwise: (schema) => schema.nullable()
        }),

        multipartCommitteeApproval: Yup.mixed().when("isPaperPresent", {
            is: "Y",
            then: () =>
                isEdit
                    ? optionalFileValidation("Committee Approval file")
                    : requiredFileValidation("Committee Approval file"),
            otherwise: (schema) => schema.nullable()
        }),

        multipartAcceptanceLetter: Yup.mixed().when("isPaperPresent", {
            is: "Y",
            then: () =>
                isEdit
                    ? optionalFileValidation("Acceptance Letter file")
                    : requiredFileValidation("Acceptance Letter file"),
            otherwise: (schema) => schema.nullable()
        }),

        multipartPaper: Yup.mixed().when("isPaperPresent", {
            is: "Y",
            then: () =>
                isEdit
                    ? optionalFileValidation("Paper file")
                    : requiredFileValidation("Paper file"),
            otherwise: (schema) => schema.nullable()
        }),

    });


    useEffect(() => {
        if (courseData && courseList.length > 0 && formikRef.current) {
            const selectedProgram = courseList.find(
                item => item.courseId === courseData.courseId
            );
            if (selectedProgram) {
                handleChaneProgram({
                    value: selectedProgram.courseId,
                    label: selectedProgram.courseName,
                    data: selectedProgram
                });
                setCourseData(null);
            }
        }
    }, [courseList, courseData]);


    const handleChaneProgram = (selected) => {

        const { setFieldValue } = formikRef.current;

        if (!selected) return;

        // If Add New clicked
        if (selected.value === 0) {
            setShowCourseModal(true);
            return;
        }

        const selectCourseData = selected.data;
        if (!selectCourseData) return;

        const newOrgData = organizerList.find(
            item => item.organizerId === selectCourseData.organizerId
        );

        const fromDate = new Date(selectCourseData.fromDate);
        const toDate = new Date(selectCourseData.toDate);

        setFieldValue("courseId", selected.value);
        setFieldValue("fromDate", fromDate);
        setFieldValue("toDate", toDate);
        setFieldValue("organizedBy", newOrgData ? newOrgData.organizer : "");
        setFieldValue("courseType", selectCourseData ? selectCourseData.courseType : "");
        setFieldValue("venue", selectCourseData ? selectCourseData.venue : "");
        setFieldValue("offlineRegistrationFee", selectCourseData ? selectCourseData.offlineRegistrationFee : 0);
        setFieldValue("onlineRegistrationFee", selectCourseData ? selectCourseData.onlineRegistrationFee : 0);
        setFieldValue("reference", newOrgData ? `${newOrgData.organizer} - Calendar` : "");

        calculateDuration(fromDate, toDate, setFieldValue);

        const fees = [];
        if (selectCourseData.offlineRegistrationFee > 0) {
            fees.push({
                value: selectCourseData.offlineRegistrationFee,
                label: `Offline - ₹${selectCourseData.offlineRegistrationFee}`,
            });
        }
        if (selectCourseData.onlineRegistrationFee > 0) {
            fees.push({
                value: selectCourseData.onlineRegistrationFee,
                label: `Online - ₹${selectCourseData.onlineRegistrationFee}`,
            });
        }
        setFeeOptions(fees);
    };

    const calculateDuration = (fromDate, toDate, setFieldValue) => {
        if (fromDate && toDate) {
            const diffTime = new Date(toDate) - new Date(fromDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (diffDays >= 0) {
                setFieldValue("duration", diffDays);
            } else {
                setFieldValue("duration", "");
            }
        }
    };

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        try {
            const dto = {
                ...values,
                registrationFee: values.offlineRegistrationFee,
                requisitionNumber: reqNo,
                fromDate: format(new Date(values.fromDate), "yyyy-MM-dd"),
                toDate: format(new Date(values.toDate), "yyyy-MM-dd"),
                requisitionId: requisitionId || null,
            }

            const confirm = await AlertConfirmation({ title: "Are you sure to submit!", message: '' });
            if (!confirm) {
                return;
            }
            const response = requisitionId ? await updateRequisitionData(dto) : await addRequisitionData(dto);
            if (response && response.success) {

                const tab = Number(values.offlineRegistrationFee) > 0 ? "paid" : "free";

                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                resetForm();
                navigate("/requisition", { state: { selectedTab: tab } });
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        } finally {
            setSubmitting(false);
        }
    };

    const journalOptions = journalList.map(data => ({
        value: data?.journalId,
        label: data?.titleOfPaper
    }));


    return (
        <div>
            <h3 className="fancy-heading mt-3">
                {requisitionId ? "Edit Requisition" : "Add Requisition"}
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="p-5">
                <div className="d-flex justify-content-between align-items-center p-2 mb-2 bg-light rounded-3 shadow-sm">
                    <div className="d-flex align-items-center">
                        <span className="badge rounded-pill bg-primary-subtle text-primary me-2 px-3 py-2">
                            <i className="bi bi-person-fill me-1"></i> Participant
                        </span>
                        <span className="fw-bold text-dark">{formatName()}</span>
                    </div>

                    {reqNo && (
                        <div className="d-flex align-items-center">
                            <span className="badge rounded-pill bg-success-subtle text-success me-2 px-3 py-2">
                                Requisition No
                            </span>
                            <span className="font-monospace fw-bold text-muted">{reqNo}</span>
                        </div>
                    )}
                </div>
                <div className="card p-3 shadow-sm border-rounded">
                    <Formik
                        innerRef={formikRef}
                        initialValues={initialValues}
                        validationSchema={buildValidationSchema(!!requisitionId)}
                        enableReinitialize
                        onSubmit={handleSubmit}
                    >
                        {({ values, setFieldValue, isSubmitting, setFieldTouched }) => (
                            <Form autoComplete="off">
                                <div className="row g-3 custom-modal-body p-3">

                                    <div className="col-md-3">
                                        <label className="form-label">Name of the Course</label>
                                        <div className="text-start">
                                            <Select
                                                options={courseOptions}
                                                value={courseOptions.find((item) => item.value === values.courseId) || null}
                                                placeholder="Select Course"
                                                isSearchable
                                                onChange={(selected) => handleChaneProgram(selected)}
                                            />
                                        </div>
                                        <ErrorMessage name="courseId" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">Course Type</label>
                                        <Field name="courseType" type="text" className="form-control" disabled />
                                        <ErrorMessage name="courseType" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">From Date</label>
                                        <DatePicker
                                            id="fromDate"
                                            name="fromDate"
                                            selected={values.fromDate}
                                            onChange={(date) => {
                                                setFieldValue("fromDate", date);
                                                calculateDuration(date, values.toDate, setFieldValue);
                                            }}
                                            className="form-control"
                                            placeholderText="Choose Date"
                                            dateFormat="dd-MM-yyyy"
                                            showYearDropdown
                                            showMonthDropdown
                                            dropdownMode="select"
                                            maxDate={new Date()}
                                            onKeyDown={(event) => event.preventDefault()}
                                        />
                                        <ErrorMessage name="fromDate" component="div" className="text-danger small" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">To Date</label>
                                        <DatePicker
                                            id="toDate"
                                            name="toDate"
                                            selected={values.toDate}
                                            onChange={(date) => {
                                                setFieldValue("toDate", date);
                                                calculateDuration(values.fromDate, date, setFieldValue);
                                            }}
                                            className="form-control"
                                            placeholderText="Choose Date"
                                            dateFormat="dd-MM-yyyy"
                                            showYearDropdown
                                            showMonthDropdown
                                            dropdownMode="select"
                                            maxDate={new Date()}
                                            onKeyDown={(event) => event.preventDefault()}
                                        />
                                        <ErrorMessage name="toDate" component="div" className="text-danger small" />
                                    </div>

                                    <div className="col-md-1">
                                        <label className="form-label">Duration</label>
                                        <Field name="duration" type="text" className="form-control" placeholder="Duration" disabled />
                                        <ErrorMessage name="duration" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">Organized By</label>
                                        <Field name="organizedBy" type="text" className="form-control" disabled />
                                        <ErrorMessage name="organizedBy" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Reference</label>
                                        <Field name="reference" type="text" className="form-control" />
                                        <ErrorMessage name="reference" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Venue</label>
                                        <Field name="venue" type="text" className="form-control" disabled />
                                        <ErrorMessage name="venue" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Registration Fee (₹)</label>

                                        {values.offlineRegistrationFee === 0 ? (

                                            <Field
                                                name="offlineRegistrationFee"
                                                type="number"
                                                className="form-control"
                                                disabled
                                            />

                                        ) : feeOptions.length > 1 ? (

                                            <Select
                                                options={feeOptions}
                                                value={feeOptions.find(fee => fee.value === values.offlineRegistrationFee) || null}
                                                placeholder="Select Fee Type"
                                                onChange={(selected) => {
                                                    setFieldValue("offlineRegistrationFee", selected ? selected.value : 0);
                                                }}
                                            />

                                        ) : (

                                            <Field
                                                name="offlineRegistrationFee"
                                                type="number"
                                                className="form-control"
                                                disabled
                                            />

                                        )}

                                        <ErrorMessage name="offlineRegistrationFee" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Mode of Payment</label>

                                        <div className="d-flex gap-5">
                                            <label>
                                                <Field
                                                    type="radio"
                                                    name="modeOfPayment"
                                                    value="ECS"
                                                    className="form-check-input me-1"
                                                    onChange={(e) => {
                                                        setFieldValue("modeOfPayment", "ECS");

                                                        // clear others mode fields
                                                        setFieldValue("reason", "");
                                                        setFieldValue("multipartFileBrochure", null);
                                                    }}
                                                />
                                                ECS
                                            </label>

                                            <label>
                                                <Field
                                                    type="radio"
                                                    name="modeOfPayment"
                                                    value="Self Payment"
                                                    className="form-check-input me-1"
                                                    onChange={(e) => {
                                                        setFieldValue("modeOfPayment", "Self Payment");

                                                        // clear ECS files
                                                        setFieldValue("multipartFileEcs", null);
                                                        setFieldValue("multipartFileCheque", null);
                                                        setFieldValue("multipartFilePan", null);
                                                    }}
                                                />
                                                Self Payment
                                            </label>

                                        <label>
                                                <Field
                                                    type="radio"
                                                    name="modeOfPayment"
                                                    value="NA"
                                                    className="form-check-input me-1"
                                                    onChange={(e) => {
                                                        setFieldValue("modeOfPayment", "NA");
                                                        // clear ECS files
                                                        setFieldValue("multipartFileEcs", null);
                                                        setFieldValue("multipartFileCheque", null);
                                                        setFieldValue("multipartFilePan", null);
                                                    }}
                                                />
                                                NA
                                            </label>

                                        </div>

                                        <ErrorMessage name="modeOfPayment" component="div" className="invalid-msg" />
                                    </div>


                                    <div className={values.courseType === "Conference" ? "col-md-5 mt-4" : "col-md-6 mt-4"}>
                                        <span className="form-label me-3">
                                            Feedback / Impact forms / Participation certificate of previous course submitted
                                        </span>

                                        <div className="btn-group bg-light rounded-pill border" role="group">
                                            <button
                                                type="button"
                                                className={`btn rounded-pill px-4 py-2 transition-all ${values.isSubmitted === "Y" ? "btn-success shadow-sm" : "btn-light text-muted"
                                                    }`}
                                                onClick={() => setFieldValue("isSubmitted", "Y")}
                                            >
                                                Yes
                                            </button>

                                            <button
                                                type="button"
                                                className={`btn rounded-pill px-4 py-2 transition-all ${values.isSubmitted === "N" ? "btn-danger shadow-sm" : "btn-light text-muted"
                                                    }`}
                                                onClick={() => setFieldValue("isSubmitted", "N")}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>

                                    {values.courseType === "Conference" &&
                                        <>
                                            <div className="col-md-3 mt-4">
                                                <span className="form-label me-3">
                                                    Paper present in conference, if any
                                                </span>

                                                <div className="btn-group bg-light rounded-pill border" role="group">
                                                    <button
                                                        type="button"
                                                        className={`btn rounded-pill px-4 py-2 transition-all ${values.isPaperPresent === "Y" ? "btn-success shadow-sm" : "btn-light text-muted"
                                                            }`}
                                                        onClick={() => setFieldValue("isPaperPresent", "Y")}
                                                    >
                                                        Yes
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`btn rounded-pill px-4 py-2 transition-all ${values.isPaperPresent === "N" ? "btn-danger shadow-sm" : "btn-light text-muted"
                                                            }`}
                                                        onClick={() => setFieldValue("isPaperPresent", "N")}
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            </div>

                                            {values.isPaperPresent === "Y" &&
                                                <>
                                                    <div className="col-md-4 mt-4">
                                                        <span className="form-label me-3">
                                                            Title of Paper
                                                        </span>
                                                        <Select
                                                            options={journalOptions}
                                                            value={journalOptions.find((item) => item.value === values.journalId) || null}
                                                            placeholder="Select Paper"
                                                            isSearchable
                                                            onChange={(selected) => {
                                                                setFieldValue("journalId", selected ? selected.value : 0);
                                                            }}
                                                        />
                                                        <ErrorMessage name="journalId" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="row mt-4">
                                                        <h6 className="text-start text-primary">Mandatory Enclosures for conference</h6>
                                                        {[
                                                            { label: "1. Commitee Approval Letter", name: "multipartCommitteeApproval" },
                                                            { label: "2. Paper Acceptance Letter", name: "multipartAcceptanceLetter" },
                                                            { label: "3. Paper", name: "multipartPaper" },
                                                        ].map((item, index) => (
                                                            <div className="col-md-4 mb-3" key={index}>
                                                                <label className="form-label small fw-medium text-secondary">
                                                                    {item.label}
                                                                </label>

                                                                <div className="border rounded p-2 bg-light">

                                                                    {/* Existing File (Edit Mode) */}
                                                                    {requisitionId && existingFiles[item.name] && !values[item.name] && (
                                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-link text-primary p-0 small text-decoration-none"
                                                                                onClick={() => handleDownload(requisitionId, existingFiles[item.name].name)}
                                                                            >
                                                                                <BsFileEarmark className="me-1 mb-1" />
                                                                                {existingFiles[item.name].name}
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    {/* Newly Selected File */}
                                                                    {values[item.name] && (
                                                                        <div className="small text-success mb-2">
                                                                            <FaCheckCircle className="me-1" />
                                                                            {values[item.name].name}
                                                                        </div>
                                                                    )}

                                                                    {/* File Input */}
                                                                    <input
                                                                        type="file"
                                                                        className="form-control form-control-sm"
                                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                                        onChange={(event) => {
                                                                            const file = event.currentTarget.files?.[0] || null;
                                                                            setFieldValue(item.name, file);
                                                                        }}
                                                                        onBlur={() => setFieldTouched(item.name, true)}
                                                                        onClick={(e) => (e.target.value = null)}
                                                                    />

                                                                </div>

                                                                <ErrorMessage name={item.name} component="div" className="invalid-msg" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            }

                                        </>
                                    }

                                    <div className="col-md-12">
                                        <label className="form-label">Necessity of course and benefits</label>
                                        <Field name="necessity" as="textarea" rows={3} className="form-control" />
                                        <ErrorMessage name="necessity" component="div" className="invalid-msg" />
                                    </div>

                                </div>

                                {values.modeOfPayment === "ECS" && (
                                    <div className="row mt-3">
                                        <h6 className="text-start ms-3 text-primary">Mandatory Enclosures to be Attach</h6>

                                        <div className="row ms-2 mt-2 text-start">
                                            {[
                                                { label: "1. ECS", name: "multipartFileEcs" },
                                                { label: "2. Blank cancelled cheque (Photo copy)", name: "multipartFileCheque" },
                                                { label: "3. PAN card (Photo copy)", name: "multipartFilePan" },
                                                { label: "4. Brochure", name: "multipartFileBrochure" }
                                            ].map((item, index) => (
                                                <div className="col-md-3 mb-3" key={index}>
                                                    <label className="form-label small fw-medium text-secondary">
                                                        {item.label}
                                                    </label>

                                                    <div className="border rounded p-2 bg-light">

                                                        {/* Existing File (Edit Mode) */}
                                                        {requisitionId && existingFiles[item.name] && !values[item.name] && (
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-link text-primary p-0 small text-decoration-none"
                                                                    onClick={() => handleDownload(requisitionId, existingFiles[item.name].name)}
                                                                >
                                                                    <BsFileEarmark className="me-1 mb-1" />
                                                                    {existingFiles[item.name].name}
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Newly Selected File */}
                                                        {values[item.name] && (
                                                            <div className="small text-success mb-2">
                                                                <FaCheckCircle className="me-1" />
                                                                {values[item.name].name}
                                                            </div>
                                                        )}

                                                        {/* File Input */}
                                                        <input
                                                            type="file"
                                                            className="form-control form-control-sm"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(event) => {
                                                                const file = event.currentTarget.files?.[0] || null;
                                                                setFieldValue(item.name, file);
                                                            }}
                                                            onBlur={() => setFieldTouched(item.name, true)}
                                                            onClick={(e) => (e.target.value = null)}
                                                        />

                                                    </div>

                                                    <ErrorMessage name={item.name} component="div" className="invalid-msg" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {["Self Payment", "NA"].includes(values.modeOfPayment)  && (
                                    <div className="row custom-modal-body text-start p-3">
                                        <div className="col-md-8">
                                            <label className="form-label">Reason</label>
                                            <Field
                                                name="reason"
                                                type="text"
                                                className="form-control"
                                            />
                                            <ErrorMessage name="reason" component="div" className="invalid-msg" />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label small fw-medium text-secondary">Brochure Upload</label>
                                            <div className="border rounded p-2 bg-light">

                                                {requisitionId && existingFiles["multipartFileBrochure"] && !values["multipartFileBrochure"] && (
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-link text-primary p-0 small text-decoration-none"
                                                            onClick={() => handleDownload(requisitionId, existingFiles["multipartFileBrochure"].name)}
                                                        >
                                                            <BsFileEarmark className="me-1 mb-1" />
                                                            {existingFiles["multipartFileBrochure"].name}
                                                        </button>
                                                    </div>
                                                )}

                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(event) => {
                                                        const file = event.currentTarget.files?.[0] || null;
                                                        setFieldValue("multipartFileBrochure", file);
                                                    }}
                                                />
                                            </div>
                                            <ErrorMessage name="multipartFileBrochure" component="div" className="invalid-msg" />
                                        </div>
                                    </div>
                                )}

                                <div className="text-center mt-4">
                                    <button type="submit"
                                        className={requisitionId ? `update` : `submit`}
                                        disabled={isSubmitting}
                                    >
                                        {requisitionId ? `update` : `submit`}
                                    </button>
                                    <button
                                        type="button"
                                        className="back"
                                        onClick={handleBack}
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <div className="text-start">
                                    <span className="text-muted small">
                                        Note: After submission, the requisition will be sent for approval. You can track the status in the requisition list.
                                    </span>
                                </div>

                            </Form>
                        )}
                    </Formik>
                </div>
            </div>

            {showCourseModal && (
                <CourseModal
                    showProgramModal={showCourseModal}
                    setShowProgramModal={setShowCourseModal}
                    setCourseData={setCourseData}
                    fetchPrograms={fetchPrograms}
                    isMandatory={false}
                />
            )}

        </div>
    );
};

export default AddEditRequisition;