import { format } from "date-fns";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

export const FeedbackPrint = (reqData) => {

    // ✅ Safe date formatter
    const formatDate = (date) => {
        if (!date) return "";
        return format(new Date(date), "dd-MM-yyyy");
    };

    // ✅ Rating tick helper
    const ratingCell = (value, column) => {
        return value === column
            ? { text: "√", alignment: "center" }
            : { text: "" };
    };

    // ✅ Course table rows
    const feedbackRows = [
        { id: "course", label: "Quality of course material" },
        { id: "coverage", label: "Adequacy of coverage" },
        { id: "duration", label: "Adequacy of duration" },
        { id: "faculty", label: "Competency of Faculty" },
        { id: "participant", label: "Interaction with participants" },
        { id: "courseVenue", label: "Infrastructure at the venue" },
    ];

    const courseTableBody = [
        [
            { text: "Sl.No", bold: true, alignment: "center" },
            { text: "Details", bold: true, alignment: "center" },
            { text: "E", bold: true, alignment: "center" },
            { text: "VG", bold: true, alignment: "center" },
            { text: "G", bold: true, alignment: "center" },
            { text: "A", bold: true, alignment: "center" },
            { text: "P", bold: true, alignment: "center" },
        ],
        ...feedbackRows.map((row, index) => [
            { text: index + 1, alignment: "center" },
            row.label,
            ratingCell(reqData[row.id], "E"),
            ratingCell(reqData[row.id], "VG"),
            ratingCell(reqData[row.id], "G"),
            ratingCell(reqData[row.id], "A"),
            ratingCell(reqData[row.id], "P"),
        ])
    ];

    // ✅ Conference table
    const confTableBody = [
        [
            { text: "Sl.No", bold: true, alignment: "center" },
            { text: "Details", bold: true, alignment: "center" },
            { text: "E", bold: true, alignment: "center" },
            { text: "VG", bold: true, alignment: "center" },
            { text: "G", bold: true, alignment: "center" },
            { text: "A", bold: true, alignment: "center" },
            { text: "P", bold: true, alignment: "center" },
        ],
        [

            { text: 1, alignment: "center" },
            "Overall Quality",
            ratingCell(reqData.quality, "E"),
            ratingCell(reqData.quality, "VG"),
            ratingCell(reqData.quality, "G"),
            ratingCell(reqData.quality, "A"),
            ratingCell(reqData.quality, "P"),
        ],
        [
            { text: 2, alignment: "center" },
            "Infrastructure at the venue",
            ratingCell(reqData.seminarVenue, "E"),
            ratingCell(reqData.seminarVenue, "VG"),
            ratingCell(reqData.seminarVenue, "G"),
            ratingCell(reqData.seminarVenue, "A"),
            ratingCell(reqData.seminarVenue, "P"),
        ],
    ];

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
                                text: "Centre for Artificial Intelligence and Robotics (CAIR), Bangalore - 560093",
                                fontSize: 11,
                                alignment: "center",
                                margin: [0, 5, 0, 5],
                                colSpan: 3
                            }, {}, {},
                            { text: "", border: [true, true, true, false] }
                        ],
                        [
                            { text: "CAIR", alignment: "center", bold: true, rowSpan: 3, border: [true, false, true, true] },
                            { text: "TRAINING FEEDBACK", alignment: "center", bold: true, margin: [0, 15, 0, 0], rowSpan: 3 },
                            { text: "Format No", fontSize: 8, alignment: "center" },
                            { text: "QSP060:FM02", fontSize: 7, alignment: 'center' },
                            { text: "QSP", alignment: "center", bold: true, rowSpan: 3, border: [true, false, true, true] }
                        ],
                        [
                            {}, {},
                            { text: 'Rev No', fontSize: 8, alignment: "center" },
                            { text: '01', fontSize: 7, alignment: "center" },
                            {}
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

            { text: "Feedback Form", alignment: "center", bold: true, margin: [0, 0, 0, 10] },

            {
                text: [
                    "1. Name & Designation : ",
                    {
                        text: reqData.participantName || "",
                        decoration: "underline"
                    }
                ],
                margin: [0, 3, 0, 3]
            },
            {
                text: [
                    "2. Division : ",
                    {
                        text: reqData.divisionName || "",
                        decoration: "underline"
                    }
                ],
                margin: [0, 3, 0, 3]
            },
            {
                text: [
                    "3. Requisition Number : ",
                    {
                        text: reqData.requisitionNumber || "",
                        decoration: "underline"
                    }
                ],
                margin: [0, 3, 0, 3]
            },
            {
                stack: [
                    {
                        text: "4. Title of course/tutorial/workshop/seminar/conference/symposium :"
                    },
                    {
                        text: reqData.courseName || "",
                        margin: [0, 3, 0, 0],
                        decoration: "underline"
                    }
                ],
                margin: [0, 3, 0, 3]
            },
            {
                text: [
                    "5. Organized by : ",
                    {
                        text: reqData.organizer || "",
                        decoration: "underline"
                    }
                ],
                margin: [0, 3, 0, 3]
            },
            {
                text: [
                    "6. Duration : ",
                    { text: reqData.programDuration || "", decoration: "underline" },
                    " days    From ",
                    { text: formatDate(reqData.fromDate) || "", decoration: "underline" },
                    "    To ",
                    { text: formatDate(reqData.toDate) || "", decoration: "underline" }
                ],
                margin: [0, 3, 0, 10]
            },

            {
                text: "(Tick in appropriate box - E: Excellent, VG: Very Good, G: Good, A: Average, P: Poor)",
                // fontSize: 9,
                margin: [0, 5, 0, 5]
            },

            { text: "(a) For Courses/Workshops/Tutorials:", bold: true, margin: [0, 5, 0, 5] },

            {
                table: {
                    widths: [35, "*", 25, 30, 25, 25, 25],
                    body: courseTableBody
                }
            },

            { text: "(b) For Conferences/Seminar/Symposium:", bold: true, margin: [0, 10, 0, 5] },

            {
                table: {
                    widths: [35, "*", 25, 30, 25, 25, 25],
                    body: confTableBody
                }
            },

            { text: "8. Any faculty suggested for In house lecture/course:", margin: [0, 10, 0, 5] },

            {
                table: {
                    widths: ["*", "*"],
                    body: [
                        [
                            { text: "Name & Designation", bold: true, alignment: "center" },
                            { text: "Address", bold: true, alignment: "center" }
                        ],
                        [
                            reqData.facultyName || "",
                            reqData.facultyAddress || ""
                        ]
                    ]
                }
            },

            { text: `9. Any other suggestion / Remarks : ${reqData.remark || ""}`, margin: [0, 10, 0, 10] },

            {
                columns: [
                    {
                        margin: [0, 30, 0, 0],
                        text: [
                            "Date: ",
                            {
                                text: formatDate(reqData.feedbackDate) || "",
                                decoration: "underline"
                            }
                        ]
                    },
                    {
                        alignment: "right",
                        margin: [0, 30, 0, 0],
                        stack: [
                            {
                                text: reqData.participantName || "",
                                bold: true,
                            },
                            {
                                text: "Signature of Participant",
                                margin: [0, 5, 0, 0]
                            }
                        ]
                    }
                ]
            },

            {
                text: "Note: Report of Evaluation of Effectiveness of Training in the format QSP060:FM04 to be sent to HRT after a trial period of three months on the job by the Division Head/AD.",
                margin: [0, 20, 0, 0],
                fontSize: 10
            }
        ]
    };

    pdfMake.createPdf(docDefinition).open();
};

export default FeedbackPrint;