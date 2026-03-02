import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { addProgram, editProgram, getAgencies, getPrograms } from "../../service/training.service";
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


const ProgramList = () => {

    const [programList, setProgramList] = useState([]);
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [agencyList, setAgencyList] = useState([]);
    const [editMode, setEditMode] = useState(false);

    const programFeilds = {
        programId: "",
        programName: "",
        organizerId: "",
        fromDate: null,
        toDate: null,
        registrationFee: null,
        isRegistration: "N",
        venue: "",
    };

    const [initialValues, setInitialValues] = useState(programFeilds);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await getPrograms();
            const agencyResponse = await getAgencies();
            setProgramList(response?.data || []);
            setAgencyList(agencyResponse?.data || []);
        } catch (error) {
            console.error("Error fetching programs:", error);
            Swal.fire("Error", "Failed to fetch programs data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Program", selector: (row) => row.programName, sortable: true, align: 'text-center' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-center' },
        { name: "venue", selector: (row) => row.venue, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Registration Fee", selector: (row) => row.registrationFee, sortable: true, align: 'text-center' },
        { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {
        return programList.map((item, index) => ({
            sn: index + 1,
            programName: item.programName || "-",
            organizer: item.organizer || "-",
            venue: item.venue || "-",
            fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
            toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
            registrationFee: item.registrationFee || "-",
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
            programId: item?.programId || "",
            programName: item?.programName || "",
            organizerId: item?.organizerId || "",
            fromDate: item?.fromDate || null,
            toDate: item?.toDate || null,
            registrationFee: item?.registrationFee || null,
            isRegistration: Number(item?.registrationFee) > 0 ? "Y" : "N",
            venue: item?.venue || "",
        });
        setShowProgramModal(true);

    }

    const programSchema = Yup.object().shape({
        programName: Yup.string().trim().required("Program Name is required"),
        organizerId: Yup.string().required("Organized By is required"),
        fromDate: Yup.date().required("From Date is required"),
        toDate: Yup.date()
            .required("To Date is required")
            .min(Yup.ref("fromDate"), "To Date must be after From Date"),
        isRegistration: Yup.string().required("Please specify if registration fee is applicable"),
        registrationFee: Yup.number().when("isRegistration", {
            is: "Y",
            then: (schema) =>
                schema
                    .typeError("Registration Fee must be a number")
                    .required("Registration Fee is required")
                    .positive("Registration Fee must be positive"),
            otherwise: (schema) => schema.nullable(),
        }),
        venue: Yup.string().trim().required("Venue is required"),
    });

    const agencyOptions = agencyList.map(data => ({
        value: data?.organizerId,
        label: data?.organizer
    }));

    const handleProgramSubmit = async (values, { resetForm, setSubmitting }) => {
        try {
            console.log("valuse", values);
            const dto = {
                ...values,
                registrationFee: values.isRegistration === "Y" ? values.registrationFee : 0,
            }

             console.log("dto", dto);

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
                    timer: 2000,
                });
                handleClose();
                resetForm();
                fetchData();
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
    }



    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Program List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

            <div>
                <button
                    className="add"
                    onClick={() => setShowProgramModal(true)}>
                    ADD NEW
                </button>
            </div>
            {showProgramModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={handleClose}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">

                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">{editMode ? 'Edit Program' : 'Add New Program'}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleClose}
                                    ></button>
                                </div>

                                <div className="modal-body custom-modal-body">

                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={programSchema}
                                        onSubmit={handleProgramSubmit}
                                    >
                                        {({ setFieldValue, values }) => (
                                            <Form autoComplete="off">

                                                <div className="row text-start">

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Program Name</label>
                                                        <Field
                                                            name="programName"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="programName" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Organized By</label>
                                                        <Select
                                                            options={agencyOptions}
                                                            value={agencyOptions.find((item) => item.value === Number(values.organizerId)) || null}
                                                            onChange={(option) => setFieldValue("organizerId", option ? option.value : "")}
                                                            placeholder="Select Organize"
                                                            isSearchable
                                                        />
                                                        <ErrorMessage name="organizerId" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">From Date</label>
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
                                                        <label className="form-label">To Date</label>
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
                                                        <label className="form-label">Registration Fee Applicable</label>
                                                        <Field className="form-control" name="isRegistration" as="select">
                                                            <option value="">Select</option>
                                                            <option value="Y">Yes</option>
                                                            <option value="N">No</option>
                                                        </Field>
                                                        <ErrorMessage name="isRegistration" component="div" className="invalid-msg" />
                                                    </div>

                                                    {values.isRegistration === "Y" && (
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Registration Fee (₹)</label>
                                                            <Field className="form-control" name="registrationFee" type="number" />
                                                            <ErrorMessage name="registrationFee" component="div" className="invalid-msg" />
                                                        </div>
                                                    )}

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Venue</label>
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