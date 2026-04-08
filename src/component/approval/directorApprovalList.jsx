import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import RequisitionPreview from "../training/requisitionPreview";
import { approveRequisition, getReqApprovedList, recommendToDFA } from "../../service/training.service";
import { format } from "date-fns";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import Swal from "sweetalert2";


const DirectorApprovalList = () => {

    const empId = localStorage.getItem("empId");
    const [requsitionApprovedList, setRequisitionApprovedList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [reqData, setShowReqData] = useState(null);
    const [selectedTab, setSelectedTab] = useState("free");


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

    const freeList = requsitionApprovedList.filter(item => item.registrationFee === 0);
    const paidList = requsitionApprovedList.filter(item => item.registrationFee > 0);
    const filteredList = selectedTab === "free" ? freeList : paidList;

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
        return filteredList.map((item, index) => ({
            select: (
                <input
                    type="checkbox"
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

    const handleChangeTab = (tab) => {
        setSelectedTab(tab);
        setSelectedRows([]);
    };

    const handleApprove = async () => {
        try {
            if (selectedRows.length === 0) {
                Swal.fire("Warning", "Please select at least one requisition to approve.", "warning");
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
            const response = await approveRequisition(dto);
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
            Swal.fire('Error', 'An error occurred while approving requisitions. Please try again.', 'error');
        }
    };

    const handleRecommend = async () => {
        try {
            if (selectedRows.length === 0) {
                Swal.fire("Warning", "Please select at least one requisition to recommend.", "warning");
                return;
            }

            const alreadyRecommended = selectedRows.filter(row => row.status === "FC");

            if (alreadyRecommended.length > 0) {
                Swal.fire({
                    title: "Already Recommended",
                    html: `
                            <div style="text-align:left; font-size:14px;">
                                <p>The following requisitions are already recommended:</p>
                                <ul style="margin-top:8px; padding-left:20px;">
                                    ${alreadyRecommended
                            .map(row => `<li><b>${row.requisitionNumber}</b></li>`)
                            .join("")}
                                </ul>
                            </div>
                        `,
                    icon: "warning",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3085d6",
                });
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
            const response = await recommendToDFA(dto);
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
            Swal.fire('Error', 'An error occurred while recommending requisitions. Please try again.', 'error');
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

            <div className="mt-5 d-flex gap-4 justify-content-center">

                {/* Free */}
                <button
                    type="button"
                    className={`btn position-relative btn-fixed-300 ${selectedTab === "free" ? "btn-warning" : "btn-outline-secondary"} fw-semibold`}
                    onClick={() => handleChangeTab("free")}
                >
                    Free Requisition
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {freeList.length}
                    </span>
                </button>

                {/* Paid */}
                <button
                    type="button"
                    className={`btn position-relative btn-fixed-300 ${selectedTab === "paid" ? "btn-success" : "btn-outline-secondary"} fw-semibold`}
                    onClick={() => handleChangeTab("paid")}
                >
                    Paid Requisition
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {paidList.length}
                    </span>
                </button>

            </div>


            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

            <div>
                <button
                    className="submit"
                    onClick={handleApprove}
                >
                    Approve
                </button>
                {selectedTab === "paid" &&
                    <button
                        className="add"
                        onClick={handleRecommend}
                    >
                        Recommend to DFA
                    </button>}
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

export default DirectorApprovalList;