import { useState } from "react";
import Navbar from "../navbar/Navbar";
import Datatable from "../../datatable/Datatable";
import Select from "react-select";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { addCalenderData, calendarFileDownload, getAgencies, getCalenderList, updateCalendar } from "../../service/training.service";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { handleApiError } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { format } from "date-fns";
import { FaDownload } from "react-icons/fa6";
import { Tooltip } from "react-tooltip";
import { usePermission } from "../../common/usePermission";
import { FaEdit } from "react-icons/fa";

const Calendar = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Calendar");

    const [calendarList, setCalendarList] = useState([]);
    const [agencyList, setAgencyList] = useState([]);
    const [showMoal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const currentYear = new Date().getFullYear();
    const range = 20;
    const pageSize = 4;

    const years = Array.from(
        { length: range * 2 + 1 },
        (_, i) => currentYear - range + i
    );

    const [selectedYear, setSelectedYear] = useState(currentYear);

    const currentIndex = years.indexOf(currentYear);
    const [startIndex, setStartIndex] = useState(
        Math.max(0, currentIndex - Math.floor(pageSize / 2))
    );
    const visibleYears = years.slice(startIndex, startIndex + pageSize);

    const handleNext = () => {
        if (startIndex + pageSize < years.length) {
            setStartIndex(startIndex + pageSize);
        }
    };

    const handlePrev = () => {
        if (startIndex - pageSize >= 0) {
            setStartIndex(startIndex - pageSize);
        }
    };

    useEffect(() => {
        if (selectedYear) {
            fetchCalenderList(selectedYear);
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchCalenderList = async (year) => {
        try {
            const response = await getCalenderList(year);
            setCalendarList(response?.data || []);
        } catch (error) {
            console.error("Error fetching calender list:", error);
            Swal.fire("Error", "Failed to fetch calender data. Please try again later.", "error");
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

    const [initialValues, setInitialValues] = useState({
        organizerId: "",
        file: null,
        coverFile: null
    });

   const validationSchema = Yup.object().shape({
    organizerId: Yup.string().required("Organizer is required"),

    file: Yup.mixed().when("isEdit", {
        is: false, 
        then: (schema) =>
            schema
                .required("File is required")
                .test("fileType", "Unsupported File Format", (value) => {
                    if (!value) return false;
                    return ["application/pdf", "image/jpeg", "image/png"].includes(value.type);
                })
                .test("fileSize", "File too large (Max 5MB)", (value) => {
                    if (!value) return false;
                    return value.size <= 5 * 1024 * 1024;
                }),

        otherwise: (schema) =>
            schema
                .nullable()
                .notRequired()
                .test("fileType", "Unsupported File Format", (value) => {
                    if (!value) return true; // allow empty in edit
                    return ["application/pdf", "image/jpeg", "image/png"].includes(value.type);
                })
                .test("fileSize", "File too large (Max 5MB)", (value) => {
                    if (!value) return true;
                    return value.size <= 5 * 1024 * 1024;
                })
    }),

    coverFile: Yup.mixed().notRequired()
});

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Organizer", selector: (row) => row.agency, sortable: true, align: 'text-center' },
        { name: "Uploaded Date", selector: (row) => row.uploadDate, sortable: true, align: 'text-center' },
        { name: "File", selector: (row) => row.file, sortable: true, align: 'text-center' },
        { name: "Action", selector: (row) => row.action, align: 'text-center' },
    ];

    const mappedData = () => {
        return calendarList.map((data, index) => ({
            sn: index + 1,
            agency: data.organizer,
            uploadDate: data.createdDate
                ? format(new Date(data.createdDate), "dd-MM-yyyy hh:mm a")
                : "-",

            file: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />

                    {data.calendarFileName && (
                        <button
                            className="download-btn me-2"
                            onClick={() => handleDownload(data.calendarId, "CF")}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Calendar File"
                            data-tooltip-place="left"
                        >
                            <FaDownload />
                        </button>
                    )}

                    {data.coveringLetter && (
                        <button
                            className="cover-letter-btn"
                            onClick={() => handleDownload(data.calendarId, "CL")}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Covering Letter"
                            data-tooltip-place="right"
                        >
                            <FaDownload />
                        </button>
                    )}

                    {!data.calendarFileName && !data.coveringLetter && "-"}
                </>
            ),


            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    <button
                        className="btn btn-sm btn-warning me-2"
                        data-tooltip-id="Tooltip"
                        data-tooltip-content="Edit"
                        data-tooltip-place="top"
                        onClick={() => handleEdit(data)}
                    >
                        <FaEdit className="fs-6" />
                    </button>
                </>
            )
        }));
    };

    const handleDownload = async (id, type) => {
        let response = await calendarFileDownload(id, type);

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

    const handleAdd = () => {
        setShowModal(true);
        setEditData(null);
    };

    const handleEdit = (item) => {
        setEditData(item);
        setShowModal(true);
    }


    useEffect(() => {
        if (editData != null && Object.keys(editData).length > 0) {
            setInitialValues({
                organizerId: editData.organizerId || "",
                file: null,
                coverFile: null
            });
        }
    }, [editData]);

    const closeModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        try {

            const dto = {
                ...values,
                calendarId: editData?.calendarId || "",
                year: selectedYear,
            }

            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) {
                return;
            }
            const response = editData ? await updateCalendar(dto) : await addCalenderData(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                closeModal();
                resetForm();
                fetchCalenderList(selectedYear);
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        } finally {
            setSubmitting(false);
        }
    };

    const isEdit = editData != null && Object.keys(editData).length > 0;

    const usedAgencyIds = new Set(
        calendarList
            .filter(item => !isEdit || item.calendarId !== editData?.calendarId)
            .map(item => item?.organizerId)
    );

    const agencyOptions = agencyList
        .filter(data => !usedAgencyIds.has(data?.organizerId))
        .map(data => ({
            value: data?.organizerId,
            label: data?.organizer
        }));

    return (
        <div>
            <Navbar />
            <h3 className="fancy-heading mt-3">
                Calendar List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="d-flex justify-content-end">
                <div className="modern-year-picker me-3">

                    <div className="year-header">
                        <span className="year-title">Select Year</span>
                        <span className="year-selected">{selectedYear}</span>
                    </div>

                    <div className="year-body">
                        <button
                            className="nav-btn me-2"
                            onClick={handlePrev}
                            disabled={startIndex === 0}
                        >
                            <FaArrowLeft />
                        </button>

                        <div className="year-list">
                            {visibleYears.map((year) => (
                                <button
                                    key={year}
                                    className={`year-pill ${selectedYear === year ? "active" : ""
                                        }`}
                                    onClick={() => setSelectedYear(year)}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>

                        <button
                            className="nav-btn ms-2"
                            onClick={handleNext}
                            disabled={startIndex + pageSize >= years.length}
                        >
                            <FaArrowRight />
                        </button>
                    </div>

                </div>
            </div>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

            <div>
                {canAdd && <button
                    className="add"
                    onClick={handleAdd}>
                    ADD NEW
                </button>
                }
            </div>

            {showMoal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={closeModal}></div>
                    <div className="modal d-block custom-modal" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">
                                       <span className="cs-head-text">
                                        {isEdit ? "Edit Calendar" : "Add Calendar"}
                                       </span>
                                        </h5>
                                    <button type="button" className="btn-close" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        enableReinitialize
                                        onSubmit={handleSubmit}
                                    >
                                        {({ values, setFieldValue, isSubmitting, isValid }) => (
                                            <Form autoComplete="off">

                                                <div className="row g-3">
                                                    <div className="col-md-4">
                                                        <label className="form-label">Organizer</label>
                                                        <span className="text-danger">*</span>
                                                        <Select
                                                            className="cs-select"
                                                            options={agencyOptions}
                                                            value={agencyOptions.find(o => o.value === values.organizerId)}
                                                            onChange={o => setFieldValue("organizerId", o?.value || "")}
                                                        />
                                                        <ErrorMessage name="organizerId" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4">

                                                        <label className="form-label">Calendar File</label>
                                                        <span className="text-danger">*</span>
                                                        {isEdit && editData?.calendarFileName && (
                                                            <span
                                                                className="file-link"
                                                                style={{ color: "#0c68f1", cursor: "pointer", margin: "10px", gap: "9px", fontSize: "16px" }}
                                                                onClick={() => handleDownload(editData.calendarId, "CF")}
                                                            >
                                                                <FaDownload className="me-1" />
                                                               
                                                            </span>

                                                        )}
                                                        <input name="file" type="file" className="form-control" onChange={e => setFieldValue("file", e.currentTarget.files[0])} />
                                                        <ErrorMessage name="file" component="div" className="invalid-msg" />
                                                    </div>


                                                    <div className="col-md-4">
                                                        <label className="form-label">Covering Letter</label>
                                                        {isEdit && editData?.calendarFileName && (
                                                            <span
                                                                className="file-link"
                                                                style={{ color: "#9d0dfd", cursor: "pointer", margin: "10px", gap: "9px", fontSize: "16px" }}
                                                                onClick={() => handleDownload(editData.calendarId, "CF")}
                                                            >
                                                                <FaDownload className="me-1" />
                                                              
                                                            </span>

                                                        )}
                                                        <input name="coverFile" type="file" className="form-control" onChange={e => setFieldValue("coverFile", e.currentTarget.files[0])} />
                                                        <ErrorMessage name="coverFile" component="div" className="invalid-msg" />
                                                    </div>
                                                </div>

                                                <div className="text-center mt-4">
                                                    <button
                                                        type="submit"
                                                        className={isEdit ? "update" : "submit"}
                                                         disabled={isSubmitting || !isValid}
                                                    >
                                                        {isEdit ? "UPDATE" : "SUBMIT"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="back"
                                                        onClick={closeModal}
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

export default Calendar;