document.addEventListener("DOMContentLoaded", async function () {

const documentForm =
    document.getElementById("documentForm");

const documentList =
    document.getElementById("documentList");

const documentFile =
    document.getElementById("documentFile");

const token =
    localStorage.getItem("lifeosToken");


if (!token) {

    if (documentList) {
        documentList.innerHTML = `
            <div class="empty-message">
                <p>🔐 Please login first.</p>
            </div>
        `;
    }

    return;
}


// ================= LOAD DOCUMENTS =================

async function loadDocuments() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/documents",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load documents"
            );

        }


        displayDocuments(
            data.documents || data
        );


    } catch (error) {

        console.error(
            "LOAD DOCUMENTS ERROR:",
            error
        );


        documentList.innerHTML = `
            <div class="empty-message">
                <p>Unable to load documents.</p>
                <p>Please check the backend.</p>
            </div>
        `;

    }

}


// ================= DISPLAY DOCUMENTS =================

function displayDocuments(documents) {

    if (!documentList) {
        return;
    }


    documentList.innerHTML = "";


    if (!documents || documents.length === 0) {

        documentList.innerHTML = `
            <div class="empty-message">
                <p>📁 No documents added yet.</p>
                <p>Add your important documents above.</p>
            </div>
        `;

        return;
    }


    documents.forEach(function(doc) {

        const expiryStatus =
            getExpiryStatus(
                doc.expiryDate
            );


        const card =
            document.createElement("div");


        card.className =
            "document-card";


        card.innerHTML = `

            <div class="document-icon">
                📄
            </div>


            <div class="document-info">

                <h3>
                    ${doc.name}
                </h3>

                <p>
                    ${doc.category}
                </p>

                <span class="${expiryStatus.className}">
                    ${expiryStatus.text}
                </span>

                ${
                    doc.fileName
                    ? `
                        <p class="file-name">
                            📎 ${doc.fileName}
                        </p>

                        <button
                            class="view-button"
                            data-id="${doc._id}">

                            👁 View Document

                        </button>

                        <button
                            class="download-button"
                            data-id="${doc._id}">

                            📥 Download

                        </button>
                      `
                    : ""
                }

            </div>


            <div class="document-date">

                <strong>
                    Expiry
                </strong>

                <span>
                    ${new Date(doc.expiryDate).toLocaleDateString()}
                </span>


                <button
                    class="delete-button"
                    data-id="${doc._id}">

                    Delete

                </button>

            </div>

        `;


        // ================= VIEW DOCUMENT =================

        const viewButton =
            card.querySelector(
                ".view-button"
            );


        if (viewButton) {

            viewButton.addEventListener(
                "click",
                async function () {

                    try {

                        const response =
                            await fetch(
                                "http://localhost:5000/api/documents/file/" +
                                doc._id,
                                {
                                    method: "GET",

                                    headers: {
                                        "Authorization":
                                            "Bearer " + token
                                    }
                                }
                            );


                        if (!response.ok) {

                            throw new Error(
                                "Unable to open document"
                            );

                        }


                        const blob =
                            await response.blob();


                        const fileURL =
                            URL.createObjectURL(
                                blob
                            );


                        window.open(
                            fileURL,
                            "_blank"
                        );


                    } catch (error) {

                        console.error(
                            "VIEW DOCUMENT ERROR:",
                            error
                        );


                        alert(
                            "Unable to open document."
                        );

                    }

                }
            );

        }


        // ================= DOWNLOAD DOCUMENT =================

        const downloadButton =
            card.querySelector(
                ".download-button"
            );


        if (downloadButton) {

            downloadButton.addEventListener(
                "click",
                async function () {

                    try {

                        const response =
                            await fetch(
                                "http://localhost:5000/api/documents/download/" +
                                doc._id,
                                {
                                    method: "GET",

                                    headers: {
                                        "Authorization":
                                            "Bearer " + token
                                    }
                                }
                            );


                        if (!response.ok) {

                            throw new Error(
                                "Unable to download document"
                            );

                        }


                        const blob =
                            await response.blob();


                        const fileURL =
                            URL.createObjectURL(
                                blob
                            );


                        const link =
                            document.createElement(
                                "a"
                            );


                        link.href =
                            fileURL;


                        link.download =
                            doc.fileName ||
                            "document";


                        document.body.appendChild(
                            link
                        );


                        link.click();


                        link.remove();


                        URL.revokeObjectURL(
                            fileURL
                        );


                    } catch (error) {

                        console.error(
                            "DOWNLOAD DOCUMENT ERROR:",
                            error
                        );


                        alert(
                            "Unable to download document."
                        );

                    }

                }
            );

        }


        // ================= DELETE BUTTON =================

        const deleteButton =
            card.querySelector(
                ".delete-button"
            );


        deleteButton.addEventListener(
            "click",
            function() {

                deleteDocument(
                    doc._id,
                    doc.name
                );

            }
        );


        documentList.appendChild(card);

    });

}


// ================= ADD DOCUMENT =================

if (documentForm) {

    documentForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "documentName"
                    )
                    .value
                    .trim();


            const category =
                document
                    .getElementById(
                        "documentCategory"
                    )
                    .value;


            const expiryDate =
                document
                    .getElementById(
                        "documentExpiry"
                    )
                    .value;


            const selectedFile =
                documentFile
                    ? documentFile.files[0]
                    : null;


            // ================= VALIDATION =================

            if (
                !name ||
                !category ||
                !expiryDate
            ) {

                alert(
                    "Please fill all fields."
                );

                return;

            }


            // ================= FILE VALIDATION =================

            if (!selectedFile) {

                alert(
                    "Please select a document file."
                );

                return;

            }


            const allowedTypes = [
                "application/pdf",
                "image/jpeg",
                "image/png"
            ];


            if (
                !allowedTypes.includes(
                    selectedFile.type
                )
            ) {

                alert(
                    "Only PDF, JPG and PNG files are allowed."
                );

                return;

            }


            // Maximum 10 MB

            if (
                selectedFile.size >
                10 * 1024 * 1024
            ) {

                alert(
                    "File size must be less than 10 MB."
                );

                return;

            }


            try {

                // ================= FORM DATA =================

                const formData =
                    new FormData();


                formData.append(
                    "name",
                    name
                );


                formData.append(
                    "category",
                    category
                );


                formData.append(
                    "expiryDate",
                    expiryDate
                );


                formData.append(
                    "documentFile",
                    selectedFile
                );


                // ================= UPLOAD =================

                const response =
                    await fetch(
                        "http://localhost:5000/api/documents",
                        {
                            method: "POST",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            },

                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to upload document"
                    );

                }


                alert(
                    "Document '" +
                    name +
                    "' uploaded successfully! ✅"
                );


                documentForm.reset();


                await loadDocuments();


            } catch (error) {

                console.error(
                    "UPLOAD DOCUMENT ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to upload document."
                );

            }

        }
    );

}


// ================= DELETE DOCUMENT =================

async function deleteDocument(
    id,
    name
) {

    const confirmDelete =
        confirm(
            "Delete '" +
            name +
            "'?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/documents/" +
                id,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete document"
            );

        }


        alert(
            "Document deleted successfully!"
        );


        await loadDocuments();


    } catch (error) {

        console.error(
            "DELETE DOCUMENT ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to delete document."
        );

    }

}


// ================= EXPIRY STATUS =================

function getExpiryStatus(expiryDate) {

    const today =
        new Date();


    const expiry =
        new Date(expiryDate);


    today.setHours(
        0,
        0,
        0,
        0
    );


    expiry.setHours(
        0,
        0,
        0,
        0
    );


    const difference =
        expiry - today;


    const daysLeft =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    if (daysLeft < 0) {

        return {
            text: "Expired",
            className: "expired"
        };

    }


    if (daysLeft <= 30) {

        return {
            text:
                daysLeft +
                " days left",

            className:
                "expiring"
        };

    }


    return {

        text:
            daysLeft +
            " days left",

        className:
            "valid"
    };

}


// ================= INITIAL LOAD =================

loadDocuments();

});
