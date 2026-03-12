import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { acceptReqFeedback, getFeedbackList, getFeedbackPrint } from "../../service/training.service";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";
import FeedbackPrint from "../print/feedbackPrint";
import { FaEye } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { getEmployees, handleApiError } from "../../service/master.service";
import Select from "react-select";
import { MdLibraryAddCheck } from "react-icons/md";
import AlertConfirmation from "../../common/AlertConfirmation.component";


const FeedbackList = () => {

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
        if (selectedEmpId !== null && selectedEmpId !== undefined) {
            fetchFeedbackData(selectedEmpId);
        }
    }, [selectedEmpId]);

    const fetchFeedbackData = async (employeeId) => {
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
            const response = await getFeedbackList(apiEmpId, apiRole);
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
        { name: "Requisition Number", selector: (row) => row.requisitionNumber, sortable: true, align: 'text-left' },
        { name: "Course", selector: (row) => row.courseName, sortable: true, align: 'text-left' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-left' },
        { name: "Duration (Day)", selector: (row) => row.programDuration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Feedback Given By", selector: (row) => row.participantName, sortable: true, align: 'text-left' },
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
                    {["ROLE_ADMIN", "ROLE_AD_HRT", "ROLE_DH"].includes(roleName) &&
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
                    <button
                        className="print"
                        onClick={() => handlePrint(item)}
                        data-tooltip-id="Tooltip"
                        data-tooltip-content="Print"
                        data-tooltip-place="top"
                    >
                        <FaEye className="fs-6" />
                    </button>
                </>
            )
        }));
    }

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

            await FeedbackPrint(response.data);

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

            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
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
                fetchFeedbackData(selectedEmpId);
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
                    label: ((emp.title || "") + " " + emp.empName + ", " + (emp.empDesigName || "")).trim(),
                }))
            : [
                { value: 0, label: "All" },
                ...employeeList.map(emp => ({
                    value: emp.empId,
                    label: ((emp.title || "") + " " + emp.empName + ", " + (emp.empDesigName || "")).trim(),
                })),
            ];

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Feedback List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="d-flex justify-content-end align-items-center flex-wrap">
                <div className="d-flex align-items-center me-3 mb-2">
                    <label className="font-label fw-bold me-3 mb-0">Employee :</label>
                    <div style={{ width: '400px' }} className="text-start">
                        <Select
                            options={employeeOptions}
                            value={employeeOptions.find((item) => item.value === selectedEmpId) || null}
                            onChange={(selectedOption) => {
                                const selectedValue = selectedOption ? selectedOption.value : 0; // default to 0
                                setSelectedEmpId(selectedValue);
                            }}
                            placeholder="Select Employee"
                            isSearchable
                        />
                    </div>
                </div>
            </div>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>


        </div>
    )
}

export default FeedbackList;