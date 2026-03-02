import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { addOrganizer, editOrganizer, getAgencies } from "../../service/training.service";
import Swal from "sweetalert2";
import { Tooltip } from "react-tooltip";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { handleApiError } from "../../service/master.service";
import { FaEdit } from "react-icons/fa";


const OrganizerList = () => {

    const [organizerList, setOrganizerList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const organizerFeilds = {
        organizerId: "",
        organizer: "",
        contactName: "",
        phoneNo: null,
        faxNo: null,
        email: null,
    };

    const [initialValues, setInitialValues] = useState(organizerFeilds);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const agencyResponse = await getAgencies();
            setOrganizerList(agencyResponse?.data || []);
        } catch (error) {
            console.error("Error fetching organizers:", error);
            Swal.fire("Error", "Failed to fetch organizers data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-center' },
        { name: "Contact Name", selector: (row) => row.contactName, sortable: true, align: 'text-center' },
        { name: "Phone", selector: (row) => row.phoneNo, sortable: true, align: 'text-center' },
        { name: "Fax No", selector: (row) => row.faxNo, sortable: true, align: 'text-center' },
        { name: "Email", selector: (row) => row.email, sortable: true, align: 'text-center' },
        { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {
        return organizerList.map((item, index) => ({
            sn: index + 1,
            organizer: item.organizer || "-",
            contactName: item.contactName || "-",
            phoneNo: item.phoneNo || "-",
            faxNo: item.faxNo || "-",
            email: item.email || "-",
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
            organizerId: item?.organizerId || "",
            organizer: item?.organizer || "",
            contactName: item?.contactName || "",
            phoneNo: item?.phoneNo || null,
            faxNo: item?.faxNo || null,
            email: item?.email || null,
        });
        setShowModal(true);

    }

    const schema = Yup.object().shape({
        organizer: Yup.string().trim().required("Organizer is required"),
        contactName: Yup.string().required("contact Name is required"),
        phoneNo: Yup.string()
            .trim()
            .required("Phone No is required")
            .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
        faxNo: Yup.string().trim().required("Fax No is required"),
        email: Yup.string().trim().required("Email is required"),
    });


    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        try {

            console.log("values", values);
            const dto = {
                contactName:values.contactName?.trim(),
                email:values.email?.trim(),
                faxNo:values.faxNo?.trim(),
                organizer:values.organizer?.trim(),
                phoneNo:values.phoneNo?.trim(),

            }

            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) {
                return;
            }
            const response = editMode ? await editOrganizer(values) : await addOrganizer(values);
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
        setShowModal(false);
        setInitialValues(organizerFeilds);
        setEditMode(false);
    }



    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Organizer List
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
                    onClick={() => setShowModal(true)}>
                    ADD NEW
                </button>
            </div>
            {showModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={handleClose}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">

                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">{editMode ? 'Edit Organizer' : 'Add New Organizer'}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleClose}
                                    ></button>
                                </div>

                                <div className="modal-body custom-modal-body">

                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={schema}
                                        onSubmit={handleSubmit}
                                    >
                                        {({ setFieldValue, values }) => (
                                            <Form autoComplete="off">

                                                <div className="row text-start">

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Organizer Name</label>
                                                        <Field
                                                            name="organizer"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="organizer" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Contact Name</label>
                                                        <Field
                                                            name="contactName"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="contactName" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label">Phone</label>
                                                        <Field
                                                            name="phoneNo"
                                                            type="tel"
                                                            maxLength={10}
                                                            className="form-control"
                                                            onInput={(e) => {
                                                                e.target.value = e.target.value.replace(/\D/g, "");
                                                            }}
                                                        />
                                                        <ErrorMessage name="phoneNo" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label">Fax No</label>
                                                        <Field
                                                            name="faxNo"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="faxNo" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Email</label>
                                                        <Field
                                                            name="email"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="email" component="div" className="invalid-msg" />
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

export default OrganizerList;