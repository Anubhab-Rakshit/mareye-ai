import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Check if it's a contact form submission or data submission
    const isContactForm = data.firstName && data.lastName && data.message
    const isDataSubmission = data.name && data.email && data.institution && data.description

    if (!isContactForm && !isDataSubmission) {
      return NextResponse.json({ message: "Invalid form data" }, { status: 400 })
    }

    if (isContactForm) {
      // Handle contact form submission
      const { firstName, lastName, email, institution, message } = data
      
      console.log("=== NEW CONTACT FORM SUBMISSION ===")
      console.log(`Name: ${firstName} ${lastName}`)
      console.log(`Email: ${email}`)
      console.log(`Institution: ${institution}`)
      console.log(`Message: ${message}`)
      console.log("=====================================")
    } else {
      // Handle data submission
      const { name, email, institution, description, selectedTools, fileName, fileSize, fileType, fileBase64 } = data
      
      console.log("=== NEW DATA SUBMISSION ===")
      console.log(`Name: ${name}`)
      console.log(`Email: ${email}`)
      console.log(`Institution: ${institution}`)
      console.log(`Description: ${description}`)
      console.log(`Selected Tools: ${selectedTools?.map((t: any) => t.name).join(', ')}`)
      console.log(`File: ${fileName || 'None'} (${fileSize ? (fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'})`)
      console.log(`File Base64: ${fileBase64 ? 'Present' : 'Not provided'}`)
      console.log("=============================")
    }

    // Debug environment variables
    console.log("Available environment variables starting with EMAIL or GMAIL:")
    Object.keys(process.env).filter(key => 
      key.includes('EMAIL') || key.includes('GMAIL') || key.includes('MAIL')
    ).forEach(key => {
      console.log(`${key}: ${process.env[key] ? '[SET]' : '[NOT SET]'}`)
    })
    
    // Check for multiple possible environment variable names
    const gmailPassword = process.env.GMAIL_APP_PASSWORD || 
                         process.env.EMAIL_PASS || 
                         process.env.GMAIL_PASSWORD ||
                         process.env.EMAIL_PASSWORD ||
                         process.env.HOST_EMAIL_PASSWORD
    
    if (!gmailPassword) {
      console.log("Gmail app password not configured. Email content logged above.")
      console.log("Checked variables: GMAIL_APP_PASSWORD, EMAIL_PASS, GMAIL_PASSWORD, EMAIL_PASSWORD, HOST_EMAIL_PASSWORD")
      return NextResponse.json({ 
        message: "Form submitted successfully! The admin has been notified via console logs. Gmail app password not found in environment variables.",
      }, { status: 200 })
    }

    // Create transporter using Gmail SMTP with app password
    const hostEmail = process.env.HOST_EMAIL || 'aochuba52@gmail.com'
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: hostEmail,
        pass: gmailPassword
      }
    })

    // Create email content based on submission type
    let htmlContent = ""
    
    if (isContactForm) {
      const { firstName, lastName, email, institution, message } = data
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0891b2 100%); padding: 40px; border-radius: 20px; color: white;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #06b6d4, #3b82f6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
              💬
            </div>
            <h1 style="color: #06b6d4; margin: 0; font-size: 28px;">New Contact Message</h1>
            <p style="color: #94a3b8; margin: 10px 0 0; font-size: 16px;">AI Biodiversity Platform</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 15px; margin-bottom: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
            <h2 style="color: white; margin: 0 0 20px; font-size: 24px;">Contact Details</h2>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #06b6d4; margin: 0 0 10px; font-size: 18px;">Contact Information</h3>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #06b6d4; text-decoration: none;">${email}</a></p>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Institution:</strong> ${institution}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #06b6d4; margin: 0 0 10px; font-size: 18px;">Message</h3>
              <div style="background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 10px; border-left: 4px solid #06b6d4;">
                <p style="color: #cbd5e1; margin: 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; color: #94a3b8; font-size: 14px;">
            <p style="margin: 0;">© 2024 AI Biodiversity Platform. All rights reserved.</p>
            <p style="margin: 10px 0 0;">This is an automated notification from the contact system.</p>
          </div>
        </div>
      `
    } else {
      // Data submission
      const { name, email, institution, description, selectedTools, fileName, fileSize, fileType, fileBase64 } = data
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0891b2 100%); padding: 40px; border-radius: 20px; color: white;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #06b6d4, #3b82f6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
              📊
            </div>
            <h1 style="color: #06b6d4; margin: 0; font-size: 28px;">New Data Submission</h1>
            <p style="color: #94a3b8; margin: 10px 0 0; font-size: 16px;">AI Biodiversity Platform</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 15px; margin-bottom: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
            <h2 style="color: white; margin: 0 0 20px; font-size: 24px;">Data Submission Details</h2>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #06b6d4; margin: 0 0 10px; font-size: 18px;">Researcher Information</h3>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #06b6d4; text-decoration: none;">${email}</a></p>
              <p style="color: #cbd5e1; margin: 5px 0;"><strong>Institution:</strong> ${institution}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #06b6d4; margin: 0 0 10px; font-size: 18px;">Selected AI Tools</h3>
              <div style="background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 10px; border-left: 4px solid #06b6d4;">
                ${selectedTools?.map((tool: any) => `
                  <div style="margin-bottom: 10px; padding: 8px; background: rgba(6, 182, 212, 0.1); border-radius: 5px;">
                    <strong style="color: #06b6d4;">${tool.name}</strong>
                    <p style="color: #cbd5e1; margin: 5px 0 0; font-size: 14px;">${tool.description}</p>
                  </div>
                `).join('') || '<p style="color: #cbd5e1;">No tools selected</p>'}
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #06b6d4; margin: 0 0 10px; font-size: 18px;">Data Description</h3>
              <div style="background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 10px; border-left: 4px solid #06b6d4;">
                <p style="color: #cbd5e1; margin: 0; line-height: 1.6;">${description}</p>
              </div>
            </div>
            
            ${fileName ? `
              <div style="margin-bottom: 20px;">
                <h3 style="color: #06b6d4; margin: 0 0 10px; font-size: 18px;">Attached File</h3>
                <p style="color: #cbd5e1; margin: 5px 0;"><strong>Filename:</strong> ${fileName}</p>
                <p style="color: #cbd5e1; margin: 5px 0;"><strong>Size:</strong> ${(fileSize / 1024 / 1024).toFixed(2)} MB</p>
                <p style="color: #cbd5e1; margin: 5px 0;"><strong>Type:</strong> ${fileType}</p>
              </div>
            ` : ''}
            
            <div style="background: rgba(6, 182, 212, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #06b6d4; margin: 0 0 15px; font-size: 18px;">Next Steps</h3>
              <ul style="color: #cbd5e1; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Review the submitted data and credentials</li>
                <li style="margin-bottom: 8px;">Verify the researcher's identity and institution</li>
                <li style="margin-bottom: 8px;">Process data using selected AI tools</li>
                <li style="margin-bottom: 8px;">Contact the researcher if additional information is needed</li>
                <li style="margin-bottom: 8px;">Provide analysis results and recommendations</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; color: #94a3b8; font-size: 14px;">
            <p style="margin: 0;">© 2024 AI Biodiversity Platform. All rights reserved.</p>
            <p style="margin: 10px 0 0;">This is an automated notification from the data submission system.</p>
          </div>
        </div>
      `
    }

    // Create text content based on submission type
    let textContent = ""
    let subject = ""
    let replyTo = ""
    
    if (isContactForm) {
      const { firstName, lastName, email, institution, message } = data
      textContent = `
NEW CONTACT FORM SUBMISSION - OCEANOVA

Name: ${firstName} ${lastName}
Email: ${email}
Institution: ${institution}

Message:
${message}

---
This email was sent from the Oceanova contact form.
Reply directly to this email to respond to ${firstName}.
      `
      subject = `🌊 Contact Form: ${firstName} ${lastName} from ${institution}`
      replyTo = email
    } else {
      // Data submission
      const { name, email, institution, description, selectedTools, fileName, fileSize, fileType } = data
      textContent = `
NEW DATA SUBMISSION - OCEANOVA

Researcher: ${name}
Email: ${email}
Institution: ${institution}

Selected AI Tools:
${selectedTools?.map((tool: any) => `- ${tool.name}: ${tool.description}`).join('\n') || 'None'}

Data Description:
${description}

${fileName ? `Attached File: ${fileName} (${fileSize ? (fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size'}, ${fileType || 'Unknown type'})` : 'No file attached'}

---
This email was sent from the Oceanova data submission system.
Reply directly to this email to respond to ${name}.
The file is attached to this email and can be downloaded.
      `
      subject = `📊 Data Submission: ${name} (${selectedTools?.length || 0} AI Tools)`
      replyTo = email
    }

    // Prepare email options
    const mailOptions: any = {
      from: `"Oceanova Platform" <${hostEmail}>`,
      to: 'aochuba52@gmail.com',
      replyTo: replyTo, // Allow direct reply to the sender
      subject: subject,
      text: textContent,
      html: htmlContent
    }

    // Add file attachment if present (for data submissions)
    if (!isContactForm && data.fileBase64 && data.fileName) {
      const fileBuffer = Buffer.from(data.fileBase64.split(',')[1], 'base64')
      mailOptions.attachments = [{
        filename: data.fileName,
        content: fileBuffer,
        contentType: data.fileType || 'application/octet-stream'
      }]
    }

    await transporter.sendMail(mailOptions)
    
    console.log("Email sent successfully to aochuba52@gmail.com")

    return NextResponse.json({ 
      message: "Message sent successfully! We'll get back to you soon.",
    }, { status: 200 })

  } catch (error) {
    console.error("Error sending email:", error)
    
    // Still log the message even if email fails
    console.log("Email failed but message logged for manual processing")
    
    return NextResponse.json(
      { message: "Message received! There was an issue with email delivery, but your message has been logged and we'll respond soon." },
      { status: 200 }
    )
  }
}
