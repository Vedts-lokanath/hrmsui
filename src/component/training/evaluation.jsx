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

const Evaluation = () => {

    const [showModal, setShowModal] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    const [requisitionList, setRequisitionList] = useState([]);
    const [evaluationList, setEvaluationList] = useState([]);
    const roleName = localStorage.getItem("roleName");
    const empId = localStorage.getItem("empId");

    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchEmployees();
        fetchRequisitions();
        fetchEvaluations();
    }, []);

    const fetchEvaluations = async () => {
        try {
            const response = await getEvaluationList();
            setEvaluationList(response?.data || []);
        } catch (error) {
            console.error("Error fetching evaluation:", error);
            Swal.fire("Error", "Failed to fetch evaluation data. Please try again later.", "error");
        }
    };

    const fetchRequisitions = async () => {
        try {
            const response = await getRequisitions();
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


    const handleAdd = () => {
        setShowModal(true);
    };

    const [initialValues, setInitialValues] = useState({
        initiator: "",
        evaluation: []
    });

    const validationSchema = Yup.object().shape({
        initiator: Yup.string().required("Employee is required"),

        evaluation: Yup.array().of(
            Yup.object().shape({
                program: Yup.string().required(),
                fromDate: Yup.date().nullable().required(),
                toDate: Yup.date().nullable().required(),
                impact: Yup.string().required("Impact is required")
            })
        )
    });

    const handleEmployeeChange = (selected, setFieldValue) => {

        const empId = selected?.value || "";
        setFieldValue("initiator", empId);

        if (!empId) {
            setFieldValue("evaluation", []);
            return;
        }

        const existingProgramIds = (evaluationList || [])
            .filter(emp => emp?.initiator === empId)
            .flatMap(emp => emp?.evaluation || [])
            .map(ev => ev?.programId);

        const matchedPrograms = (requisitionList || [])
            .filter(r => r?.initiatingOfficer === empId)
            .filter(r => !existingProgramIds.includes(r?.programId))
            .map(r => ({
                requisitionId: r?.requisitionId,
                programId: r?.programId,
                program: r?.programName,
                fromDate: r?.fromDate,
                toDate: r?.toDate,
                impact: ""
            }));

        setFieldValue("evaluation", matchedPrograms);
    };


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
                    timer: 2000,
                });
                resetForm();
                setShowModal(false);
                fetchEvaluations();
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        } finally {
            setSubmitting(false);
        }
    };

    const employeeOptions = employeeList.map(data => ({
        value: data?.empId,
        label: ((data.title || "") + ' ' + data.empName + ", " + (data.empDesigName || "")).trim(),
    }));

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

    const filteredList = evaluationList.filter((emp) => {
        const search = searchText.toLowerCase();

        const empMatch =
            emp.empName?.toLowerCase().includes(search) ||
            emp.designation?.toLowerCase().includes(search) ||
            emp.title?.toLowerCase().includes(search);

        const programMatch = emp.evaluation?.some((prog) =>
            prog.program?.toLowerCase().includes(search)
        );

        const impactMatch = emp.evaluation?.some((prog) =>
            getImpactLabel(prog.impact)?.toLowerCase().includes(search)
        );

        return empMatch || programMatch || impactMatch;
    });

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);

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

            const empData = employeeList?.find((e) => e.empId === Number(empId));
            if (!empData) {
                Swal.fire("Error", "Employee details not found.", "error");
                return;
            }

            const empName = (empData?.title ?? empData?.salutation ?? "") +
                " " + (empData?.empName ?? "") + ", " + (empData?.empDesigName ?? "");
            await EvaluationPrint(response.data, empName);
        } catch (error) {
            console.error("Print Error:", error);
            Swal.fire("Error", "Something went wrong while generating the PDF.", "error");
        }
    };

    const getPageNumbers = () => {
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

                <div className="row mb-3">
                    <div className="col-md-6 col-lg-4 custom-modal-body">
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
                        <button className="add" onClick={handleAdd}>
                            CREATE NEW
                        </button>
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
                                                    {prog.program}
                                                </div>
                                                <div className="program-date">
                                                    {format(new Date(prog.fromDate), "dd-MM-yyyy")} <FaArrowRight className="mb-1" /> {format(new Date(prog.toDate), "dd-MM-yyyy")}
                                                </div>
                                            </div>
                                            <div className={`impact-badge impact-${prog.impact}`}>
                                                {getImpactLabel(prog.impact)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
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
                                    <h5 className="modal-title"><span className="cs-head-text">Create Evaluation</span></h5>
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
                                                            Select Employee
                                                        </label>
                                                    </div>
                                                    <div className="col-md-5">
                                                        <Select
                                                            className="cs-select"
                                                            options={employeeOptions}
                                                            value={employeeOptions.find(o => o.value === values.initiator)}
                                                            onChange={(o) => handleEmployeeChange(o, setFieldValue)}
                                                        />
                                                        <ErrorMessage name="initiator" component="div" className="invalid-msg" />
                                                    </div>
                                                </div>

                                                {values.evaluation.length > 0 ? (
                                                    <div className="card shadow-sm border-0 mt-3">
                                                        <div className="card-header cs-card-header">
                                                            Training Details
                                                        </div>

                                                        <div className="card-body">

                                                            {values.evaluation.map((item, index) => (
                                                                <div key={index} className="row mb-2 p-1 align-items-end">

                                                                    <div className="col-md-5">
                                                                        <label className="form-label">Program</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            value={item.program}
                                                                            disabled
                                                                        />
                                                                    </div>

                                                                    <div className="col-md-2">
                                                                        <label className="form-label">From</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            value={format(new Date(item.fromDate), "dd-MM-yyyy")}
                                                                            disabled
                                                                        />
                                                                    </div>

                                                                    <div className="col-md-2">
                                                                        <label className="form-label">To</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            value={format(new Date(item.toDate), "dd-MM-yyyy")}
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
                                                                            value={impactOptions.find(o => o.value === item.impact) || null}
                                                                            onChange={(selectedOption) =>
                                                                                setFieldValue(
                                                                                    `evaluation.${index}.impact`,
                                                                                    selectedOption?.value || ""
                                                                                )
                                                                            }
                                                                            name={`evaluation.${index}.impact`}
                                                                            placeholder="Select Impact"
                                                                            isClearable
                                                                        />

                                                                        <ErrorMessage
                                                                            name={`evaluation.${index}.impact`}
                                                                            component="div"
                                                                            className="invalid-msg"
                                                                        />
                                                                    </div>

                                                                </div>
                                                            ))}

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