export const generatePasswordResetEmail = (
  userName: string,
  resetCode: string
) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
  
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
  
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  padding: 40px 50px;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
  
              .header {
                  text-align: center;
                  padding: 10px 0;
                  font-size: 30px;
                  font-weight: bold;
                  color: #333333;
              }
  
              .content {
                  margin: 20px 0;
              }
  
              .content div {
                  text-align: justify;
              }
  
              .content h1 {
                  color: #333333;
              }
  
              .content p {
                  font-size: 16px;
                  color: #555555;
                  line-height: 1.8;
              }
  
              .content span {
                  display: inline-block;
                  width: 50px;
              }
  
              .code {
                  display: block;
                  width: fit-content;
                  margin: 30px auto 40px;
                  text-align: center;
                  background-color: #c0c0c0cb;
                  color: black;
                  padding: 12px 24px;
                  border-radius: 5px;
                  font-size: 24px;
                  font-weight: bold;
                  letter-spacing: 5px;
                  transition: background-color 0.3s ease, transform 0.3s ease;
                  cursor: pointer;
                  letter-spacing: 10px;
              }
  
              .code:hover {
                  background-color: #c0c0c0;
              }
  
              .footer {
                  text-align: center;
                  font-size: 14px;
                  color: #000000e2;
                  margin-top: 20px;
              }
  
              
          </style>
      </head>
  
      <body>
          <div class="container">
              <div class="header">
                  Oderie
              </div>
              <div class="content">
                  <h3>Password Reset Request</h2>
                      <div>
                          <p>Hello, <strong> ${userName} </strong></p>
                          <p> <span></span> We received a request to reset your password for your Oderie account.
                              Use the 6-digit code below to reset your password.
                              If you did not request this, please ignore this email.</p>
                          <div class="code" id="resetCode">${resetCode}</div>
                          <p>*The code will expire in 10 minutes.</p>
                      </div>
              </div>
              <div class="footer">
                  <p>&copy; 2024 Oderie. All rights reserved.</p>
              </div>
          </div>
  
  
          
      </body>
  
      </html>
      `;
};

export const generateSendContactEmail = (
  userName: string,
  userEmail: string,
  message: string
) => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contact Form Message</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
    
            p {
              color: #000000;
              font-size: 16px;
              margin-bottom: 10px;
            }
    
            strong {
              font-weight: bold;
            }
    
            section {
              background-color: #f0f0f0;
              padding: 30px 40px;
              margin-bottom: 10px;
            }
    
            div{
              padding : 0 20px;
            }
          </style>
        </head>
        <body>
          <section>
            <p>User Name: <strong>${userName}</strong></p>
            <p>User Email: <strong>${userEmail}</strong></p>
            <p>Message:</p>
            <div>
              <p>${message}</p>
            </div>
          </section>
        </body>
        </html>
      `;
};
