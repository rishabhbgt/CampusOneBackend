const complaintStatusTemplate = (
    name,
    title,
    status
) => {

    return `
        <div style="font-family: Arial, sans-serif; padding:20px;">
            <h2 style="color:#2563eb;">
                CampusOne Administration
            </h2>

            <p>Dear <b>${name}</b>,</p>

            <p>
                Your complaint status has been updated.
            </p>

            <hr>

            <p>
                <b>Complaint:</b> ${title}
            </p>

            <p>
                <b>New Status:</b> ${status}
            </p>

            <hr>

            <p>
                Thank you for using CampusOne.
            </p>

            <p>
                Regards,<br>
                CampusOne Administration
            </p>
        </div>
    `;
};

module.exports = complaintStatusTemplate;