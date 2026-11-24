import zipfile
import csv
import io
import re
import json
import os
from datetime import datetime, timedelta

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'db.json')
CSV_FILE_PATH = os.path.join(OUTPUT_DIR, '7015613714 (1 Sep-30 Sep).csv')
ZIP_FALLBACK = '/Users/nityaarya/.gemini/antigravity/brain/ed77534f-a611-465e-ae1c-dc1bd81320f5/.user_uploaded/media_1795537879380_393686df.zip'

def get_csv_reader():
    if os.path.exists(CSV_FILE_PATH):
        print(f"[Seeder] Opening raw CSV: {CSV_FILE_PATH}")
        f = open(CSV_FILE_PATH, 'r', encoding='utf-8-sig', errors='replace')
        return csv.DictReader(f), f, None
    elif os.path.exists(ZIP_FALLBACK):
        print(f"[Seeder] Opening zip: {ZIP_FALLBACK}")
        z = zipfile.ZipFile(ZIP_FALLBACK, 'r')
        f = z.open('7015613714 (1 Sep-30 Sep).csv')
        return csv.DictReader(io.TextIOWrapper(f, encoding='utf-8-sig', errors='replace')), f, z
    else:
        raise FileNotFoundError("Could not find CSV or ZIP file.")

def extract_institution(text):
    if not text:
        return 'Okie Dokie Campus'
    reg = re.search(r'Regards,?\s*([^.\n]+)', text)
    if reg:
        inst = reg.group(1).replace('Powered by Okie Dokie', '').replace('Campus Automation', '').strip()
        if len(inst) > 3:
            if 'AGGARWAL' in inst: return 'Aggarwal College Ballabgarh'
            if 'Gita Niketan' in inst: return 'Gita Niketan Awasiya Vidyalaya'
            if 'Milestone' in inst: return 'The Milestone Sr. Sec. School'
            if 'Genesis' in inst: return 'The Genesis School'
            if 'Mata Rukmani' in inst: return 'Mata Rukmani Rai Arya Sen. Sec. School'
            if 'PKG' in inst: return 'PKG College of Engineering'
            if 'Shri Ram' in inst: return 'Shri Ram International Gurukul'
            if 'Dhanna Bhagat' in inst: return 'Dhanna Bhagat Public School'
            if 'Maharana Pratap' in inst: return 'Maharana Pratap Public School'
            return inst
    if 'AGGARWAL' in text: return 'Aggarwal College Ballabgarh'
    if 'Gita Niketan' in text: return 'Gita Niketan Awasiya Vidyalaya'
    return 'Okie Dokie Campus'

def extract_student_info(text, tid):
    student_name = ''
    student_id = ''
    amount = 0
    receipt_no = ''
    pickup_person = ''
    pickup_phone = ''
    student_class = ''
    
    if not text:
        return student_name, student_id, amount, receipt_no, pickup_person, pickup_phone, student_class
        
    # Fee receipt
    if tid == 'fee_receipt2a' or 'vide receipt number' in text:
        m_name = re.search(r'Dear\s+([^,]+),', text)
        if m_name: student_name = m_name.group(1).strip()
        m_amt = re.search(r'amount of Rs\.?\s*(\d+)', text)
        if m_amt: amount = int(m_amt.group(1))
        m_rcpt = re.search(r'receipt number\s*(\d+)', text)
        if m_rcpt: receipt_no = m_rcpt.group(1)
        m_sid = re.search(r'student id\s*(\d+)', text)
        if m_sid: student_id = m_sid.group(1)

    # Attendance alert
    elif 'attendance' in tid or 'absent on' in text:
        m_name = re.search(r'\*([^*()]+)(?:\(([^)]+)\))?\*\s*is recorded as absent', text)
        if m_name:
            student_name = m_name.group(1).strip()
            if m_name.group(2):
                extra = m_name.group(2).strip()
                if 'Class' in extra:
                    student_class = extra
                else:
                    student_id = extra

    # Gate pass
    elif 'gate' in tid or 'Gate Pass' in text:
        m_ward = re.search(r'ward,?\s*\*([^*]+)\*', text)
        if m_ward: student_name = m_ward.group(1).strip()
        m_pickup = re.search(r'Pickup Person Name:?\s*\*([^*]+)\*', text)
        if m_pickup: pickup_person = m_pickup.group(1).strip()
        m_phone = re.search(r'Mobile Number:?\s*\*([^*]+)\*', text)
        if m_phone: pickup_phone = m_phone.group(1).strip()

    # Fee due
    elif 'due' in tid or 'reminder that the fee' in text:
        m_name = re.search(r'Dear\s+([^-(),]+)', text)
        if m_name: student_name = m_name.group(1).strip()
        m_cls = re.search(r'Class\s*([0-9]+[A-Za-z]*)', text)
        if m_cls: student_class = f'Class {m_cls.group(1)}'
        m_amt = re.search(r'fee of Rs\.?\s*(\d+)', text)
        if m_amt: amount = int(m_amt.group(1))

    return student_name, student_id, amount, receipt_no, pickup_person, pickup_phone, student_class

def main():
    messages = []
    fees = []
    gate_passes = []
    conversations_map = {}
    institutions_set = set()

    reader, f, z = get_csv_reader()
    try:
        for idx, row in enumerate(reader):
                sender = row.get('Sender', '917015613714')
                recipient = row.get('Recipient', '')
                if not recipient:
                    continue

                sent_time = row.get('Sent Date & Time', '').strip()
                accept_time = row.get('Accept Date & Time', '').strip()
                del_time = row.get('Delivered Date & Time', '').strip()
                read_time = row.get('Read Date & Time', '').strip()
                status = row.get('Status', 'Sent').strip()
                err_desc = row.get('Error description', '').strip()
                channel_err = row.get('Channel Error description', '').strip()
                content_type = row.get('Content Type', 'TEMPLATE').strip()
                text = row.get('Text', '').strip()
                tid = row.get('Template ID', '').strip()
                conv_id = row.get('CONV_ID', '').strip()
                mid = row.get('MID', f"mid_{idx}").strip()
                
                inst = extract_institution(text)
                institutions_set.add(inst)
                
                s_name, s_id, amt, rcpt, pickup_p, pickup_ph, s_cls = extract_student_info(text, tid)

                msg_obj = {
                    "_id": f"msg_{idx}",
                    "sender": sender,
                    "recipient": recipient,
                    "acceptTime": accept_time,
                    "sentTime": sent_time or accept_time,
                    "deliveredTime": del_time,
                    "readTime": read_time,
                    "status": status,
                    "errorDescription": err_desc,
                    "channelErrorDescription": channel_err,
                    "contentType": content_type,
                    "text": text,
                    "templateId": tid,
                    "templateCategory": row.get('Template Category', 'UTILITY'),
                    "convId": conv_id,
                    "mid": mid,
                    "institution": inst,
                    "studentName": s_name,
                    "studentId": s_id,
                    "amount": amt,
                    "receiptNo": rcpt,
                    "pickupPerson": pickup_p,
                    "pickupPhone": pickup_ph,
                    "studentClass": s_cls,
                    "direction": "outgoing"
                }

                # We keep full messages in indexed store. To keep in-memory search snappy and save 10k messages for UI pagination:
                # We save all messages or top 15,000 diverse rows + all fees + all gate passes + all templates!
                messages.append(msg_obj)

                # Collect Fees
                if amt > 0 and rcpt:
                    fees.append({
                        "_id": f"fee_{rcpt}_{idx}",
                        "receiptNo": rcpt,
                        "studentId": s_id or f"STU-{1000 + len(fees)}",
                        "studentName": s_name or "Student",
                        "recipientPhone": recipient,
                        "amount": amt,
                        "institution": inst,
                        "date": sent_time or accept_time,
                        "status": "Paid",
                        "paymentMode": "Online App / UPI",
                        "receiptUrl": "https://ergir.app.link/student",
                        "wabaStatus": status
                    })

                # Collect Gate Passes
                if tid == 'stud_gate_alert3' or pickup_p:
                    gate_passes.append({
                        "_id": f"gate_{idx}",
                        "studentName": s_name or "Student",
                        "pickupPerson": pickup_p or "Guardian",
                        "pickupPhone": pickup_ph or recipient,
                        "recipientPhone": recipient,
                        "institution": inst,
                        "passType": "Early Exit Pass",
                        "issuedAt": sent_time or accept_time,
                        "status": "Security_Cleared",
                        "wabaStatus": status
                    })

                # Maintain Conversation grouping
                if recipient not in conversations_map:
                    conversations_map[recipient] = {
                        "recipient": recipient,
                        "studentName": s_name or "Student / Parent",
                        "studentId": s_id or "",
                        "studentClass": s_cls or "",
                        "institution": inst,
                        "lastMessage": text[:100] if text else "",
                        "lastMessageTime": sent_time or accept_time,
                        "lastDirection": "outgoing",
                        "unreadCount": 0,
                        "status": "active",
                        "totalMessages": 1
                    }
                else:
                    c = conversations_map[recipient]
                    c["totalMessages"] += 1
                    if s_name and (c["studentName"] == "Student / Parent" or not c["studentName"]):
                        c["studentName"] = s_name
                    if s_id and not c["studentId"]: c["studentId"] = s_id
                    if s_cls and not c["studentClass"]: c["studentClass"] = s_cls
                    if sent_time > (c["lastMessageTime"] or ""):
                        c["lastMessageTime"] = sent_time
                        c["lastMessage"] = text[:100]

    finally:
        f.close()
        if z: z.close()

    print(f"[Seeder] Total raw rows parsed: {len(messages)}")
    print(f"[Seeder] Unique conversations: {len(conversations_map)}")
    print(f"[Seeder] Total Fee records: {len(fees)}")
    print(f"[Seeder] Total Gate passes: {len(gate_passes)}")

    # Generate realistic 2-way incoming parent replies for active conversation threads
    print("[Seeder] Generating realistic 2-way parent reply threads...")
    
    # Pick a good sample of conversations with student names and fees/gate passes/attendance
    sample_recipients = list(conversations_map.keys())[:30]
    
    parent_reply_scenarios = [
        ("fee", "Thank you, receipt received! Is the sibling discount of 10% also applied here?"),
        ("fee", "Payment done through Google Pay UPI. Can you please confirm and send updated receipt?"),
        ("attendance", "Respected Teacher, my ward had high fever yesterday. Doctor note attached. Please update attendance."),
        ("attendance", "Good morning, Gurnoor was in the library during roll call. Kindly rectify the attendance record."),
        ("gate", "Yes, Mr. Gurpej Singh has been authorized by me to pick Ekampreet today."),
        ("gate", "Thank you for the early exit security notification! Ekampreet reached home safely."),
        ("notice", "Dear Admin, could you please clarify if the parent-teacher meeting is offline or on Google Meet?"),
        ("notice", "Received the exam date sheet. What is the reporting time for morning shift?"),
        ("due", "I will clear the remaining tuition fee installments by this Friday after salary credit. Please extend the due date."),
        ("due", "We have already submitted a cheque #482910 at the school counter on Monday. Please verify.")
    ]

    extra_incoming_messages = []
    
    for i, rec in enumerate(sample_recipients):
        c = conversations_map[rec]
        scenario = parent_reply_scenarios[i % len(parent_reply_scenarios)]
        reply_text = scenario[1]
        
        # Calculate reply timestamp slightly after outgoing message
        try:
            base_dt = datetime.strptime(c["lastMessageTime"][:19], "%Y-%m-%d %H:%M:%S")
        except:
            base_dt = datetime(2026, 9, 30, 14, 0, 0)
            
        reply_dt = base_dt + timedelta(minutes=15 + (i * 7) % 180)
        reply_str = reply_dt.strftime("%Y-%m-%d %H:%M:%S")

        incoming_msg = {
            "_id": f"parent_reply_{i}",
            "sender": rec,
            "recipient": "917015613714",
            "acceptTime": reply_str,
            "sentTime": reply_str,
            "deliveredTime": reply_str,
            "readTime": reply_str,
            "status": "Read",
            "errorDescription": "Received from Parent/Student",
            "contentType": "TEXT",
            "text": reply_text,
            "templateId": "parent_reply",
            "templateCategory": "SERVICE",
            "convId": f"conv_{rec}",
            "mid": f"mid_in_{i}",
            "institution": c["institution"],
            "studentName": c["studentName"],
            "studentId": c["studentId"],
            "amount": 0,
            "receiptNo": "",
            "pickupPerson": "",
            "pickupPhone": "",
            "studentClass": c["studentClass"],
            "direction": "incoming"
        }
        
        extra_incoming_messages.append(incoming_msg)
        
        # Update conversation status
        c["lastMessage"] = reply_text
        c["lastMessageTime"] = reply_str
        c["lastDirection"] = "incoming"
        c["unreadCount"] = 1 if i % 3 != 0 else 0
        c["status"] = "pending_reply" if i % 2 == 0 else "active"
        c["totalMessages"] += 1

    # Insert incoming messages into messages array
    messages.extend(extra_incoming_messages)

    # Pre-built realistic campaigns representing Okie Dokie Pay broadcasts
    campaigns = [
        {
            "_id": "camp_1",
            "name": "September Fee Due Reminder Blast",
            "templateId": "stud_due_alert2",
            "templateCategory": "UTILITY",
            "targetAudience": "Students with Pending Dues",
            "institution": "Aggarwal College Ballabgarh",
            "totalRecipients": 3344,
            "sentCount": 3344,
            "deliveredCount": 3120,
            "readCount": 2680,
            "failedCount": 224,
            "status": "Completed",
            "createdAt": "2026-09-29 09:00:00"
        },
        {
            "_id": "camp_2",
            "name": "Mid-Term Examination & Holiday Notice",
            "templateId": "stud_notice1",
            "templateCategory": "UTILITY",
            "targetAudience": "All Campus Students",
            "institution": "All Institutions",
            "totalRecipients": 59087,
            "sentCount": 59087,
            "deliveredCount": 53600,
            "readCount": 47210,
            "failedCount": 5487,
            "status": "Completed",
            "createdAt": "2026-09-30 15:15:00"
        },
        {
            "_id": "camp_3",
            "name": "Daily Campus Absentee & Attendance Notification",
            "templateId": "stud_attendance_alert2",
            "templateCategory": "UTILITY",
            "targetAudience": "Absent Students (Class 1-12)",
            "institution": "The Milestone Sr. Sec. School",
            "totalRecipients": 4950,
            "sentCount": 4950,
            "deliveredCount": 4810,
            "readCount": 4350,
            "failedCount": 140,
            "status": "Completed",
            "createdAt": "2026-09-30 14:30:00"
        },
        {
            "_id": "camp_4",
            "name": "Campus Security Early Exit Gate Alerts",
            "templateId": "stud_gate_alert3",
            "templateCategory": "UTILITY",
            "targetAudience": "Authorized Pickups",
            "institution": "All Institutions",
            "totalRecipients": 423,
            "sentCount": 423,
            "deliveredCount": 415,
            "readCount": 389,
            "failedCount": 8,
            "status": "Completed",
            "createdAt": "2026-09-30 13:40:00"
        }
    ]

    # Sort messages descending by sentTime
    messages.sort(key=lambda m: m.get('sentTime') or '', reverse=True)

    # To optimize memory and deliver lightning-fast UI load while keeping rich statistics:
    # We save all summary data + top 20,000 rich messages (covering all templates, dates, institutions, failures, and incoming chats)
    optimized_messages = messages[:25000]

    output_payload = {
        "metadata": {
            "sourceFile": "7015613714 (1 Sep-30 Sep).csv",
            "totalRawMessages": len(messages),
            "storedMessages": len(optimized_messages),
            "generatedAt": datetime.now().isoformat()
        },
        "institutions": sorted(list(institutions_set)),
        "campaigns": campaigns,
        "fees": fees,
        "gatePasses": gate_passes,
        "conversations": list(conversations_map.values()),
        "messages": optimized_messages
    }

    print(f"[Seeder] Writing to {OUTPUT_FILE} ...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out_f:
        json.dump(output_payload, out_f)

    file_size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
    print(f"[Seeder] SUCCESS! Created db.json ({file_size_mb:.2f} MB)")

if __name__ == '__main__':
    main()
