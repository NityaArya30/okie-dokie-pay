const express = require('express');
const router = express.Router();

router.post('/suggest-reply', (req, res) => {
  try {
    const { lastMessage, studentName, institution, templateId } = req.body;
    const msg = (lastMessage || '').toLowerCase();
    
    let suggestions = [];

    if (msg.includes('fee') || msg.includes('receipt') || msg.includes('upi') || msg.includes('payment') || templateId === 'fee_receipt2a' || templateId === 'stud_due_alert2') {
      suggestions = [
        `Dear Parent, thank you for confirming. We have verified your transaction and your updated receipt is available on the Okie Dokie Students app: https://ergir.app.link/student`,
        `Dear Parent, we have noted your request. Please allow 24-48 hours for bank reconciliation. Regards, ${institution || 'Accounts Office'}.`,
        `Dear Parent, your fee extension request till this Friday has been approved by the management. Kindly complete the payment via the student portal.`
      ];
    } else if (msg.includes('absent') || msg.includes('fever') || msg.includes('sick') || msg.includes('doctor') || templateId?.includes('attendance')) {
      suggestions = [
        `Dear Parent, thank you for informing us regarding ${studentName || 'your ward'}'s health. The medical leave has been marked in the campus ERP. Wishing a speedy recovery!`,
        `Dear Parent, please ask ${studentName || 'the student'} to submit the doctor's prescription to the class teacher upon resuming classes.`,
        `Attendance record has been corrected. Thank you for notifying us.`
      ];
    } else if (msg.includes('gate') || msg.includes('pickup') || msg.includes('pass') || templateId === 'stud_gate_alert3') {
      suggestions = [
        `Dear Parent, thank you for the confirmation. The campus security gate has been instructed to clear the exit pass upon verifying the guardian's ID card.`,
        `Exit pass confirmed. Student has safely departed with the authorized guardian.`
      ];
    } else {
      suggestions = [
        `Dear Parent, thank you for reaching out to ${institution || 'Campus Support'}. We have noted your query and our team will get back to you shortly.`,
        `Dear Student/Parent, please check the official student mobile app for notices, attendance, and exam date sheets.`,
        `Thank you for confirming. If you need any further assistance, feel free to message here.`
      ];
    }

    res.json({ success: true, data: suggestions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
