import { useState, useEffect } from "react";
import { getsponsorshipList } from "../../service/sponsorship.service";
import Navbar from "../navbar/Navbar";
import Datatable from "../../datatable/Datatable";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { FaEdit } from "react-icons/fa";
import { format } from "date-fns";
const HigherDegreePhD = () => {
    const navigate = useNavigate();
    const [sponsorship, setSponsorship] = useState([]);
    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true ,align: 'text-center'},
        { name: "Emplopyee Name", selector: (row) => row.employeeName, sortable: true },
        { name: "Subject", selector: (row) => row.subject, sortable: true, align: 'text-center' },
        { name: "University", selector: (row) => row.university, sortable: true, align: 'text-center' },
        { name: "Preference", selector: (row) => row.preference, sortable: true, align: 'text-center' },
        { name: "City", selector: (row) => row.city, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate ? format(new Date(row.fromDate), "dd-MM-yyyy") : "", sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate ? format(new Date(row.toDate), "dd-MM-yyyy") : "", sortable: true, align: 'text-center' },
        { name: "Expenditure (₹)", selector: (row) => row.expenditure
             ? `${Number(row.expenditure).toLocaleString("en-IN")}`
                : "-",
            sortable: true, align: 'text-center'
        },
        { name: "Action", selector: (row) => row.action, align: 'text-center' }
    ];
    const mappedData = () => {
        return sponsorship
            .filter(item => item.degreeType === "PHD")
            .map((item, index) => {
                return {
                    sn: index + 1,
                    employeeName: item.employeeName || "NA",
                    delegatedPower: item.delegatedPower || "NA",
                    discipline: item.discipline || "NA",
                    subject: item.subject || "NA",
                    university: item.university || "NA",
                    preference: item.preference || "NA",
                    city: item.city || "NA",
                    fromDate: item.fromDate || "NA",
                    toDate: item.toDate || "NA",
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
    const fetchData = async () => {
        try {
            const response = await getsponsorshipList();
            setSponsorship(response?.data || []);
        } catch (error) {
            console.error("Error fetching sponsorship list", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (item) => {
        navigate("/higherDegree-add", {
            state: {
                degreeType: "PHD",
                isEdit: true,
                editData: item
            }
        });
    };

    return (
        <div>
            <Navbar />
            <h3 className="fancy-heading mt-3">
                Higher Degree Ph.D
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
                <button
                    className="add"
                    onClick={() => navigate("/higherDegree-add",
                         { state: { degreeType: "PHD" } 
                         })}
                >
                    ADD NEW
                </button>
            </div>
        </div>
    );
}

export default HigherDegreePhD;