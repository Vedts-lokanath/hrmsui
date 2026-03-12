import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { getEmployees, handleApiError } from "../../service/master.service";
import Select from "react-select";
import Swal from "sweetalert2";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { addEvaluation, getEvaluationList, getEvaluationPrint, getRequisitions } from "../../service/training.service";
import { format } from "date-fns";
import "./Training.css";
import { FaArrowRight } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6";
import EvaluationPrint from "../print/evaluation";
import DatePicker from "react-datepicker";


export const getFinancialYearRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startYear = month >= 3 ? year : year - 1;

    return {
        startDate: new Date(startYear, 3, 1),
        endDate: new Date(startYear + 1, 2, 31),
    };
};


const Evaluation = () => {

    const [showModal, setShowModal] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    const [requisitionList, setRequisitionList] = useState([]);
    const [evaluationList, setEvaluationList] = useState([]);

    const roleName = localStorage.getItem("roleName");
    const empId = localStorage.getItem("empId");
    const title = localStorage.getItem("title");
    const salutation = localStorage.getItem("salutation");
    const empName = localStorage.getItem("empName");
    const designationCode = localStorage.getItem("designationCode");

    const [empData, setEmpData] = useState(null);

    const { startDate, endDate } = getFinancialYearRange();
    const [fromDate, setFromDate] = useState(startDate || new Date());
    const [toDate, setToDate] = useState(endDate || new Date());

    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchEmployees();
        fetchRequisitions();
    }, []);

    useEffect(() => {
        if (fromDate && toDate) {
            fetchEvaluations(fromDate, toDate);
        }
    }, [fromDate, toDate]);

    const fetchEvaluations = async (from, to) => {
        try {
            if (!from || !to) return;
            const formatFromDate = format(from, "yyyy-MM-dd");
            const formatToDate = format(to, "yyyy-MM-dd");
            const response = await getEvaluationList(formatFromDate, formatToDate);
            setEvaluationList(response?.data || []);
        } catch (error) {
            console.error("Error fetching evaluation:", error);
            Swal.fire("Error", "Failed to fetch evaluation data. Please try again later.", "error");
        }
    };

    const fetchRequisitions = async () => {
        try {
            const response = await getRequisitions(empId,roleName);
            setRequisitionList(response?.data || []);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(empId, roleName);
            setEmployeeList(response?.data || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const [initialValues, setInitialValues] = useState({
        initiator: "",
        evaluationData: {}
    });

    const validationSchema = Yup.object().shape({
        initiator: Yup.string().notRequired(),

        evaluationData: Yup.object().shape({
            courseName: Yup.string().required(),
            fromDate: Yup.date().nullable().required(),
            toDate: Yup.date().nullable().required(),
            impact: Yup.string().required("Impact is required")
        })
    });


    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        try {
            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await addEvaluation(values);
            if (response && response.success) {
                Swal.fire({
                    title: "Success",
                    text: response.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                });
                resetForm();
                setShowModal(false);
                fetchEvaluations(fromDate, toDate);
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        } finally {
            setSubmitting(false);
        }
    };

    const formatName = () => {
        const cleanTitle = (title && title !== "null") ? title : (salutation && salutation !== "null") ? salutation : "";
        const cleanName = (empName && empName !== "null") ? empName : "";
        const cleanDesignation = (designationCode && designationCode !== "null") ? `, ${designationCode}` : "";

        return `${cleanTitle} ${cleanName}`.trim() + cleanDesignation;
    };

    const impactOptions = [
        { value: "E", label: "Excellent" },
        { value: "VG", label: "Very Good" },
        { value: "G", label: "Good" },
        { value: "M", label: "Margin" },
        { value: "N", label: "Nil" },
    ];

    const getImpactLabel = (code) => {
        return impactOptions.find(o => o.value === code)?.label || code;
    };

    const evaluationMap = new Map(
        (evaluationList || []).map(e => [e.initiator, e])
    );

    const requisitionMap = new Map();
    (requisitionList || [])
    .filter(r => r.status === "AV")
    .forEach(r => {
        if (!requisitionMap.has(r.initiatingOfficer) && r.status==="AV") {
            requisitionMap.set(r.initiatingOfficer, []);
        }

        requisitionMap.get(r.initiatingOfficer).push({
            requisitionId: r.requisitionId,
            courseId: r.courseId,
            courseName: r.courseName,
            fromDate: r.fromDate,
            toDate: r.toDate,
            impact: ""
        });
    });


    const mergedEvaluationList = employeeList.reduce((result, emp) => {

        const existingEval = evaluationMap.get(emp.empId);
        const existEvaluation = existingEval?.evaluation || [];

        const existingProgramIds = new Set(
            existEvaluation.map(p => p.courseId)
        );

        const reqPrograms = requisitionMap.get(emp.empId) || [];

        const newPrograms = reqPrograms.filter(
            p => !existingProgramIds.has(p.courseId)
        );

        const mergedPrograms = [...existEvaluation, ...newPrograms]
            .sort((a, b) => new Date(b.fromDate || 0) - new Date(a.fromDate || 0));

        if (mergedPrograms.length > 0) {
            result.push({
                initiator: emp.empId,
                empName: emp.empName,
                designation: emp.empDesigName,
                title: emp.title ? emp.title : (emp.salutation ? emp.salutation : ""),
                evaluation: mergedPrograms
            });
        }

        return result;

    }, []);


    const filteredList = mergedEvaluationList.filter((emp) => {
        const search = searchText.toLowerCase();

        const empMatch =
            emp.empName?.toLowerCase().includes(search) ||
            emp.designation?.toLowerCase().includes(search) ||
            emp.title?.toLowerCase().includes(search);

        const programMatch = emp.evaluation?.some((prog) =>
            prog.courseName?.toLowerCase().includes(search)
        );

        const impactMatch = emp.evaluation?.some((prog) =>
            getImpactLabel(prog.impact)?.toLowerCase().includes(search)
        );

        return empMatch || programMatch || impactMatch;
    });

    const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));

    const paginatedList = filteredList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePrint = async (item) => {
        try {
            if (!item?.initiator) {
                Swal.fire("Warning", "Employee not found for printing.", "warning");
                return;
            }

            const response = await getEvaluationPrint(item.initiator);
            if (!response || !response.data) {
                Swal.fire("No Data", "No evaluation data available to print.", "info");
                return;
            }

            if (!response.data?.evaluation || response.data.evaluation.length === 0) {
                Swal.fire(
                    "Evaluation Pending",
                    "The evaluation for this record has not been completed yet.",
                    "info"
                );
                return;
            }
            const empName = formatName();
            await EvaluationPrint(response.data, empName);

        } catch (error) {
            console.error("Print Error:", error);
            Swal.fire("Error", "Something went wrong while generating the PDF.", "error");
        }
    };

    const getPageNumbers = () => {
        if (!totalPages || totalPages < 1) return [];

        const pages = [];
        const maxVisible = 5;

        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push("...");
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    };

    const handleAddImpact = (emp, prog) => {
        setShowModal(true);
        setEmpData(emp);
        setInitialValues({
            initiator: emp.initiator,
            evaluationData: prog
        });
    };



    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Evaluation List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="container mt-5">

                <div className="row mb-3 custom-modal-body">
                    <div className="col-md-6 col-lg-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search Employee or Program"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="col-md-6 col-lg-8 d-flex justify-content-md-end mt-2 mt-md-0">
                        <div className="col-md-3 mb-3 me-2">
                            <DatePicker
                                selected={fromDate}
                                onChange={(date) => setFromDate(date)}
                                className="form-control"
                                dateFormat="dd-MM-yyyy"
                                showYearDropdown
                                showMonthDropdown
                                dropdownMode="select"
                                placeholderText="From Date"
                                onKeyDown={(event) => event.preventDefault()}
                            />
                        </div>

                        <div className="col-md-3 mb-3">
                            <DatePicker
                                selected={toDate}
                                onChange={(date) => setToDate(date)}
                                className="form-control"
                                dateFormat="dd-MM-yyyy"
                                minDate={fromDate}
                                showYearDropdown
                                showMonthDropdown
                                dropdownMode="select"
                                placeholderText="To Date"
                                onKeyDown={(event) => event.preventDefault()}
                            />
                        </div>
                    </div>
                </div>

                <div className="row">
                    {paginatedList.map((emp, index) => (
                        <div key={index} className="col-12 col-md-6 col-lg-4 mb-4">
                            <div className="evaluation-card">
                                <div className="evaluation-header">
                                    <h5 className="mb-0">
                                        {emp.title} {emp.empName}, {emp.designation}
                                    </h5>
                                    <button
                                        className="pdf-btn"
                                        onClick={() => handlePrint(emp)}
                                        title="Download PDF"
                                    >
                                        <FaFilePdf />
                                    </button>
                                </div>

                                <div className="evaluation-body">
                                    {emp.evaluation.map((prog, i) => (
                                        <div key={i} className="program-row">
                                            <div className="program-info">
                                                <div className="program-name text-start">
                                                    {prog.courseName}
                                                </div>
                                                <div className="program-date">
                                                    {format(new Date(prog.fromDate), "dd-MM-yyyy")} <FaArrowRight className="mb-1" /> {format(new Date(prog.toDate), "dd-MM-yyyy")}
                                                </div>
                                            </div>
                                            {prog.impact ? (
                                                <div className={`impact-badge impact-${prog.impact}`}>
                                                    {getImpactLabel(prog.impact)}
                                                </div>
                                            ) : roleName === "ROLE_DH" ? (
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleAddImpact(emp, prog)}
                                                    title="Add Impact"
                                                >
                                                    ADD
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="Impact yet to be filled"
                                                >
                                                    Pending
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages && totalPages > 0 && (
                    <div className="d-flex justify-content-end mt-4">
                        <ul className="pagination">

                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Prev
                                </button>
                            </li>

                            {getPageNumbers().map((page, index) => (
                                <li
                                    key={index}
                                    className={`page-item ${currentPage === page ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => page !== "..." && setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Next
                                </button>
                            </li>

                        </ul>
                    </div>
                )}

            </div>


            {showModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={() => setShowModal(false)}></div>
                    <div className="modal d-block custom-modal" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title"><span className="cs-head-text">Fill Evaluation Impacts</span></h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        enableReinitialize
                                        onSubmit={handleSubmit}
                                    >
                                        {({ values, setFieldValue, isSubmitting }) => (
                                            <Form autoComplete="off">

                                                <div className="row mb-4 align-items-center">
                                                    <div className="col-md-4 text-end">
                                                        <label className="form-label fw-semibold">
                                                            Employee Name :
                                                        </label>
                                                    </div>
                                                    <div className="col-md-5">
                                                        <Field
                                                            name="employeeName"
                                                            className="form-control"
                                                            value={`${empData?.title || ""} ${empData?.empName || ""}, ${empData?.designation || ""}`}
                                                            disabled
                                                        />
                                                    </div>
                                                </div>

                                                {values.evaluationData && Object.keys(values.evaluationData).length > 0 ? (
                                                    <div className="card shadow-sm border-0 mt-3">
                                                        <div className="card-header cs-card-header">
                                                            Training Details
                                                        </div>

                                                        <div className="card-body">

                                                            <div className="row mb-2 p-1 align-items-end">

                                                                <div className="col-md-5">
                                                                    <label className="form-label">Course</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={values.evaluationData.courseName}
                                                                        disabled
                                                                    />
                                                                </div>

                                                                <div className="col-md-2">
                                                                    <label className="form-label">From</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={format(new Date(values.evaluationData.fromDate), "dd-MM-yyyy")}
                                                                        disabled
                                                                    />
                                                                </div>

                                                                <div className="col-md-2">
                                                                    <label className="form-label">To</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={format(new Date(values.evaluationData.toDate), "dd-MM-yyyy")}
                                                                        disabled
                                                                    />
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <label className="form-label">
                                                                        Impact <span className="text-danger">*</span>
                                                                    </label>

                                                                    <Select
                                                                        className="cs-emp-select"
                                                                        options={impactOptions}
                                                                        value={impactOptions.find(o => o.value === values.evaluationData.impact) || null}
                                                                        onChange={(selectedOption) =>
                                                                            setFieldValue(
                                                                                `evaluationData.impact`,
                                                                                selectedOption?.value || ""
                                                                            )
                                                                        }
                                                                        name={`evaluationData.impact`}
                                                                        placeholder="Select Impact"
                                                                        isClearable
                                                                    />

                                                                    <ErrorMessage
                                                                        name={`evaluationData.impact`}
                                                                        component="div"
                                                                        className="invalid-msg"
                                                                    />
                                                                </div>

                                                            </div>

                                                        </div>
                                                    </div>
                                                ) : (
                                                    values.initiator ? (
                                                        <div className="no-data-wrapper">
                                                            <div className="no-data-card">
                                                                <div className="no-data-icon">
                                                                    📂
                                                                </div>
                                                                <h5 className="mt-3 mb-1">No Programs Found</h5>
                                                                <p className="text-muted mb-0">
                                                                    This employee has no training programs available.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="no-data-wrapper">
                                                            <div className="no-data-card">
                                                                <p className="text-muted mb-0">
                                                                    Please select the employee.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                )}

                                                {/* Buttons */}
                                                <div className="text-center mt-4">
                                                    <button
                                                        type="submit"
                                                        className="submit"
                                                        disabled={isSubmitting}
                                                    >
                                                        Submit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="back"
                                                        onClick={() => setShowModal(false)}
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
            )}

        </div>
    );
};

export default Evaluation;