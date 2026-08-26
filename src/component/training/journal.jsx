import { useEffect, useState } from "react";
import { usePermission } from "../../common/usePermission";
import Datatable from "../../datatable/Datatable";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { getEmployees, handleApiError } from "../../service/master.service";
import Select from "react-select";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { addJournalData, editJournalData, getJournalList } from "../../service/training.service";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { FaEdit } from "react-icons/fa";



const Journal = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Journal");

    const [journalList, setJournalList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [employeeList, setEmployeeList] = useState([]);
    const roleName = localStorage.getItem("roleName");
    const empId = localStorage.getItem("empId");


    useEffect(() => {
        fetchEmployees();
        fetchJournals();
    }, []);


    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(empId, roleName);
            setEmployeeList(response?.data || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };


    const fetchJournals = async () => {
        try {
            const response = await getJournalList(empId, roleName);
            setJournalList(response?.data || []);
        } catch (error) {
            console.error("Error fetching journals:", error);
        }
    };


    const [initialValues, setInitialValues] = useState({
        journalId: null,
        empId: empId || "",
        titleOfPaper: "",
        journalType: "",
        journalName: "",
        volume: "",
        impactFactor: "",
        publicationFee: "",
    });

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Employee Name", selector: (row) => row.empName, sortable: true, align: 'text-start' },
        { name: "Title of Paper", selector: (row) => row.titleOfPaper, sortable: true, align: 'text-start' },
        { name: "Journal Type", selector: (row) => row.journalType, sortable: true, align: 'text-center' },
        { name: "Journal", selector: (row) => row.journalName, sortable: true, align: 'text-start' },
        { name: "Volume", selector: (row) => row.volume, sortable: true, align: 'text-center' },
        { name: "Impact Factor of Journal", selector: (row) => row.impactFactor, sortable: true, align: 'text-center' },
        { name: "Publication Fee (Rs.)", selector: (row) => row.publicationFee, sortable: true, align: 'text-right' },
        ...(canEdit ? [{ name: "Action", selector: (row) => row.action, sortable: false, align: "text-center", }] : [])
    ];

    const mappedData = () => {
        return journalList.map((item, index) => ({
            sn: index + 1,
            empName: item.employeeName || "-",
            titleOfPaper: item.titleOfPaper || "-",
            journalType: item.journalType === "N" ? "National" : "International",
            journalName: item.journalName || "-",
            volume: item.volume || "-",
            impactFactor: item.impactFactor || "-",
            publicationFee: item.publicationFee || "-",
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    <button
                        className="btn btn-sm btn-warning me-2"
                        data-tooltip-id="Tooltip"
                        data-tooltip-content="Edit"
                        data-tooltip-place="top"
                        onClick={() => handleEdit(item)}
                    >
                        <FaEdit className="fs-6" />
                    </button>
                </>
            )
        }));
    };

    const handleEdit = (data) => {

        setEditData(data);

        setInitialValues({
            journalId: data?.journalId || null,
            empId: data?.empId || "",
            titleOfPaper: data?.titleOfPaper || "",
            journalType: data?.journalType || "",
            journalName: data?.journalName || "",
            volume: data?.volume || "",
            impactFactor: data?.impactFactor || "",
            publicationFee: data?.publicationFee || "",
        });

        setShowModal(true);
    };

    const validationSchema = Yup.object().shape({
        empId: Yup.number()
            .typeError("Employee is required")
            .required("Employee is required"),

        titleOfPaper: Yup.string()
            .trim()
            .min(3, "Title must be at least 3 characters")
            .max(300, "Title cannot exceed 300 characters")
            .required("Title of Paper is required"),

        journalType: Yup.string()
            .trim()
            .required("Journal Type is required"),

        journalName: Yup.string()
            .trim()
            .min(2, "Journal Name must be at least 2 characters")
            .max(200, "Journal Name cannot exceed 200 characters")
            .required("Journal Name is required"),

        volume: Yup.string()
            .trim()
            .max(50, "Volume cannot exceed 50 characters")
            .required("Volume is required"),

        impactFactor: Yup.number()
            .typeError("Impact Factor must be a valid number")
            .min(0, "Impact Factor cannot be negative")
            .required("Impact Factor is required"),

        publicationFee: Yup.number()
            .typeError("Publication Fee must be a valid amount")
            .min(0, "Publication Fee cannot be negative")
            .required("Publication Fee is required"),
    });

    const handleClose = () => {
        setShowModal(false);
        setEditData(null);
    };

    const handleSubmit = async (values, { resetForm }) => {
        try {
            const confirm = await AlertConfirmation({
                title: "Are you sure to submit!",
                message: "",
            });

            if (!confirm) return;

            const response = editData ? await editJournalData(values) : await addJournalData(values);

            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                resetForm();
                setShowModal(false);
                fetchJournals();
            } else {
                Swal.fire("Warning", response?.message || "Something went wrong", "warning");
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire("Warning", handleApiError ? handleApiError(error) : "Something went wrong", "warning");
        }
    };

    const handleAdd = () => {
        setShowModal(true);
        setInitialValues({
            journalId: null,
            empId: empId || "",
            titleOfPaper: "",
            journalType: "",
            journalName: "",
            volume: "",
            impactFactor: "",
            publicationFee: "",
        });
    };

    const journalOptions = [
        { value: 'N', label: 'National' },
        { value: 'I', label: 'International' },
    ];

    const employeeOptions = employeeList.map((emp) => ({
        value: emp.empId,
        label: `${emp.empName || ""}${emp.empDesigName ? ", " + emp.empDesigName : ""}`.trim(),
    }));


    return (
        <div>
            <h3 className="fancy-heading mt-3">
                Journal List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

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

            {showModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={handleClose}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">

                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">{editData ? 'Edit Journal' : 'Add New Journal'}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleClose}
                                    ></button>
                                </div>

                                <div className="modal-body custom-modal-body">

                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                        enableReinitialize
                                    >
                                        {({ setFieldValue, values }) => (
                                            <Form autoComplete="off">

                                                <div className="row g-3 text-start">

                                                    <div className="col-md-5">
                                                        <label className="form-label">Employee
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Select
                                                            options={employeeOptions}
                                                            value={employeeOptions.find(
                                                                (option) => option.value === Number(values.empId)
                                                            ) || null}
                                                            onChange={(selectedOption) => {
                                                                setFieldValue("empId", selectedOption?.value || null);
                                                            }}
                                                            placeholder="Select an employee"
                                                            isSearchable
                                                            isClearable
                                                        />
                                                        <ErrorMessage name="empId" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-7">
                                                        <label className="form-label">Title of Paper
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Field
                                                        as="textarea"
                                                            name="titleOfPaper"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="titleOfPaper" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4">
                                                        <label className="form-label">Journal Type
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Select
                                                            options={journalOptions}
                                                            value={journalOptions.find(
                                                                (option) => option.value === values.journalType) || null}
                                                            onChange={(selectedOption) => {
                                                                setFieldValue("journalType", selectedOption?.value || null);
                                                            }}
                                                            placeholder="Select an option"
                                                            isSearchable
                                                            isClearable
                                                        />
                                                        <ErrorMessage name="journalType" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4">
                                                        <label className="form-label">Journal
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Field
                                                            name="journalName"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="journalName" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4">
                                                        <label className="form-label">Volume
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Field
                                                            name="volume"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="volume" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            Impact Factor <span className="text-danger">*</span>
                                                        </label>
                                                        <Field
                                                            type="number"
                                                            step="0.01"
                                                            name="impactFactor"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="impactFactor" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            Publication Fee (In Rs.)<span className="text-danger">*</span>
                                                        </label>
                                                        <Field
                                                            type="number"
                                                            name="publicationFee"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="publicationFee" component="div" className="invalid-msg" />
                                                    </div>

                                                </div>

                                                <div className="text-center mt-4">
                                                    <button type="submit"
                                                        className={editData ? `update` : `submit`}
                                                    >
                                                        {editData ? `update` : `submit`}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="back"
                                                        onClick={handleClose}
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
    )

}

export default Journal;