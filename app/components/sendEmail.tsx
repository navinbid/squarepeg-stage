export const sendEmail = async (
  formData,
  recipientEmail,
  fullName,
  typeofbusiness,
  phoneNumber,
  taxexempt,
  companyName,
  companyAddress,
  city,
  state,
  zipCode,
  numberemployees,
  role,
  env
) => {
  const sendEmailData = {
    personalizations: [
      {
        to: [
          {
            email: env.PRO_BENEFITS_EMAIL,
          },
        ],
        subject: 'Application for Pro Benefits Email',
      },
    ],
    content: [
      {
        type: 'text/html',
        value: `
            <p>Hello ${fullName},</p>
            <p>Application for Pro Benefits details:</p>
            <table border="1">
              <tr>
                <th>Email</th>
                <td>${recipientEmail}</td>
              </tr>
              <tr>
                <th>Full Name</th>
                <td>${fullName}</td>
              </tr>
              <tr>
                <th>Type of Business</th>
                <td>${typeofbusiness}</td>
              </tr>
              <tr>
                <th>Phone Number</th>
                <td>${phoneNumber}</td>
              </tr>
              <tr>
                <th>Tax Exempt</th>
                <td>${taxexempt}</td>
              </tr>
              <tr>
                <th>Company Name</th>
                <td>${companyName}</td>
              </tr>
              <tr>
                <th>Company Address</th>
                <td>${companyAddress}</td>
              </tr>
              <tr>
                <th>City</th>
                <td>${city}</td>
              </tr>
              <tr>
                <th>State</th>
                <td>${state}</td>
              </tr>
              <tr>
                <th>Zip Code</th>
                <td>${zipCode}</td>
              </tr>
              <tr>
                <th>Number of Employees</th>
                <td>${numberemployees}</td>
              </tr>
              <tr>
                <th>Role</th>
                <td>${role}</td>
              </tr>
            </table>
            <p>Thanks & Regards,</p>
            <p>Square Peg</p>
            <p>squarepegsupply.com</p>
          `
      },
    ],
    from: {
      email: env.PRO_BENEFITS_SENDER_EMAIL,
      name: env.PRO_BENEFITS_SENDER_NAME,
    },
  };
  const sendGridApiKey = env.SENDGRID_API_KEY;

  const fileContent = formData.get('fileContent');
  const taxExamptDoc = formData.get('taxexamptdoc');

  if (fileContent) {
    sendEmailData.attachments = [
      {
        content: fileContent,
        filename: taxExamptDoc,
        type: formData.get('fileType'),
        disposition: 'attachment',
        encoding: 'base64',
      },
    ];
  }

  const url = 'https://api.sendgrid.com/v3/mail/send';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendEmailData),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Email sent successfully:', responseData);
      return true; // Return true if the email is sent successfully
    } else {
      console.error('Failed to send email:', response.statusText);
      return false; // Return false if there is an error
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false; // Return false if there is an error
  }
};
