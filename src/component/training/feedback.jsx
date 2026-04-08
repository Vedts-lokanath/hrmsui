import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import { format } from "date-fns";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { handleApiError } from "../../service/master.service";
import Swal from "sweetalert2";
import { getFeedbackById, requisitionFeedback, updateReqFeedback } from "../../service/training.service";
import { BsFileEarmark } from "react-icons/bs";



const Feedback = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const item = location.state;
    const [editData, setEditData] = useState(null);
    const [certificateFile, setCertificateFile] = useState(null);
    const [invoiceFile, setInvoiceFile] = useState(null);


    useEffect(() => {
        if (item && item.feedbackId) {
            fetchEditData(item.feedbackId);
        }
    }, []);

    const fetchEditData = async (fid) => {
        try {
            const response = await getFeedbackById(fid);
            setEditData(response?.data || null);
        } catch (error) {
            console.error("Error fetching feedback data:", error);
        }
    };

    useEffect(() => {
        if (editData && Object.keys(editData).length > 0) {
            setInitialValues({
                feedbackId: editData.feedbackId,
                requisitionId: editData.requisitionId,
                participantId: editData.participantId,
                facultyName: editData.facultyName,
                facultyAddress: editData.facultyAddress,
                remark: editData.remark,
                course: editData.course,
                coverage: editData.coverage,
                duration: editData.duration,
                faculty: editData.faculty,
                participant: editData.participant,
                courseVenue: editData.courseVenue,
                quality: editData.quality,
                seminarVenue: editData.seminarVenue,
            });
        }
    }, [editData]);

    const [initialValues, setInitialValues] = useState({
        feedbackId: "",
        requisitionId: "",
        feedbackDate: null,
        participantId: "",
        facultyName: "",
        facultyAddress: "",
        remark: "",
        course: "",
        coverage: "",
        duration: "",
        faculty: "",
        participant: "",
        courseVenue: "",
        quality: "",
        seminarVenue: "",
    });

    const feedbackRows = [
        { id: "course", label: "Quality of course material" },
        { id: "coverage", label: "Adequacy of coverage" },
        { id: "duration", label: "Adequacy of duration" },
        { id: "faculty", label: "Competency of faculty" },
        { id: "participant", label: "Interaction with participants" },
        { id: "courseVenue", label: "Infrastructure at the venue" },
    ];

    const overallFeedbackRows = [
        { id: "quality", label: "Overall quality" },
        { id: "seminarVenue", label: "Infrastructure at the venue" },
    ];


    const grades = ["E", "VG", "G", "A", "P"];

    const validationSchema = Yup.object({
        course: Yup.string().required("Required"),
        coverage: Yup.string().required("Required"),
        duration: Yup.string().required("Required"),
        faculty: Yup.string().required("Required"),
        participant: Yup.string().required("Required"),
        courseVenue: Yup.string().required("Required"),
        quality: Yup.string().required("Required"),
        seminarVenue: Yup.string().required("Required"),
    });


    const handleFeedbackSubmit = async (values, { resetForm, setSubmitting }) => {
        try {

            if (!certificateFile && !editData?.certificate) {
                Swal.fire("Warning", "Please upload the certificate file.", "warning");
                return;
            }

            const dto = {
                ...values,
                requisitionId: item?.requisitionId || editData?.requisitionId,
                feedbackDate: format(new Date(), "yyyy-MM-dd"),
                participantId: item?.initiatingOfficer || editData?.participantId,
                facultyName: initialValues.facultyName?.trim(),
                facultyAddress: initialValues.facultyAddress?.trim(),
                remark: initialValues.remark?.trim(),
                certificateFile,
                invoiceFile,
            };

            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) {
                return;
            }
            const response = editData?.feedbackId ? await updateReqFeedback(dto) : await requisitionFeedback(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                resetForm();
                navigate("/feedback");
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Feedback Form
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="p-2">
                <div className="card p-3 mt-3 shadow-sm border-rounded ">

                    <div className="card-body custom-modal-body">

                        <div className="row g-3">

                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={(item?.initiatingOfficerName || editData?.participantName) || ""}
                                    disabled
                                />
                            </div>

                            <div className="col-md-2">
                                <label className="form-label fw-semibold">Division</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={(item?.empDivCode || editData?.divisionName) || ""}
                                    disabled
                                />
                            </div>

                            <div className="col-md-2">
                                <label className="form-label fw-semibold">Organized By</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={item?.organizer || ""}
                                    disabled
                                />
                            </div>

                            <div className="col-md-5">
                                <label className="form-label fw-semibold">
                                    Title of Course / Workshop / Seminar / Conference
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={(item?.courseName || editData?.courseName) || ""}
                                    disabled
                                />
                            </div>

                            {/* From Date */}
                            <div className="col-md-1">
                                <label className="form-label fw-semibold">From</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={item?.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : ""}
                                    disabled
                                />
                            </div>

                            {/* To Date */}
                            <div className="col-md-1">
                                <label className="form-label fw-semibold">To</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={item?.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : ""}
                                    disabled
                                />
                            </div>

                            {/* Duration */}
                            <div className="col-md-1">
                                <label className="form-label fw-semibold">Duration</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={(editData && editData.feedbackId ? editData?.programDuration : item?.duration) || ""}
                                    disabled
                                />
                            </div>

                            <div className="col-md-9">
                                <label className="form-label fw-semibold">
                                    Any faculty of the subject/course suggested for in-house lecture/course
                                </label>

                                <div className="row g-2">
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Faculty Name & Designation"
                                            value={initialValues.facultyName || ""}
                                            onChange={(e) =>
                                                setInitialValues((prev) => ({
                                                    ...prev,
                                                    facultyName: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Faculty Address"
                                            value={initialValues.facultyAddress || ""}
                                            onChange={(e) =>
                                                setInitialValues((prev) => ({
                                                    ...prev,
                                                    facultyAddress: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <label className="form-label fw-semibold">
                                    Any other suggestion/ Remarks:
                                </label>
                                <textarea
                                    className="form-control"
                                    placeholder="Suggestion / Remarks"
                                    rows={2}
                                    value={initialValues.remark || ""}
                                    onChange={(e) =>
                                        setInitialValues((prev) => ({
                                            ...prev,
                                            remark: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Certificate</label>
                                <div className="border rounded p-2 bg-light">

                                    {editData && editData.certificate && (
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <button
                                                type="button"
                                                className="btn btn-link text-primary p-0 small text-decoration-none"

                                            >
                                                <BsFileEarmark className="me-1 mb-1" />
                                                {editData.certificate}
                                            </button>
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(event) => {
                                            const file = event.currentTarget.files?.[0] || null;
                                            setCertificateFile(file);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Invoice/Other Documents</label>
                                <div className="border rounded p-2 bg-light">

                                    {editData && editData.invoice && (
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <button
                                                type="button"
                                                className="btn btn-link text-primary p-0 small text-decoration-none"

                                            >
                                                <BsFileEarmark className="me-1 mb-1" />
                                                {editData.invoice}
                                            </button>
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(event) => {
                                            const file = event.currentTarget.files?.[0] || null;
                                            setInvoiceFile(file);
                                        }}
                                    />
                                </div>
                                <span className="text-muted small">Note : Original shall be submitted to O/o HRT for payment processing.</span>
                            </div>

                        </div>
                    </div>
                    <em className="text-primary text-start fw-semibold">Tick in appropriate box: - E: Excellent, VG: Very Good, G: Good, A: Average, P: Poor </em>


                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleFeedbackSubmit}
                        enableReinitialize
                    >
                        {({ values, setFieldValue, errors }) => (
                            <Form>

                                {/* ---------------- FIRST TABLE ---------------- */}
                                <div className="row">
                                    <div className="col-md-6">
                                        <div>
                                            <span className="d-block text-start">
                                                (a) For Courses / Workshops / Tutorials:
                                            </span>
                                        </div>
                                        <div className="table-responsive mt-1">
                                            <table
                                                className="table table-bordered text-center align-middle table-sm"
                                                style={{ fontSize: "14px" }}
                                            >
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{ width: "5%" }}>S.No</th>
                                                        <th style={{ width: "35%" }}>Details</th>
                                                        {grades.map((g) => (
                                                            <th key={g}>{g}</th>
                                                        ))}
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {feedbackRows.map((row, index) => (
                                                        <tr key={row.id}>
                                                            <td className="text-center">{index + 1}</td>
                                                            <td className="text-start">{row.label}</td>

                                                            {grades.map((grade) => (
                                                                <td
                                                                    key={grade}
                                                                    className="text-center"
                                                                    style={{ cursor: "pointer" }}
                                                                    onClick={() => {
                                                                        const currentValue = values[row.id];

                                                                        setFieldValue(
                                                                            row.id,
                                                                            currentValue === grade ? "" : grade
                                                                        );
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input"
                                                                        checked={values[row.id] === grade}

                                                                        style={{
                                                                            transform: "scale(1.2)",
                                                                            cursor: "pointer",
                                                                            accentColor: "#0d6efd",
                                                                            border: "1px solid #8bb1dd"

                                                                        }}
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* ---------------- SECOND TABLE ---------------- */}
                                    <div className="col-md-6">
                                        <span className="d-block text-start mt-1">
                                            (b) For conferences/seminar/symposium:
                                        </span>

                                        <div className="table-responsive mt-1">
                                            <table
                                                className="table table-bordered text-center align-middle table-sm"
                                                style={{ fontSize: "14px" }}
                                            >
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{ width: "5%" }}>S.No</th>
                                                        <th style={{ width: "35%" }}>Details</th>
                                                        {grades.map((g) => (
                                                            <th key={g}>{g}</th>
                                                        ))}
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {overallFeedbackRows.map((row, index) => (
                                                        <tr key={row.id}>
                                                            <td className="text-center">{index + 1}</td>
                                                            <td className="text-start">{row.label}</td>
                                                            {grades.map((grade) => (
                                                                <td
                                                                    key={grade}
                                                                    className="text-center"
                                                                    style={{ cursor: "pointer" }}
                                                                    onClick={() => {
                                                                        const currentValue = values[row.id];

                                                                        setFieldValue(
                                                                            row.id,
                                                                            currentValue === grade ? "" : grade
                                                                        );
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input"
                                                                        checked={values[row.id] === grade}
                                                                        style={{
                                                                            transform: "scale(1.2)",
                                                                            cursor: "pointer",
                                                                            accentColor: "#0d6efd",
                                                                            border: "1px solid #8bb1dd"
                                                                        }}
                                                                    />
                                                                </td>
                                                            ))}


                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <div className="text-danger mt-2 text-center">
                                        Please provide rating for all fields.
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="text-center mt-3">
                                    <button type="submit" className={editData?.feedbackId ? `update` : `submit`}>
                                        {editData?.feedbackId ? "Update Feedback" : "Submit Feedback"}
                                    </button>
                                    <button type="button" className="back" onClick={() => navigate(-1)} >
                                        Back
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>

    );


};
export default Feedback;