import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import { forwardToDirector, getReqApprovedList } from "../../service/training.service";
import RequisitionPreview from "../training/requisitionPreview";
import { format } from "date-fns";
import Swal from "sweetalert2";
import AlertConfirmation from "../../common/AlertConfirmation.component";


const SAHRTApprovalList = () => {

    const [requsitionApprovedList, setRequisitionApprovedList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [reqData, setShowReqData] = useState(null);
    const empId = localStorage.getItem("empId");


    useEffect(() => {
        fetchRequsitionApprovedList();
    }, []);

    const fetchRequsitionApprovedList = async () => {
        try {
            const response = await getReqApprovedList();
            setRequisitionApprovedList(response?.data || []);
        } catch (error) {
            console.error('Error fetching requisition approved list:', error);
        }
    };

    const columns = [
        { name: "Select", selector: (row) => row.select, sortable: true, align: 'text-center' },
        { name: "Requisition No", selector: (row) => row.requisitionNumber, sortable: true, align: 'text-left' },
        { name: "Course", selector: (row) => row.courseName, sortable: true, align: 'text-left' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-left' },
        { name: "Duration (Day)", selector: (row) => row.duration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Participant", selector: (row) => row.initiatingOfficer, sortable: true, align: 'text-left' },
        { name: "Designation", selector: (row) => row.designation, sortable: true, align: 'text-center' },
        { name: "Status", selector: (row) => row.status, sortable: true, align: 'text-left' },
    ];


    const mappedData = () => {
        return requsitionApprovedList.map((item, index) => ({
            select: (
                <input
                    type="checkbox"
                    checked={selectedRows.some((row) => row.requisitionId === item.requisitionId)}
                    onChange={(e) => handleCheckboxChange(item, e.target.checked)}
                />
            ),
            requisitionNumber: (
                <button
                    className="btn btn-sm btn-outline-primary fw-semibold"
                    onClick={() => handlePreview(item)}
                >
                    {item.requisitionNumber}
                </button>
            ),
            courseName: item.courseName || "-",
            organizer: item.organizer || "-",
            duration: item.duration || "-",
            fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
            toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
            initiatingOfficer: item.initiatingOfficerName || "-",
            designation: item.empDesigName || "-",
            status:
                <span
                    className="status-badge-modern"
                    onClick={() => handleView(item)}
                    style={{
                        backgroundColor: item.statusColor || "#cceaff",
                        color: getTextColor(item.statusColor),
                        borderColor: item.statusColor || "#dee2e6"
                    }}
                >
                    {item.statusName || "Unknown"}
                </span>,
        }));
    };

    const handleCheckboxChange = (item, checked) => {
        if (checked) {
            setSelectedRows((prev) => [...prev, item]);
        } else {
            setSelectedRows((prev) => prev.filter((row) => row.requisitionId !== item.requisitionId));
        }
    };
    

    const handlePreview = (item) => {
        setShowModal(true);
        setShowReqData(item);
    };

    const handleView = (item) => {
        const dto = {
            requisitionId: item.requisitionId,
            requisitionNumber: item.requisitionNumber,
            programName: item.programName,
            fromDate: item.fromDate,
            toDate: item.toDate,
            registrationFee: item.registrationFee,
        }
        localStorage.setItem('transactionData', JSON.stringify(dto));
        window.open('/transaction', '_blank');
    }

    const getTextColor = (bg) => {
        if (!bg) return "#000";
        const color = bg.substring(1);
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? "#000" : "#fff";
    };

    const handlForwardToDirector = async () => {
        try {
            if (selectedRows.length === 0) {
                Swal.fire('No Selection', 'Please select at least one requisition to forward.', 'warning');
                return;
            }

            const selectedIds = selectedRows.map(row => row.requisitionId);
            const dto = {
                requisitionIds: selectedIds,
                actionBy: empId,
            }
            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await forwardToDirector(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchRequsitionApprovedList();
                setSelectedRows([]);
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire('Error', 'An error occurred while forwarding. Please try again.', 'error');
        }
    };

    return (
        <div>

            <h3 className="fancy-heading mt-3">
                Requisition Approved List
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
                    className="submit"
                    onClick={handlForwardToDirector}
                >
                    Forward to Director
                </button>
            </div>

            {showModal &&
                <RequisitionPreview
                    reqData={reqData}
                    setShowModal={setShowModal}
                />
            }

        </div>
    );
}

export default SAHRTApprovalList;