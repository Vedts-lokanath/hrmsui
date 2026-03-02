import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { getFeedbackList } from "../../service/training.service";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";
import FeedbackPrint from "../print/feedbackPrint";
import { FaEye } from "react-icons/fa6";


const FeedbackList = () => {

    const [feedbackList, setFeedbackList] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await getFeedbackList();
            setFeedbackList(response?.data || []);
        } catch (error) {
            console.error("Error fetching feedback list:", error);
            Swal.fire("Error", "Failed to fetch feedback data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Program", selector: (row) => row.programName, sortable: true, align: 'text-center' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-center' },
        { name: "Duration", selector: (row) => row.programDuration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Feedback Given By", selector: (row) => row.participantName, sortable: true, align: 'text-center' },
        { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {
        return feedbackList.map((item, index) => ({
            sn: index + 1,
            programName: item.programName || "-",
            organizer: item.organizer || "-",
            programDuration: item.programDuration || "-",
            fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
            toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
            participantName: item.participantName || "-",
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
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
        const fullName = item.participantName || "";

        const [namePart, designationPart] = fullName.split(",").map(item => item?.trim());
        const payload = {
            ...item,
            participantName: namePart,
            designationPart: designationPart
        }
        FeedbackPrint(payload);
    };

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

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>


        </div>
    )
}

export default FeedbackList;