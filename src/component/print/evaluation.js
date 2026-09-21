import { format } from "date-fns";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

export const EvaluationPrint = (evData, empName, labData) => {

    const docDefinition = {
        pageSize: "A4",
        pageMargins: [35, 120, 40, 60],

        header: function (currentPage, pageCount) {
            return {
                margin: [35, 15, 40, 10],
                table: {
                    widths: [60, 260, 50, 50, 60],
                    body: [
                        [
                            { text: "", border: [true, true, true, false] },
                            {
                                stack: [
                                    {
                                        text: `${labData?.labName} (${labData?.labCode})`,
                                        fontSize: 12,
                                        bold: true,
                                        alignment: "center"
                                    },
                                    {
                                        text: `${labData?.labAddress}, ${labData?.labPin}`,
                                        fontSize: 8,
                                        alignment: "center",
                                        margin: [0, 2, 0, 0]
                                    }
                                ],
                                colSpan: 3,
                                margin: [0, 5, 0, 5]
                            },
                            {},
                            {},
                            { text: "", border: [true, true, true, false] }
                        ],
                        [
                            { text: `${labData?.labCode}`, alignment: "center", bold: true, rowSpan: 3, border: [true, false, true, true] },
                            { text: "REPORT OF EVALUATION OF EFFECTIVENESS OF TRAINING", alignment: "center", bold: true, margin: [0, 10, 0, 0], rowSpan: 3 },
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
                                    { text: '03', fontSize: 7, alignment: "center" },
                                    { text: '01', fontSize: 7, alignment: "center" },

                                ],
                            }, {}
                        ],
                        [
                            {}, {},
                            { text: "Page No", fontSize: 8, alignment: 'center' },
                            { text: `${currentPage} of ${pageCount}`, fontSize: 7, alignment: 'center' },
                            {}
                        ],
                    ]
                }
            };
        },

        content: [
            {
                text: [
                    { text: "1. Name of the Employee with Designation : ", bold: true },
                    {
                        text: evData.empName,
                        color: "#0067ee",
                    }
                ],
                margin: [0, 5, 0, 3]
            },
            {
                text: "2. Evaluation Details",
                bold: true,
                margin: [0, 5, 0, 5]
            },
            {
                text: "E : Excellent, VG : Very Good, G : Good, M : Margin, N : Nil",
                margin: [0, 10, 0, 0],
                fontSize: 10,
                bold: true,
                color: "#8f3105",
            },
            {
                margin: [0, 5, 0, 10],
                table: {
                    headerRows: 2,
                    widths: [170, 100, 100, 117],

                    body: [
                        [
                            { text: "Title of the course attended", bold: true, rowSpan: 2, alignment: "center", margin: [0, 10, 0, 0] },
                            { text: "Date of Training", bold: true, colSpan: 2, alignment: "center" },
                            {},
                            { text: "Training Impact", bold: true, rowSpan: 2, alignment: "center", margin: [0, 10, 0, 0] }
                        ],
                        [
                            {},
                            { text: "From Date", bold: true, alignment: "center" },
                            { text: "To Date", bold: true, alignment: "center" },
                            {}
                        ],
                        ...(evData?.evaluation || []).map(ev => ([
                            ev.courseName || "",
                            { text: format(new Date(ev.fromDate), "dd-MM-yyyy"), alignment: "center" },
                            { text: format(new Date(ev.toDate), "dd-MM-yyyy"), alignment: "center" },
                            { text: ev.impact || "NA", alignment: "center" },
                        ]))
                    ]
                }
            },
            {
                columns: [
                    {
                        margin: [0, 40, 0, 0],
                        text: [
                            "Date: ",
                            {
                                text: format(new Date(), "dd-MM-yyyy"),
                                decoration: "underline"
                            }
                        ]
                    },
                    {
                        alignment: "right",
                        margin: [0, 40, 0, 0],
                        stack: [
                            {
                                text: evData?.preparedByEmpName || "",
                                bold: true,
                                color: "#0d47a1",
                            },
                            {
                                text: "Signature of Division Head/AD",
                                margin: [0, 5, 0, 0]
                            }
                        ]
                    }
                ]
            },
            {
                text: "Note: Concerned Division Head/AD must send Report of Evaluation of Effectiveness of Training (QSP060:FM04) to HRT after a period of three months on the job.",
                margin: [0, 30, 0, 0],
                fontSize: 10
            }
        ]
    };

    pdfMake.createPdf(docDefinition).open();
};

export default EvaluationPrint;