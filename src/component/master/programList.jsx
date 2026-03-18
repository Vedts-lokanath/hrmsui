import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { addEligible, addProgram, editProgram, getAgencies, getCourseList, getEligibilities } from "../../service/training.service";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";
import { ErrorMessage, Field, Form, Formik } from "formik";
import DatePicker from "react-datepicker";
import * as Yup from "yup";
import Select from "react-select";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { handleApiError } from "../../service/master.service";
import { FaEdit } from "react-icons/fa";
import { useRef } from "react";
import { usePermission } from "../../common/usePermission";
import { useLocation, useNavigate } from "react-router-dom";


const ProgramList = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Course");

    const navigate = useNavigate();
    const location = useLocation();
    const stateOrgId = location?.state;

    const [filterOrganizeList, setFilterOrganizeList] = useState([]);
    const [eligibilityList, setEligibilityList] = useState([]);
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [agencyList, setAgencyList] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const formikRef = useRef(null);
    const [selectedOrgId, setSelectedOrgId] = useState(stateOrgId ?? 0);
    const [showAddEligibility, setShowAddEligibility] = useState(false);
    const [eligibilityInput, setEligibilityInput] = useState("");
    const [eligibilityError, setEligibilityError] = useState("");

    const programFeilds = {
        courseCode: "",
        courseId: "",
        courseName: "",
        organizerId: "",
        eligibilityId: null,
        fromDate: null,
        toDate: null,
        offlineRegistrationFee: 0,
        onlineRegistrationFee: null,
        venue: "",
    };

    const [initialValues, setInitialValues] = useState(programFeilds);

    useEffect(() => {
        fetchAgencies();
        fetchEligibility();
    }, []);

    useEffect(() => {

        if (stateOrgId) {
            setSelectedOrgId(stateOrgId);
            navigate(location.pathname, { replace: true, state: null });
        }

    }, []);

    useEffect(() => {
        if (selectedOrgId !== null && selectedOrgId !== undefined) {
            fetchCourseData(selectedOrgId);
            setInitialValues((prev) => ({
                ...prev,
                organizerId: selectedOrgId || ""
            }));
        }
    }, [selectedOrgId]);

    const fetchCourseData = async (orgId) => {
        try {
            const response = await getCourseList(orgId);
            setFilterOrganizeList(response?.data || []);
        } catch (error) {
            console.error("Error fetching programs:", error);
            Swal.fire("Error", "Failed to fetch programs data. Please try again later.", "error");
        }
    };

    const fetchAgencies = async () => {
        try {
            const response = await getAgencies();
            setAgencyList(response?.data || []);
        } catch (error) {
            console.error("Error fetching agencies:", error);
            Swal.fire("Error", "Failed to fetch agency data. Please try again later.", "error");
        }
    };

    const fetchEligibility = async () => {
        try {
            const response = await getEligibilities();
            setEligibilityList(response?.data || []);
        } catch (error) {
            console.error("Error fetching eligibility:", error);
            Swal.fire("Error", "Failed to fetch eligibility data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Course Code", selector: (row) => row.courseCode, sortable: true, align: 'text-center' },
        { name: "Course Name", selector: (row) => row.courseName, sortable: true, align: 'text-left' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-left' },
        { name: "Venue", selector: (row) => row.venue, sortable: true, align: 'text-left' },
        { name: "Eligibility", selector: (row) => row.eligibility, sortable: true, align: 'text-left' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Offline Fee (₹)", selector: (row) => row.offlineRegistrationFee, sortable: true, align: 'text-center' },
        { name: "Online Fee (₹)", selector: (row) => row.onlineRegistrationFee, sortable: true, align: 'text-center' },
        ...(canEdit ? [{ name: "Action", selector: (row) => row.action, sortable: false, align: "text-center", }] : [])
    ];

    const mappedData = () => {
        return filterOrganizeList.map((item, index) => ({
            sn: index + 1,
            courseCode: item.courseCode || "NA",
            courseName: item.courseName || "-",
            organizer: item.organizer || "-",
            venue: item.venue || "-",
            eligibility: item.eligibilityName || "-",
            fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
            toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
            offlineRegistrationFee: item.offlineRegistrationFee || "-",
            onlineRegistrationFee: item.onlineRegistrationFee || "-",
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(item)}
                        data-tooltip-id="Tooltip"
                        data-tooltip-content="Edit"
                        data-tooltip-place="top"
                    >
                        <FaEdit className="fs-6" />
                    </button>
                </>
            )
        }));
    };

    const handleEdit = (item) => {
        setEditMode(true);
        setInitialValues({
            courseId: item?.courseId || "",
            courseCode: item?.courseCode || "",
            courseName: item?.courseName || "",
            organizerId: item?.organizerId || "",
            eligibilityId: item?.eligibilityId || "",
            fromDate: item?.fromDate || null,
            toDate: item?.toDate || null,
            offlineRegistrationFee: item?.offlineRegistrationFee || 0,
            onlineRegistrationFee: item?.onlineRegistrationFee || null,
            venue: item?.venue || "",
        });
        setShowProgramModal(true);

    }

    const programSchema = Yup.object().shape({
        courseName: Yup.string().trim().required("Course Name is required"),
        courseCode: Yup.string().trim().notRequired(),
        organizerId: Yup.string().required("Organized By is required"),
        eligibilityId: Yup.string().required("Eligibility is required"),
        fromDate: Yup.date().required("From Date is required"),
        toDate: Yup.date()
            .required("To Date is required")
            .min(Yup.ref("fromDate"), "To Date must be after From Date"),
        offlineRegistrationFee: Yup.number()
            .typeError("Amount must be a number")
            .transform((value, originalValue) =>
                originalValue === "" ? undefined : value
            )
            .required("Offline Fee is required")
            .min(0, "Amount cannot be negative"),
        onlineRegistrationFee: Yup.number()
            .typeError("Amount must be a number")
            .min(0, "Amount cannot be negative")
            .nullable()
            .transform((value, originalValue) => originalValue === "" ? null : value),
        venue: Yup.string().trim().required("Venue is required"),
    });

    const eligibilityOptions = [
        { value: 0, label: "Add New" },
        ...eligibilityList.map((item) => ({
            value: item.eligibilityId,
            label: item.eligibilityName
        }))
    ];

    const organizerOptions = [
        { value: 0, label: "All" },
        ...agencyList.map((data) => ({
            value: data?.organizerId,
            label: data?.organizer
        }))
    ];

    const agencyOptions = organizerOptions.slice(1);

    const handleChangeOrganizer = (orgId) => {
        setSelectedOrgId(orgId);
    };


    const handleProgramSubmit = async (values, { resetForm, setSubmitting }) => {
        try {
            const dto = {
                ...values,
                fromDate: format(new Date(values.fromDate), "yyyy-MM-dd"),
                toDate: format(new Date(values.toDate), "yyyy-MM-dd"),
            }

            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) {
                return;
            }
            const response = editMode ? await editProgram(dto) : await addProgram(dto);
            if (response && response.success) {
                Swal.fire({
                    title: "Success",
                    text: response.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                });
                handleClose();
                resetForm();
                fetchCourseData(selectedOrgId);
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setShowProgramModal(false);
        setInitialValues(programFeilds);
        setEditMode(false);
        setShowAddEligibility(false);
        setEligibilityInput("");
        setEligibilityError("");
    }

    const handleChangeEligibility = (selected) => {
        const { setFieldValue } = formikRef.current;

        if (!selected) return;

        if (selected.value === 0) {
            setShowAddEligibility(true);
            setEligibilityInput("");
            setEligibilityError("");
            return;
        }

        setShowAddEligibility(false);
        setFieldValue("eligibilityId", selected.value);
    };

    const validateEligibility = () => {
        if (!eligibilityInput.trim()) {
            setEligibilityError("Eligibility Name is required");
            return false;
        }
        setEligibilityError("");
        return true;
    };

    const handleEligibleSubmit = async () => {
        if (!validateEligibility()) return;
        try {
            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) return;

            const response = await addEligible({ eligibilityName: eligibilityInput });
            if (response && response.success) {
                const newItem = response.data;
                fetchEligibility();
                formikRef.current.setFieldValue("eligibilityId", newItem.eligibilityId);
                setShowAddEligibility(false);
                setEligibilityInput("");    
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };


    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Course List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="d-flex justify-content-end align-items-center flex-wrap">
                <div className="d-flex align-items-center me-3 mb-2">
                    <label className="font-label fw-bold me-3 mb-0">Organizer :</label>
                    <div style={{ width: '400px' }} className="text-start">
                        <Select
                            options={organizerOptions}
                            value={organizerOptions.find((item) => item.value === selectedOrgId) || null}
                            onChange={(selectedOption) => {
                                const selectedValue = selectedOption ? selectedOption.value : 0; // default to 0
                                handleChangeOrganizer(selectedValue);
                            }}
                            placeholder="Select Organizer"
                            isSearchable
                        />
                    </div>
                </div>
            </div>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

            <div>
                {canAdd &&
                    <button
                        className="add"
                        onClick={() => setShowProgramModal(true)}>
                        ADD NEW
                    </button>
                }
            </div>

            {showProgramModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={handleClose}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">

                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">{editMode ? 'Edit Course' : 'Add New Course'}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleClose}
                                    ></button>
                                </div>

                                <div className="modal-body custom-modal-body">

                                    <Formik
                                        innerRef={formikRef}
                                        initialValues={initialValues}
                                        validationSchema={programSchema}
                                        onSubmit={handleProgramSubmit}
                                        enableReinitialize
                                    >
                                        {({ setFieldValue, values }) => (
                                            <Form autoComplete="off">

                                                <div className="row text-start">

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Course Code (Optional)</label>
                                                        <Field
                                                            name="courseCode"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="courseCode" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-8 mb-3">
                                                        <label className="form-label">Course Name
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Field
                                                            name="courseName"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="courseName" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Organized By
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Select
                                                            options={agencyOptions}
                                                            value={agencyOptions.find((item) => item.value === Number(values.organizerId)) || null}
                                                            onChange={(option) => setFieldValue("organizerId", option ? option.value : "")}
                                                            placeholder="Select Organizer"
                                                            isSearchable
                                                        />
                                                        <ErrorMessage name="organizerId" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">From Date
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <DatePicker
                                                            selected={values.fromDate}
                                                            onChange={(date) =>
                                                                setFieldValue("fromDate", date)
                                                            }
                                                            className="form-control"
                                                            dateFormat="dd-MM-yyyy"
                                                            showYearDropdown
                                                            showMonthDropdown
                                                            dropdownMode="select"
                                                            onKeyDown={(event) => event.preventDefault()}
                                                        />
                                                        <ErrorMessage name="fromDate" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">To Date
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <DatePicker
                                                            selected={values.toDate}
                                                            onChange={(date) =>
                                                                setFieldValue("toDate", date)
                                                            }
                                                            className="form-control"
                                                            dateFormat="dd-MM-yyyy"
                                                            minDate={values.fromDate}
                                                            showYearDropdown
                                                            showMonthDropdown
                                                            dropdownMode="select"
                                                            onKeyDown={(event) => event.preventDefault()}
                                                        />
                                                        <ErrorMessage name="toDate" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Eligibility
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Select
                                                            options={eligibilityOptions}
                                                            value={
                                                                values.eligibilityId
                                                                    ? eligibilityOptions.find((item) => item.value === Number(values.eligibilityId))
                                                                    : null
                                                            }
                                                            onChange={(selected) => handleChangeEligibility(selected)}
                                                            placeholder="Select Eligibility"
                                                            isSearchable
                                                        />
                                                        <ErrorMessage name="eligibilityId" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Offline RE Fee (₹)
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Field className="form-control" name="offlineRegistrationFee" type="number" />
                                                        <ErrorMessage name="offlineRegistrationFee" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Online RE Fee (₹)</label>
                                                        <Field className="form-control" name="onlineRegistrationFee" type="number" />
                                                        <ErrorMessage name="onlineRegistrationFee" component="div" className="invalid-msg" />
                                                    </div>

                                                    {showAddEligibility && (
                                                        <div className="col-md-12 mb-3">
                                                            <div className="border rounded p-3 bg-light">

                                                                <label className="form-label">
                                                                    Add New Eligibility <span className="text-danger">*</span>
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Enter Eligibility Name"
                                                                    value={eligibilityInput}
                                                                    onChange={(e) => {
                                                                        setEligibilityInput(e.target.value);
                                                                        if (eligibilityError) setEligibilityError("");
                                                                    }}
                                                                />

                                                                {eligibilityError && (
                                                                    <div className="invalid-msg">{eligibilityError}</div>
                                                                )}

                                                                <div className="mt-2 d-flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-success"
                                                                        onClick={handleEligibleSubmit}
                                                                    >
                                                                        SAVE
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-secondary"
                                                                        onClick={() => setShowAddEligibility(false)}
                                                                    >
                                                                        CANCEL
                                                                    </button>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="col-md-8 mb-3">
                                                        <label className="form-label">Venue
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Field
                                                            name="venue"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="venue" component="div" className="invalid-msg" />
                                                    </div>

                                                </div>

                                                <div className="text-center mt-2 mb-4">
                                                    <button type="submit"
                                                        className={editMode ? `update` : `submit`}
                                                    >
                                                        {editMode ? `update` : `submit`}
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
    );
}

export default ProgramList;