import { useEffect, useRef, useState } from "react";
import { addEligible, addOrganizer, addProgram, editProgram, getAgencies, getCourseTypeList, getEligibilities } from "../../service/training.service";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { ErrorMessage, Field, Form, Formik } from "formik";
import DatePicker from "react-datepicker";
import * as Yup from "yup";
import Select from "react-select";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { handleApiError } from "../../service/master.service";


const CourseModal = ({ showProgramModal, setShowProgramModal, editData, setEditData,
    selectedOrgId, selectedYear, fetchCourseData, setCourseData, fetchPrograms }) => {


    const [eligibilityList, setEligibilityList] = useState([]);
    const [agencyList, setAgencyList] = useState([]);
    const formikRef = useRef(null);
    const [showAddEligibility, setShowAddEligibility] = useState(false);
    const [showAddOrganizer, setShowAddOrganizer] = useState(false);
    const [eligibilityInput, setEligibilityInput] = useState("");
    const [eligibilityError, setEligibilityError] = useState("");
    const [courseTypeList, setCourseTypeList] = useState([]);

    // ---- Organizer "Add New" inline form state ----
    const initialOrganizerForm = {
        organizer: "",
        contactName: "",
        phoneNo: "",
        faxNo: "",
        email: ""
    };
    const [organizerForm, setOrganizerForm] = useState(initialOrganizerForm);
    const [organizerErrors, setOrganizerErrors] = useState({});

    const programFeilds = {
        courseCode: "",
        courseTypeId: "",
        courseLevel: "",
        courseId: "",
        courseName: "",
        organizerId: selectedOrgId || "",
        eligibilityId: null,
        fromDate: null,
        toDate: null,
        offlineRegistrationFee: 0,
        onlineRegistrationFee: null,
        noOfNomination: 0,
        venue: "",
        isFree: "Y"
    };

    const [initialValues, setInitialValues] = useState(programFeilds);

    useEffect(() => {
        fetchAgencies();
        fetchEligibility();
        fetchCourseType();
    }, []);


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

    const fetchCourseType = async () => {
        try {
            const response = await getCourseTypeList();
            setCourseTypeList(response?.data || []);
        } catch (error) {
            console.error("Error fetching course type:", error);
            Swal.fire("Error", "Failed to fetch course type data. Please try again later.", "error");
        }
    };

    const programSchema = Yup.object().shape({
        courseName: Yup.string().trim().required("Course Name is required")
            .max(250, "Course Name cannot exceed 250 characters"),
        courseCode: Yup.string().trim().notRequired(),
        courseTypeId: Yup.string().required("Course Type is required"),
        courseLevel: Yup.string().required("Course Preference is required"),
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
        noOfNomination: Yup.string()
            .required("No of Nomination is required")
            .min(0, "Nomination cannot be negative"),
        venue: Yup.string().trim().required("Venue is required")
            .max(250, "Venue cannot exceed 250 characters")
    });


    useEffect(() => {
        if (editData && Object.keys(editData).length > 0) {
            setInitialValues({
                courseId: editData?.courseId || "",
                courseCode: editData?.courseCode || "",
                courseTypeId: editData?.courseTypeId || "",
                courseLevel: editData?.courseLevel || "",
                courseName: editData?.courseName || "",
                organizerId: editData?.organizerId || "",
                eligibilityId: editData?.eligibilityId || "",
                fromDate: editData?.fromDate || null,
                toDate: editData?.toDate || null,
                offlineRegistrationFee: editData?.offlineRegistrationFee || 0,
                onlineRegistrationFee: editData?.onlineRegistrationFee || null,
                noOfNomination: editData?.noOfNomination || 0,
                venue: editData?.venue || "",
                isFree: editData?.offlineRegistrationFee === 0 && (editData?.onlineRegistrationFee === 0 || editData?.onlineRegistrationFee === null) ? "Y" : "N",
            });
        }
    }, []);



    const handleProgramSubmit = async (values, { resetForm, setSubmitting }) => {
        try {
            const dto = {
                ...values,
                fromDate: format(new Date(values.fromDate), "yyyy-MM-dd"),
                toDate: format(new Date(values.toDate), "yyyy-MM-dd"),
            }

            const confirm = await AlertConfirmation({ title: "Are you sure to submit!", message: '' });
            if (!confirm) {
                return;
            }
            const response = editData ? await editProgram(dto) : await addProgram(dto);
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
                fetchCourseData?.(selectedOrgId, selectedYear);
                setCourseData?.(response.data);
                fetchPrograms?.();
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
        setEditData?.(null);
        setShowAddEligibility(false);
        setEligibilityInput("");
        setEligibilityError("");
        setShowAddOrganizer(false);
        setOrganizerForm(initialOrganizerForm);
        setOrganizerErrors({});
    }

    const handleChangeEligibility = (selected) => {
        const { setFieldValue } = formikRef.current;

        if (!selected) return;

        if (selected.value === 0) {
            setShowAddEligibility(true);
            setEligibilityInput("");
            setEligibilityError("");
            setFieldValue("eligibilityId", null);
            return;
        }

        setShowAddEligibility(false);
        setFieldValue("eligibilityId", selected.value);
    };

    const validateEligibility = () => {
        if (!eligibilityInput.trim()) {
            setEligibilityError("Eligibility Name is required");
            return false;
        } else if (eligibilityInput.length > 100) {
            setEligibilityError("Eligibility Name cannot exceed 100 characters");
            return false;
        }
        setEligibilityError("");
        return true;
    };

    const handleEligibleSubmit = async () => {
        if (!validateEligibility()) return;
        try {
            const confirm = await AlertConfirmation({ title: "Are you sure to submit!", message: '' });
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

    // ---- Organizer "Add New" inline form helpers ----

    const handleOrganizerFieldChange = (field, value) => {
        setOrganizerForm((prev) => ({ ...prev, [field]: value }));
        if (organizerErrors[field]) {
            setOrganizerErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateOrganizerForm = () => {
        const errors = {};
        const { organizer, contactName, phoneNo, faxNo, email } = organizerForm;

        if (!organizer.trim()) {
            errors.organizer = "Organizer Name is required";
        } else if (organizer.trim().length > 100) {
            errors.organizer = "Organizer Name cannot exceed 100 characters";
        }

        if (!contactName.trim()) {
            errors.contactName = "Contact Name is required";
        } else if (contactName.trim().length > 100) {
            errors.contactName = "Contact Name cannot exceed 100 characters";
        }

        if (!phoneNo.trim()) {
            errors.phoneNo = "Phone Number is required";
        } else if (!/^[0-9]{10}$/.test(phoneNo.trim())) {
            errors.phoneNo = "Enter a valid 10-digit phone number";
        }

        if (!faxNo.trim()) {
            errors.faxNo = "Fax Number is required";
        } else if (!/^[0-9]{5,15}$/.test(faxNo.trim())) {
            errors.faxNo = "Enter a valid fax number (5-15 digits)";
        }

        if (!email.trim()) {
            errors.email = "Email is required";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                errors.email = "Enter a valid email address";
            } else if (email.trim().length > 100) {
                errors.email = "Email cannot exceed 100 characters";
            }
        }

        setOrganizerErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetOrganizerForm = () => {
        setShowAddOrganizer(false);
        setOrganizerForm(initialOrganizerForm);
        setOrganizerErrors({});
    };

    const handleOrganizerSubmit = async () => {
        if (!validateOrganizerForm()) return;
        try {
            const confirm = await AlertConfirmation({ title: "Are you sure to submit!", message: '' });
            if (!confirm) return;

            const dto = {
                organizer: organizerForm.organizer.trim(),
                contactName: organizerForm.contactName.trim(),
                phoneNo: organizerForm.phoneNo.trim(),
                faxNo: organizerForm.faxNo.trim(),
                email: organizerForm.email.trim()
            };

            const response = await addOrganizer(dto);
            if (response && response.success) {
                const newItem = response.data;
                fetchAgencies();
                formikRef.current.setFieldValue("organizerId", newItem.organizerId);
                resetOrganizerForm();
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };

    const handleChangeOrganizer = (selected) => {
        const { setFieldValue } = formikRef.current;

        if (!selected) return;

        if (selected.value === 0) {
            setShowAddOrganizer(true);
            setOrganizerForm(initialOrganizerForm);
            setOrganizerErrors({});
            setFieldValue("organizerId", null);
            return;
        }

        setShowAddOrganizer(false);
        setFieldValue("organizerId", selected.value);
    };

    const eligibilityOptions = [
        { value: 0, label: "Add New" },
        ...eligibilityList.map((item) => ({
            value: item.eligibilityId,
            label: item.eligibilityName
        }))
    ];

    const courseTypeOptions = courseTypeList.map(data => ({
        value: data?.courseTypeId,
        label: data?.courseType
    }));

    const courseLevelOptions = [
        { value: "National", label: "National" },
        { value: "International", label: "International" },
    ];

    const agencyOptions = [
        { value: 0, label: "Add New" },
        ...agencyList.map((item) => ({
            value: item.organizerId,
            label: item.organizer
        }))
    ];

    return (
        <div>
            {showProgramModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={handleClose}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">

                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">{editData ? 'Edit Course' : 'Add New Course'}</h5>
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

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Course Type</label>
                                                        <span className="text-danger">*</span>
                                                        <Select
                                                            className="cs-select"
                                                            options={courseTypeOptions}
                                                            value={courseTypeOptions.find(o => o.value === values.courseTypeId)}
                                                            onChange={o => setFieldValue("courseTypeId", o?.value || "")}
                                                        />
                                                        <ErrorMessage name="courseTypeId" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">Course Preference</label>
                                                        <span className="text-danger">*</span>
                                                        <Select
                                                            className="cs-select"
                                                            options={courseLevelOptions}
                                                            value={courseLevelOptions.find(o => o.value === values.courseLevel)}
                                                            onChange={o => setFieldValue("courseLevel", o?.value || "")}
                                                        />
                                                        <ErrorMessage name="courseLevel" component="div" className="invalid-msg" />
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
                                                            value={
                                                                values.organizerId
                                                                    ? agencyOptions.find((item) => item.value === Number(values.organizerId))
                                                                    : null
                                                            }
                                                            onChange={(selected) => handleChangeOrganizer(selected)}
                                                            placeholder="Select Organizer"
                                                            isSearchable
                                                        />
                                                        <ErrorMessage name="organizerId" component="div" className="invalid-msg" />
                                                    </div>

                                                    {showAddOrganizer && (
                                                        <div className="col-md-12 mb-3">
                                                            <div className="p-3 cs-bg-blue">

                                                                <label className="form-label mb-3 d-block text-center text-danger text-decoration-underline">
                                                                    Add New Organizer
                                                                </label>

                                                                <div className="row">
                                                                    <div className="col-md-6 mb-3">
                                                                        <label className="form-label">
                                                                            Organizer Name <span className="text-danger">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            placeholder="Enter Organizer Name"
                                                                            value={organizerForm.organizer}
                                                                            onChange={(e) =>
                                                                                handleOrganizerFieldChange("organizer", e.target.value)
                                                                            }
                                                                        />
                                                                        {organizerErrors.organizer && (
                                                                            <div className="invalid-msg">{organizerErrors.organizer}</div>
                                                                        )}
                                                                    </div>

                                                                    <div className="col-md-6 mb-3">
                                                                        <label className="form-label">
                                                                            Contact Name <span className="text-danger">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            placeholder="Enter Contact Name"
                                                                            value={organizerForm.contactName}
                                                                            onChange={(e) =>
                                                                                handleOrganizerFieldChange("contactName", e.target.value)
                                                                            }
                                                                        />
                                                                        {organizerErrors.contactName && (
                                                                            <div className="invalid-msg">{organizerErrors.contactName}</div>
                                                                        )}
                                                                    </div>

                                                                    <div className="col-md-4 mb-3">
                                                                        <label className="form-label">
                                                                            Phone No <span className="text-danger">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            placeholder="Enter Phone Number"
                                                                            maxLength={10}
                                                                            value={organizerForm.phoneNo}
                                                                            onChange={(e) =>
                                                                                handleOrganizerFieldChange(
                                                                                    "phoneNo",
                                                                                    e.target.value.replace(/[^0-9]/g, "")
                                                                                )
                                                                            }
                                                                        />
                                                                        {organizerErrors.phoneNo && (
                                                                            <div className="invalid-msg">{organizerErrors.phoneNo}</div>
                                                                        )}
                                                                    </div>

                                                                    <div className="col-md-4 mb-3">
                                                                        <label className="form-label">
                                                                            Fax No <span className="text-danger">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            placeholder="Enter Fax Number"
                                                                            maxLength={15}
                                                                            value={organizerForm.faxNo}
                                                                            onChange={(e) =>
                                                                                handleOrganizerFieldChange(
                                                                                    "faxNo",
                                                                                    e.target.value.replace(/[^0-9]/g, "")
                                                                                )
                                                                            }
                                                                        />
                                                                        {organizerErrors.faxNo && (
                                                                            <div className="invalid-msg">{organizerErrors.faxNo}</div>
                                                                        )}
                                                                    </div>

                                                                    <div className="col-md-4 mb-3">
                                                                        <label className="form-label">
                                                                            Email <span className="text-danger">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="email"
                                                                            className="form-control"
                                                                            placeholder="Enter Email"
                                                                            value={organizerForm.email}
                                                                            onChange={(e) =>
                                                                                handleOrganizerFieldChange("email", e.target.value)
                                                                            }
                                                                        />
                                                                        {organizerErrors.email && (
                                                                            <div className="invalid-msg">{organizerErrors.email}</div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="mt-2 d-flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-success"
                                                                        onClick={handleOrganizerSubmit}
                                                                    >
                                                                        SAVE
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-secondary"
                                                                        onClick={resetOrganizerForm}
                                                                    >
                                                                        CANCEL
                                                                    </button>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    )}


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


                                                    {showAddEligibility && (
                                                        <div className="col-md-12 mb-3">
                                                            <div className="p-3 cs-bg-blue">

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

                                                    <div className="col-md-6 mt-4">
                                                        <span className="form-label me-3">
                                                            Is this course free?
                                                        </span>

                                                        <div className="btn-group bg-light rounded-pill border ms-4" role="group">
                                                            <button
                                                                type="button"
                                                                className={`btn rounded-pill px-4 py-2 transition-all ${values.isFree === "Y" ? "btn-success shadow-sm" : "btn-light text-muted"
                                                                    }`}
                                                                onClick={() => {
                                                                    setFieldValue("isFree", "Y");
                                                                    setFieldValue("offlineRegistrationFee", 0);
                                                                    setFieldValue("onlineRegistrationFee", null);
                                                                }}
                                                            >
                                                                Yes
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className={`btn rounded-pill px-4 py-2 transition-all ${values.isFree === "N" ? "btn-danger shadow-sm" : "btn-light text-muted"
                                                                    }`}
                                                                onClick={() => setFieldValue("isFree", "N")}
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {values.isFree === "N" &&
                                                        <>
                                                            <div className="col-md-3 mb-3">
                                                                <label className="form-label">Offline Fee (₹)
                                                                    <span className="text-danger">*</span>
                                                                </label>
                                                                <Field className="form-control" name="offlineRegistrationFee" type="number" />
                                                                <ErrorMessage name="offlineRegistrationFee" component="div" className="invalid-msg" />
                                                            </div>

                                                            <div className="col-md-3 mb-3">
                                                                <label className="form-label">Online Fee (₹)</label>
                                                                <Field className="form-control" name="onlineRegistrationFee" type="number" />
                                                                <ErrorMessage name="onlineRegistrationFee" component="div" className="invalid-msg" />
                                                            </div>
                                                        </>
                                                    }

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Venue
                                                            <span className="text-danger">*</span>
                                                        </label>
                                                        <Field
                                                            name="venue"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="venue" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">No. of Nomination</label>
                                                        <Field className="form-control" name="noOfNomination" type="number" />
                                                        <ErrorMessage name="noOfNomination" component="div" className="invalid-msg" />
                                                    </div>

                                                </div>

                                                <div className="text-center mt-2 mb-4">
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
    );

};


export default CourseModal;