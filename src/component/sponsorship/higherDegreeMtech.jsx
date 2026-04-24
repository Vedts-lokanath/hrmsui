import Navbar from "../navbar/Navbar";
import { useState, useEffect } from "react";
import { getsponsorshipList } from "../../service/sponsorship.service";
import Datatable from "../../datatable/Datatable";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { FaEdit } from "react-icons/fa";
import { format } from "date-fns";

const HigherDegreeMtech = () => {

    const navigate = useNavigate();
    const [sponsorships, setSponsorships] = useState([]);
      

    useEffect(() => {
        fetchData("MTECH");
    }, []);

    const fetchData = async (type) => {
        try {
            const response = await getsponsorshipList(type);
            setSponsorships(response?.data || []);
        } catch (error) {
            console.error("Error fetching sponsorship list", error);
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Employee Name", selector: (row) => row.employeeName, sortable: true },
        { name: "From Date", selector: (row) => row.fromDate ? format(new Date(row.fromDate), "dd-MM-yyyy") : "", sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate ? format(new Date(row.toDate), "dd-MM-yyyy") : "", sortable: true, align: 'text-center' },
        { name: "Period (In Days)", selector: (row) => row.period, sortable: true, align: 'text-center' },
        { name: "Subject", selector: (row) => row.subject, sortable: true, align: 'text-start' },
        { name: "University", selector: (row) => row.university, sortable: true, align: 'text-start' },
        { name: "Preference", selector: (row) => row.preference, sortable: true, align: 'text-center' },
        { name: "City", selector: (row) => row.city, sortable: true, align: 'text-start' },

        {
            name: "Expenditure (₹)", selector: (row) => row.expenditure
                ? `${Number(row.expenditure).toLocaleString("en-IN")}`
                : "-",
            sortable: true, align: 'text-end'
        },
        { name: "Action", selector: (row) => row.action, align: 'text-center' }
    ];

    const mappedData = () => {
        return sponsorships
            .map((item, index) => {
                return {
                    sn: index + 1,
                    employeeName: `${item.employeeName}, ${item.empDesigCode}`|| "NA",
                    delegatedPower: item.delegatedPower || "NA",
                    discipline: item.discipline || "NA",
                    subject: item.subject || "NA",
                    university: item.university || "NA",
                    preference: item.preference || "NA",

                    city: item.city || "NA",
                    fromDate: item.fromDate || "NA",
                    toDate: item.toDate || "NA",
                    period: item.period || "NA",
                    expenditure: item.expenditure || "-",

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
                };
            });
    };


   const handleEdit = (item) => {
    navigate("/higherDegree-add", {
        state: {
            degreeType: "MTECH",
            isEdit: true,
            editData: item,
            existingEmpIds: sponsorships
                .filter(s => s.sponsorshipId !== item.sponsorshipId)
                .map(s => s.empId)
        }
    });
};

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Higher Degree M.Tech
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>
            <div id="card-body" className="p-2 mt-2">
                <Datatable columns={columns} data={mappedData()} />
            </div>
            <div>
                <button className="add"
                 onClick={() =>
                   navigate("/higherDegree-add", {
                   state: {
                   degreeType: "MTECH",   
                   existingEmpIds: sponsorships.map(s => s.empId)  
    }
})
}
                > ADD NEW</button>
            </div>

        </div>
    );
}

export default HigherDegreeMtech;