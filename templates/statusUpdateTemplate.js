const statusUpdateTemplate = (
    name,
    title,
    status,
    priority
) => {
    return `
    <div style="font-family:Arial;padding:30px;background:#f4f4f4;">

        <div style="
            max-width:600px;
            margin:auto;
            background:white;
            border-radius:10px;
            padding:30px;
        ">

            <h1 style="color:#2563EB;">
                CampusOne
            </h1>

            <h2>
                Complaint Status Updated
            </h2>

            <p>Hello <b>${name}</b>,</p>

            <p>Your complaint has been updated.</p>

            <hr>

            <p>
                <b>Complaint :</b>
                ${title}
            </p>

            <p>
                <b>Status :</b>
                ${status}
            </p>

            <p>
                <b>Priority :</b>
                ${priority}
            </p>

            <hr>

            <p>
                Thank you for using CampusOne.
            </p>

            <p style="color:gray;font-size:14px;">
                This is an automated email.
            </p>

        </div>

    </div>
    `;
};

module.exports = statusUpdateTemplate;