import { format } from "date-fns";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

export const RequisitionPrint = (reqData) => {

    const formatDateTime = (date) => {
        if (!date) return "";
        try {
            return format(new Date(date), "dd-MM-yyyy hh:mm a");
        } catch (error) {
            return "";
        }
    };

    const isApproved = !!reqData?.approvedDate;

    const docDefinition = {
        pageSize: "A4",
        pageMargins: [35, 120, 40, 60],

        header: function (currentPage, pageCount) {
            return {
                margin: [35, 20, 40, 0],
                table: {
                    widths: [60, 260, 50, 50, 60],
                    body: [
                        [
                            { text: "", border: [true, true, true, false] },
                            { text: "Centre for Artificial Intelligence and Robotics (CAIR), Bangalore - 560093", fontSize: 11, alignment: "center", margin: [0, 5, 0, 5], colSpan: 3 }, {}, {},
                            { text: "", border: [true, true, true, false] }
                        ],
                        [
                            { text: "CAIR", alignment: "center", bold: true, rowSpan: 3, border: [true, false, true, true] },
                            { text: "REQUISITION FOR TRAINING", alignment: "center", bold: true, margin: [0, 15, 0, 0], rowSpan: 3 },
                            { text: "Format No", fontSize: 8, alignment: "center" },
                            { text: "QSP060:FM02", fontSize: 7, alignment: 'center' },
                            { text: "QSP", alignment: "center", bold: true, rowSpan: 3, border: [true, false, true, true] }
                        ],
                        [
                            {}, {},
                            {
                                stack: [
                                    { text: 'Issue No', fontSize: 8, alignment: "center" },
                                    { text: 'Rev No', fontSize: 8, alignment: "center" },

                                ],
                            },
                            {
                                stack: [
                                    { text: '04', fontSize: 7, alignment: "center" },
                                    { text: '02', fontSize: 7, alignment: "center" },

                                ],
                            }, {}
                        ],
                        [
                            {}, {},
                            { text: "Page No", fontSize: 8, alignment: 'center' },
                            { text: `${currentPage} of ${pageCount}`, bold: true, fontSize: 7, alignment: 'center', }, {}
                        ],

                    ]
                }
            };
        },

        content: [
            {
                margin: [0, 0, 0, 0],
                table: {
                    widths: [100, 140, 100, 150],
                    body: [
                        [
                            { text: "Division / Group", bold: true },
                            { text: reqData.empDivCode || "", alignment: 'left' },
                            { text: "Requisition No", bold: true },
                            { text: reqData.requisitionNumber || "", alignment: 'left' }
                        ]
                    ]
                }
            },
            { text: "The following nomination(s) is/are forwarded by this Division for the ___________________ as under :", margin: [0, 20, 0, 0] },
            {
                margin: [0, 10, 0, 0],
                table: {
                    widths: [20, 170, 305],
                    body: [
                        [
                            { text: "1.", alignment: "center", bold: true },
                            { text: "Name of the Program", bold: true, alignment: "left" },
                            { text: `${reqData.courseName || ""}`, alignment: "left" }
                        ],
                        [
                            { text: "2.", alignment: "center", bold: true },
                            { text: "Reference", bold: true, alignment: "left" },
                            { text: `${reqData.reference || ""}`, alignment: "left" }
                        ],
                        [
                            { text: "3.", alignment: "center", bold: true },
                            { text: "Duration", bold: true, alignment: "left" },
                            {
                                margin: [-4, -3, 0, -3],
                                table: {
                                    widths: [60, 112, 110],
                                    body: [
                                        [
                                            { text: "Days", bold: true, alignment: "center", border: [false, false, true, true] },
                                            { text: "From", bold: true, alignment: "center", border: [false, false, true, true] },
                                            { text: "To", bold: true, alignment: "center", border: [false, false, false, true] }
                                        ],
                                        [
                                            { text: `${reqData.duration || ""}`, alignment: "center", border: [false, false, true, false] },
                                            { text: `${reqData.fromDate ? format(new Date(reqData.fromDate), "dd-MM-yyyy") : ""}`, alignment: "center", border: [false, false, true, false] },
                                            { text: `${reqData.toDate ? format(new Date(reqData.toDate), "dd-MM-yyyy") : ""}`, alignment: "center", border: [false, false, false, false] }
                                        ]
                                    ]
                                },
                            }
                        ],
                        [
                            { text: "4.", alignment: "center", bold: true },
                            { text: "Venue", bold: true, alignment: "left" },
                            { text: `${reqData.venue || ""}`, alignment: "left" }
                        ],
                        [
                            { text: "5.", alignment: "center", bold: true },
                            { text: "Organized by", bold: true, alignment: "left" },
                            { text: `${reqData.organizer || ""}`, alignment: "left" }
                        ],
                        [
                            { text: "6.", alignment: "center", bold: true },
                            { text: "Fee/Charges per participant", bold: true, alignment: "left" },
                            {
                                margin: [-4, -3, 0, -3],
                                table: {
                                    widths: [300],
                                    body: [
                                        [
                                            {
                                                text: (() => {
                                                    const fee = Number(reqData?.registrationFee) || 0;
                                                    return fee > 0 ? `₹ ${fee.toFixed(2)}` : "Free";
                                                })(),
                                                bold: true,
                                                margin: [0, 0, 0, 5],
                                                border: [false, false, false, true]
                                            }
                                        ],
                                        [
                                            {
                                                text: "To be ensured that the requisition is given to O/o HRT at least :",
                                                bold: true,
                                                margin: [0, 5, 0, 3],
                                                border: [false, false, false, false]
                                            }
                                        ],
                                        [
                                            {
                                                text: "1. 7 working days prior to training commencement for free () is < 15K",
                                                margin: [20, 5, 0, 0],
                                                border: [false, false, false, false]
                                            }
                                        ],
                                        [
                                            {
                                                text: "2. 1 Month prior to training commencement for free () is > 15K",
                                                margin: [20, 5, 0, 0],
                                                border: [false, false, false, false]
                                            }
                                        ],
                                        [
                                            {
                                                text: "3. If free of cost, 2 days prior to training commencement",
                                                margin: [20, 5, 0, 5],
                                                border: [false, false, false, false]
                                            }
                                        ]
                                    ]
                                }
                            }
                        ],
                        [
                            { text: "7.", alignment: "center", bold: true },
                            { text: "Organizer Details", bold: true, alignment: "left" },
                            {
                                margin: [-4, -3, 0, -3],
                                table: {
                                    widths: [122, 80, 80],
                                    body: [
                                        [
                                            { text: "Contact Name", bold: true, alignment: "center", border: [false, false, true, true] },
                                            { text: "Phone No", bold: true, alignment: "center", border: [false, false, true, true] },
                                            { text: "Fax No", bold: true, alignment: "center", border: [false, false, false, true] },
                                        ],
                                        [
                                            { text: reqData.organizerContactName || "", alignment: "center", border: [false, false, true, false] },
                                            { text: reqData.organizerPhoneNo || "", alignment: "center", border: [false, false, true, false] },
                                            { text: reqData.organizerFaxNo || "", alignment: "center", border: [false, false, false, false] }
                                        ],
                                        [
                                            { text: "Email", bold: true, alignment: "center", border: [false, true, false, false] },
                                            { text: reqData.organizerEmail || "", alignment: "center", colSpan: 2, border: [true, true, false, false] },
                                            { text: ``, alignment: "center" }
                                        ]
                                    ]
                                },
                            }
                        ],
                        [
                            { text: "8.", alignment: "center", bold: true },
                            { text: "Mode of Payment", bold: true, alignment: "left" },
                            { text: `${reqData.modeOfPayment || ""}`, alignment: "left" }
                        ],
                        [
                            { text: "9.", alignment: "center", bold: true },
                            { text: "Enclosures(s)", bold: true, alignment: "left" },
                            { text: ``, alignment: "left" }
                        ],
                        [
                            { text: "10.", alignment: "center", bold: true, margin: [0, 5, 0, 5], border: [false, false, false, false] },
                            { text: "Nominations", bold: true, alignment: "left", margin: [0, 5, 0, 5], border: [false, false, false, false] },
                            { text: ``, alignment: "left", border: [false, false, false, false] }
                        ],
                    ]
                }
            },
            {
                margin: [0, 0, 0, 0],
                table: {
                    widths: [160, 60, 80, 70, 107],
                    body: [
                        [
                            { text: "Name & Desig", bold: true, alignment: "center" },
                            { text: "PIS No", bold: true, alignment: "center" },
                            { text: "Email", bold: true, alignment: "center" },
                            { text: "Contact No", bold: true, alignment: "center" },
                            { text: "Feedback / Impact forms / Participation certificate of previous course submitted", fontSize: 10, bold: true, alignment: "center" },
                        ],
                        [
                            { text: `${reqData.initiatingOfficerName || ""}`, alignment: "center" },
                            { text: `${reqData.empNo || ""}`, alignment: "center" },
                            { text: `${reqData.email || ""}`, alignment: "center" },
                            { text: `${reqData.mobileNo || ""}`, alignment: "center" },
                            { text: `${reqData.isSubmitted === "Y" ? "YES" : "NO"}`, alignment: "center" }
                        ],
                    ]
                }
            },
            {
                text: "11.   Necessity of course and benefits", bold: true, margin: [8, 20, 0, 40]
            },
            {
                margin: [0, 8, 0, 0],
                table: {
                    widths: [513],
                    body: [
                        [
                            {
                                text: reqData.necessity || "",
                                alignment: "justify",
                                margin: [8, 8, 8, 8]
                            }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: function () { return 1; },
                    vLineWidth: function () { return 1; },
                    hLineColor: function () { return '#000000'; },
                    vLineColor: function () { return '#000000'; }
                }
            },
            {
                text: "Mandatory Enclosures Attached", bold: true, margin: [8, 20, 0, 10]
            },
            {
                table: {
                    widths: [300, 100],
                    body: [
                        [
                            {
                                text: "1. ECS :",
                                margin: [40, 5, 0, 3],
                                border: [false, false, false, false]
                            },
                            {
                                text: reqData.fileEcs && reqData.fileEcs.trim() !== "" ? "Yes" : "No",
                                border: [false, false, false, false]
                            }
                        ],
                        [
                            {
                                text: "2. Bank cancelled cheque (photo copy) :",
                                margin: [40, 5, 0, 3],
                                border: [false, false, false, false]
                            },
                            {
                                text: reqData.fileCheque && reqData.fileCheque.trim() !== "" ? "Yes" : "No",
                                border: [false, false, false, false]
                            }
                        ], [
                            {
                                text: "3. PAN Card (photo card) :",
                                margin: [40, 5, 0, 3],
                                border: [false, false, false, false]
                            },
                            {
                                text: reqData.filePan && reqData.filePan.trim() !== "" ? "Yes" : "No",
                                border: [false, false, false, false]
                            }
                        ], [
                            {
                                text: "4. Brochure :",
                                margin: [40, 5, 0, 3],
                                border: [false, false, false, false]
                            },
                            {
                                text: reqData.fileBrochure && reqData.fileBrochure.trim() !== "" ? "Yes" : "No",
                                border: [false, false, false, false]
                            }
                        ],
                    ]
                }
            },
            {
                text: "Note : ", bold: true, margin: [8, 20, 0, 10]
            },
            {
                table: {
                    widths: [30, 475],
                    body: [
                        [
                            {
                                text: "1.",
                                margin: [20, 5, 0, 0],
                                border: [false, false, false, false]
                            },
                            {
                                text: "To consider the nominations, Division heads/Group heads should ensure that the nominees have submitted the feedback, participation certificate and impact forms of previous courses attended.",
                                margin: [0, 5, 0, 0],
                                alignment: "justify",
                                border: [false, false, false, false]
                            }
                        ],
                        [
                            {
                                text: "2.",
                                margin: [20, 5, 0, 0],
                                border: [false, false, false, false]
                            },
                            {
                                text: "Immediately after the course completion, please submit Participation/Course certificate and orginal invoice for completion of payment process.",
                                margin: [0, 5, 0, 0],
                                alignment: "justify",
                                border: [false, false, false, false]
                            }
                        ],
                        [
                            {
                                text: "3.",
                                margin: [20, 5, 0, 0],
                                border: [false, false, false, false]
                            },
                            {
                                text: "The nominees to ensure that their attendance is regularized with Admin.",
                                margin: [0, 5, 0, 5],
                                alignment: "justify",
                                border: [false, false, false, false]
                            }
                        ]
                    ]
                }
            },
            {
                margin: [0, 60, 0, 0],
                columns: [
                    {
                        alignment: "left",
                        stack: [
                            {
                                text: formatDateTime(reqData?.forwardDate),
                                bold: true,
                                color: "#0d47a1",
                                fontSize: 11
                            },
                            {
                                text: "Date",
                                margin: [0, 5, 0, 0]
                            }
                        ]
                    },
                    {
                        alignment: "right",
                        stack: [
                            {
                                text: (reqData?.initiatingOfficerName + ", " + reqData?.empDesigName) || "",
                                bold: true,
                                color: "#0d47a1",
                                fontSize: 11
                            },
                            {
                                text: "Initiating Officer",
                                margin: [0, 5, 0, 0]
                            }
                        ]
                    }
                ]
            },
            {
                canvas: [
                    { type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 1 }
                ]
            },
            {
                margin: [0, 50, 0, 0],
                columns: [
                    {
                        alignment: "left",
                        stack: [
                            {
                                text: formatDateTime(reqData?.verifiedDate),
                                bold: true,
                                color: "#0d47a1",
                                fontSize: 11
                            },
                            {
                                text: "Date",
                                margin: [0, 5, 0, 0]
                            }
                        ]
                    },
                    {
                        alignment: "right",
                        stack: [
                            {
                                text: reqData?.verifiedOfficerName || "",
                                bold: true,
                                color: "#0d47a1",
                                fontSize: 11
                            },
                            {
                                text: "Division/Group Head",
                                margin: [0, 5, 0, 0]
                            }
                        ]
                    }
                ]
            },
            {
                canvas: [
                    { type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 1 }
                ]
            },
            {
                margin: [0, 70, 0, 0],
                columns: [
                    {
                        alignment: "left",
                        stack: [
                            {
                                text: formatDateTime(reqData?.approvedDate),
                                bold: true,
                                color: "#0d47a1",
                                fontSize: 11
                            },
                            {
                                text: "Date",
                                margin: [0, 5, 0, 0]
                            }
                        ]
                    },
                    {
                        width: 150,
                        alignment: "center",
                        columns: isApproved
                            ? [
                                {
                                    canvas: [
                                        { type: 'rect', x: 0, y: 0, w: 10, h: 10 },
                                        { type: 'line', x1: 1, y1: 5, x2: 4, y2: 9 },
                                        { type: 'line', x1: 4, y1: 9, x2: 9, y2: 1 }
                                    ],
                                    width: 10
                                },
                                {
                                    text: "Approved",
                                    margin: [0, 0, 25, 0]
                                }
                            ]
                            : [
                                {
                                    canvas: [
                                        { type: 'rect', x: 0, y: 0, w: 10, h: 10 },
                                        { type: 'line', x1: 1, y1: 1, x2: 9, y2: 9 },
                                        { type: 'line', x1: 9, y1: 1, x2: 1, y2: 9 }
                                    ],
                                    width: 15
                                },
                                {
                                    text: "Not Approved",
                                    margin: [0, 0, 0, 0]
                                }
                            ]
                    },
                    {
                        alignment: "right",
                        stack: [
                            {
                                text: reqData?.approvedOfficerName || "",
                                bold: true,
                                color: "#0d47a1",
                                fontSize: 11
                            },
                            {
                                text: "AD (HRT)",
                                margin: [0, 5, 0, 0]
                            }
                        ]
                    }
                ]
            },
            {
                canvas: [
                    { type: 'line', x1: 0, y1: 0, x2: 520, y2: 0, lineWidth: 1 }
                ]
            }
        ]
    };

    pdfMake.createPdf(docDefinition).open();
};

export default RequisitionPrint;