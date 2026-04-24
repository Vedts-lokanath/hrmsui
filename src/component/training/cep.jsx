import { useState } from 'react'
import Navbar from '../navbar/Navbar'
import { getCepList } from '../../service/training.service';
import { useEffect } from 'react';
import Datatable from "../../datatable/Datatable";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const CepComponent = () => {

    const navigate = useNavigate();
    const [cep, Setcep] = useState([]);

    useEffect(() => {
        fetchCepList();
    }, []);

    const fetchCepList = async () => {
        try {
            const response = await getCepList();
            Setcep(response.data);
        } catch (error) {
            console.error("Error fetching cep list:", error);
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Division Name ", selector: (row) => row.divisionCode, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Duration", selector: (row) => row.duration, sortable: true, align: 'text-center' },
        { name: "No of Participants", selector: (row) => row.noOfParticipants, sortable: true, align: 'text-center' },
        {
            name: "Total Amount (₹)",
            selector: (row) =>
                row.totalAmount
                    ? ` ${Number(row.totalAmount).toLocaleString("en-IN")}`
                    : "-",
            sortable: true,
            align: "text-end",
        },
        {
            name: "Amount Spent (₹)",
            selector: (row) =>
                row.amountSpent
                    ? ` ${Number(row.amountSpent).toLocaleString("en-IN")}`
                    : "-",
            sortable: true,
            align: "text-end",
        },
        { name: " Comment ", selector: (row) => row.comments, sortable: true, align: 'text-start' },
        { name: "Action", selector: (row) => row.action, align: 'text-center' },
    ];

    const mappedData = () => {
        return cep.map((cepItem, index) => ({
            sn: index + 1,
            divisionCode: cepItem.divisionCode || "NA",
            noOfParticipants: cepItem.noOfParticipants || "NA",
            amountSpent: cepItem.amountSpent || "NA",
            totalAmount: cepItem.totalAmount || "NA",   // removed duplicate
            duration: cepItem.duration || "NA",         // was missing entirely
            fromDate: cepItem.fromDate ? format(new Date(cepItem.fromDate), "dd-MM-yyyy") : "NA",
            toDate: cepItem.toDate ? format(new Date(cepItem.toDate), "dd-MM-yyyy") : "NA",
            comments: cepItem.comments || "NA",
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    <button
                        className="btn btn-sm btn-warning me-2"
                        data-tooltip-id="Tooltip"
                        data-tooltip-content="Edit"
                        data-tooltip-place="top"
                        onClick={() => navigate("/cep-add", { state: { cepItem } })}
                    >
                        <FaEdit className="fs-6" />
                    </button>
                </>
            )
        }));
    };


    return (
        <div>
            <Navbar />
            <div>

                <h3 className="fancy-heading mt-3">
                    CEP List
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
                    <button className="add" onClick={() => navigate("/cep-add")}> ADD NEW</button>
                </div>

            </div>

        </div>
    )
}

export default CepComponent; 