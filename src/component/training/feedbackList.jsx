import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import { useNavigate } from "react-router-dom";
import { acceptReqFeedback, feedbackFileDownload, getFeedbackList, getFeedbackListByDateRange, getFeedbackPrint, getLabMasterData } from "../../service/training.service";
import Swal from "sweetalert2";
import { endOfYear, format, startOfYear } from "date-fns";
import { Tooltip } from "react-tooltip";
import FeedbackPrint from "../print/feedbackPrint";
import { FaDownload, FaEye } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { getEmployees, handleApiError } from "../../service/master.service";
import Select from "react-select";
import { MdLibraryAddCheck } from "react-icons/md";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { usePermission } from "../../common/usePermission";
import DatePicker from "react-datepicker";


const FeedbackList = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("FeedBack");

    const fromDate = startOfYear(new Date());
    const toDate = endOfYear(new Date());
    const [fromDateSel, setFromDateSel] = useState(fromDate);
    const [toDateSel, setToDateSel] = useState(toDate);

    const [feedbackList, setFeedbackList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);

    const roleName = localStorage.getItem("roleName");
    const empId = localStorage.getItem("empId");

    const [selectedEmpId, setSelectedEmpId] = useState(
        roleName === "ROLE_USER" ? Number(empId) : 0
    );

    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmpId !== null && selectedEmpId !== undefined && fromDateSel && toDateSel) {
            fetchFeedbackData(selectedEmpId, format(fromDateSel, "yyyy-MM-dd"), format(toDateSel, "yyyy-MM-dd"));
        }
    }, [selectedEmpId, fromDateSel, toDateSel]);

    const fetchFeedbackData = async (employeeId, fromDate, toDate) => {
        let apiEmpId = employeeId;
        let apiRole = roleName;

        if (employeeId > 0 && roleName !== "ROLE_USER") {
            apiRole = "ROLE_USER";
        }

        if (roleName === "ROLE_DH" && employeeId === 0) {
            apiEmpId = empId;
        }

        if (roleName === "ROLE_USER") {
            apiEmpId = empId;
        }

        try {
            const response = await getFeedbackListByDateRange(apiEmpId, apiRole, fromDate, toDate);
            setFeedbackList(response?.data || []);
        } catch (error) {
            console.error("Error fetching feedback list:", error);
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

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Requisition No", selector: (row) => row.requisitionNumber, sortable: true, align: 'text-left' },
        { name: "Feedback Given By", selector: (row) => row.participantName, sortable: true, align: 'text-left' },
        { name: "Course", selector: (row) => row.courseName, sortable: true, align: 'text-left' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-left' },
        { name: "Duration (Day)", selector: (row) => row.programDuration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {
        return feedbackList.map((item, index) => ({
            sn: index + 1,
            requisitionNumber: item.requisitionNumber || "-",
            courseName: item.courseName || "-",
            organizer: item.organizer || "-",
            programDuration: item.programDuration || "-",
            fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
            toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
            participantName: item.participantName || "-",
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    {canEdit &&
                        <>
                            {item.isAccepted === "N" &&
                                <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => handleEdit(item)}
                                    data-tooltip-id="Tooltip"
                                    data-tooltip-content="Edit"
                                    data-tooltip-place="top"
                                >
                                    <FaEdit className="fs-6" />
                                </button>
                            }
                            {["ROLE_ADMIN", "ROLE_AD_HRT", "ROLE_DH", "ROLE_DIRECTOR", "ROLE_SA_HRT"].includes(roleName) &&
                                item.isAccepted === "N" &&
                                <button
                                    className="btn btn-sm btn-success me-2"
                                    onClick={() => handleAccept(item)}
                                    data-tooltip-id="Tooltip"
                                    data-tooltip-content="Accept"
                                    data-tooltip-place="top"
                                >
                                    <MdLibraryAddCheck className="fs-6" />
                                </button>
                            }
                        </>
                    }
                    <button
                        className="print me-2"
                        onClick={() => handlePrint(item)}
                        data-tooltip-id="Tooltip"
                        data-tooltip-content="Print"
                        data-tooltip-place="top"
                    >
                        <FaEye className="fs-6" />
                    </button>
                    {item.certificate &&
                        <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleDownload(item.feedbackId, 'certificate')}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Certificate"
                            data-tooltip-place="top"
                        >
                            <FaDownload className="fs-6" />
                        </button>
                    }
                    {item.invoice &&
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleDownload(item.feedbackId, 'invoice')}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Invoice"
                            data-tooltip-place="top"
                        >
                            <FaDownload className="fs-6" />
                        </button>
                    }
                </>
            )
        }));
    }

    const handleDownload = async (feedId, type) => {

        let response = await feedbackFileDownload(feedId, type);
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


    const handlePrint = async (item) => {
        try {
            if (!item?.feedbackId) {
                Swal.fire("Warning", "Feedback not found for printing.", "warning");
                return;
            }

            const response = await getFeedbackPrint(item.feedbackId);
            if (!response || !response.data) {
                Swal.fire("No Data", "No feedback data available to print.", "info");
                return;
            }

            const labResponse = await getLabMasterData();

            if (!labResponse?.data) {
                Swal.fire("Warning", "Lab details not found.", "warning");
                return;
            }

            await FeedbackPrint(response.data, labResponse.data);

        } catch (error) {
            console.error("Print Error:", error);
            Swal.fire("Error", "Something went wrong while generating the PDF.", "error");
        }
    };

    const handleEdit = (item) => {
        navigate("/feedback-add", { state: item });
    };

    const handleAccept = async (item) => {
        try {
            const dto = {
                feedbackId: item.feedbackId,
                acceptedBy: empId
            }

            const confirm = await AlertConfirmation({ title: "Are you sure to submit!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await acceptReqFeedback(dto);
            if (response && response.success) {
                Swal.fire({
                    title: "Success",
                    text: response.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                });
                fetchFeedbackData(selectedEmpId, format(fromDateSel, "yyyy-MM-dd"), format(toDateSel, "yyyy-MM-dd"));
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };

    const employeeOptions =
        roleName === "ROLE_USER"
            ? employeeList
                .filter(emp => Number(emp.empId) === Number(empId))
                .map(emp => ({
                    value: emp.empId,
                    label: (emp.empName + ", " + (emp.empDesigName || "")).trim(),
                }))
            : [
                { value: 0, label: "All" },
                ...employeeList.map(emp => ({
                    value: emp.empId,
                    label: (emp.empName + ", " + (emp.empDesigName || "")).trim(),
                })),
            ];

    return (
        <div>
            <h3 className="fancy-heading mt-3">
                Feedback List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="d-flex flex-wrap justify-content-end align-items-end gap-3 mt-4 me-2">

                {/* Employee */}
                <div className="d-flex align-items-center gap-2">
                    <label className="fw-bold mb-0 text-nowrap">Employee :</label>
                    <Select
                        options={employeeOptions}
                        value={employeeOptions.find((item) => item.value === selectedEmpId) || null}
                        onChange={(selectedOption) => {
                            const selectedValue = selectedOption ? selectedOption.value : 0; // default to 0
                            setSelectedEmpId(selectedValue);
                        }}
                        isSearchable
                        styles={{
                            container: (provided) => ({
                                ...provided,
                                minWidth: "180px",
                                width: "100%",
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                textAlign: "left",
                            }),
                        }}
                        menuPortalTarget={document.body}
                    />
                </div>

                {/* From Date */}
                <div className="d-flex align-items-center gap-2">
                    <label className="fw-bold mb-0 text-nowrap">From :</label>
                    <DatePicker
                        selected={fromDateSel}
                        onChange={(newValue) => setFromDateSel(newValue)}
                        className="form-control"
                        placeholderText="From Date"
                        dateFormat="dd-MM-yyyy"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        onKeyDown={(event) => event.preventDefault()}
                        portalId="root"
                        popperPlacement="bottom-end"
                    />
                </div>

                {/* To Date */}
                <div className="d-flex align-items-center gap-2">
                    <label className="fw-bold mb-0 text-nowrap">To :</label>
                    <DatePicker
                        selected={toDateSel}
                        onChange={(newValue) => setToDateSel(newValue)}
                        className="form-control"
                        placeholderText="To Date"
                        dateFormat="dd-MM-yyyy"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        onKeyDown={(event) => event.preventDefault()}
                        portalId="root"
                        popperPlacement="bottom-end"
                    />
                </div>

            </div>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>


        </div>
    )
}

export default FeedbackList;