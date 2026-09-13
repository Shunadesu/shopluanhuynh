import Imap from 'imap';
import { simpleParser } from 'mailparser';
import mongoose from 'mongoose';
import DepositRequest from '../models/DepositRequest.js';
import User from '../models/User.js';
import { calculateSpinsAwarded } from '../utils/spinLogic.js';

class EmailChecker {
  constructor() {
    this.imap = null;
    this.isChecking = false;
    this.checkInterval = 30000; // 30 giây
    this.intervalId = null;
    this.isEnabled = false;
  }

  async start() {
    console.log('📧 Email checker service initialized');
    
    // Check và schedule dựa trên pending deposits
    await this.checkAndSchedule();
  }

  async hasActivePendingDeposits() {
    try {
      const count = await DepositRequest.countDocuments({ 
        status: 'pending',
        depositMethod: 'bank'
      });
      return count > 0;
    } catch (error) {
      console.error('❌ Error checking pending deposits:', error.message);
      return false;
    }
  }

  async checkAndSchedule() {
    const hasPending = await this.hasActivePendingDeposits();
    const pendingCount = await DepositRequest.countDocuments({ 
      status: 'pending',
      depositMethod: 'bank'
    });

    console.log(`📊 Pending bank deposits: ${pendingCount}`);

    if (hasPending && !this.isEnabled) {
      // Có pending deposits và checker đang tắt → bật lên
      console.log('✅ Active deposits found - Email checker enabled');
      this.enable();
    } else if (!hasPending && this.isEnabled) {
      // Không còn pending và checker đang bật → tắt đi
      console.log('⏸️  No active deposits - Email checker paused');
      this.disable();
    } else if (hasPending && this.isEnabled) {
      console.log('🔄 Email checker already running');
    } else {
      console.log('⏸️  Email checker paused - waiting for deposits');
    }
  }

  enable() {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    
    // Check ngay lập tức
    this.checkEmailsAndExpired();
    
    // Check định kỳ mỗi 30s
    this.intervalId = setInterval(() => {
      if (!this.isChecking) {
        this.checkEmailsAndExpired();
      }
    }, this.checkInterval);
  }

  disable() {
    if (!this.isEnabled) return;
    
    this.isEnabled = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkEmailsAndExpired() {
    // Check expired deposits trước
    await this.autoRejectExpiredDeposits();
    
    // Sau đó check emails
    await this.checkEmails();
    
    // Kiểm tra xem còn pending deposits không
    await this.checkAndSchedule();
  }

  async autoRejectExpiredDeposits() {
    try {
      const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
      
      const expiredDeposits = await DepositRequest.find({
        status: 'pending',
        depositMethod: 'bank',
        createdAt: { $lt: twentyMinutesAgo }
      }).populate('userId', 'username');

      if (expiredDeposits.length === 0) {
        return;
      }

      console.log(`⏱️  Found ${expiredDeposits.length} expired deposit(s) - auto rejecting...`);

      for (const deposit of expiredDeposits) {
        deposit.status = 'rejected';
        deposit.adminNote = 'Auto rejected - Expired after 20 minutes';
        deposit.processedAt = new Date();
        await deposit.save();

        console.log(`   ❌ Rejected: ${deposit.transferNote} - User: ${deposit.userId?.username || 'Unknown'}`);
      }

      console.log(`✅ Auto rejected ${expiredDeposits.length} expired deposit(s)`);
    } catch (error) {
      console.error('❌ Error auto-rejecting expired deposits:', error.message);
    }
  }

  createImapConnection() {
    return new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, ''), // Remove spaces from App Password
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });
  }

  async checkEmails() {
    const pendingCount = await DepositRequest.countDocuments({ 
      status: 'pending',
      depositMethod: 'bank'
    });
    console.log(`📬 Checking emails... (${pendingCount} pending deposit${pendingCount !== 1 ? 's' : ''})`);
    
    return new Promise((resolve) => {
      this.isChecking = true;
      this.imap = this.createImapConnection();

      this.imap.once('ready', () => {
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            console.error('❌ Error opening inbox:', err.message);
            this.isChecking = false;
            this.imap.end();
            return resolve();
          }

          // Tìm email chưa đọc từ ACB
          const searchCriteria = ['UNSEEN'];
          if (process.env.BANK_EMAIL_FROM) {
            searchCriteria.push(['FROM', process.env.BANK_EMAIL_FROM]);
          }

          this.imap.search(searchCriteria, (err, results) => {
            if (err) {
              console.error('❌ Search error:', err.message);
              this.imap.end();
              this.isChecking = false;
              return resolve();
            }

            if (!results || results.length === 0) {
              // Không có email mới
              console.log('   📭 No new emails from bank');
              this.imap.end();
              this.isChecking = false;
              return resolve();
            }

            console.log(`📬 Found ${results.length} unread email(s)`);

            const fetch = this.imap.fetch(results, { bodies: '' });
            const emailPromises = [];

            fetch.on('message', (msg, seqno) => {
              const emailPromise = new Promise((resolveEmail) => {
                msg.on('body', async (stream) => {
                  try {
                    const parsed = await simpleParser(stream);
                    await this.processEmail(parsed);
                  } catch (error) {
                    console.error('❌ Parse error:', error.message);
                  }
                  resolveEmail();
                });
              });
              
              emailPromises.push(emailPromise);

              msg.once('attributes', (attrs) => {
                // Đánh dấu đã đọc
                this.imap.addFlags(attrs.uid, ['\\Seen'], (err) => {
                  if (err) console.error('❌ Flag error:', err.message);
                });
              });
            });

            fetch.once('error', (err) => {
              console.error('❌ Fetch error:', err.message);
            });

            fetch.once('end', async () => {
              // Đợi tất cả email được process xong
              await Promise.all(emailPromises);
              this.imap.end();
              this.isChecking = false;
              resolve();
            });
          });
        });
      });

      this.imap.once('error', (err) => {
        console.error('❌ IMAP error:', err.message);
        this.isChecking = false;
        resolve();
      });

      this.imap.once('end', () => {
        this.isChecking = false;
      });

      this.imap.connect();
    });
  }

  async processEmail(email) {
    try {
      const subject = email.subject || '';
      const text = email.text || '';
      const from = email.from?.text || '';

      console.log('📨 Processing email:', subject);
      console.log('   From:', from);

      // Parse thông tin từ email ACB
      // Format ACB thực tế:
      // "Ghi có +10,000.00 VND"
      // "Nội dung giao dịch: PNHN1234 10000 GD 6256IBT1AJQYKLVM 130926-13:37:09."
      
      // Try multiple amount patterns
      let amountMatch = text.match(/Ghi c[oóôồốổỗộ]\s*\+\s*([0-9,\.]+)\s*VND/i);
      if (!amountMatch) {
        amountMatch = text.match(/\+\s*([0-9,\.]+)\s*(VND|đ|d)/i);
      }
      if (!amountMatch) {
        amountMatch = text.match(/(?:So tien|Sotien|Amount|Credit):\s*\+?\s*([0-9,\.]+)/i);
      }

      // Try multiple code patterns - ACB format: "Nội dung giao dịch: CODE AMOUNT GD ..."
      let codeMatch = text.match(/N[oôộốồổỗ]i dung giao d[iịíìỉĩ]ch:\s*([A-Z0-9]+(?:\s+[0-9]+)?)\s*(?:GD|$)/i);
      if (!codeMatch) {
        codeMatch = text.match(/(?:Noi dung|ND|Ma GD|Dien giai|Content):\s*([A-Z0-9]+(?:\s+[0-9]+)?)/i);
      }
      if (!codeMatch) {
        // Try finding NAP/PNHN pattern directly
        codeMatch = text.match(/([A-Z]+[0-9]+(?:\s+[0-9]+)?)/i);
      }

      if (!amountMatch) {
        console.log('⚠️  Cannot find amount in email');
        console.log('   Email text sample:', text.substring(0, 200));
        return;
      }

      if (!codeMatch) {
        console.log('⚠️  Cannot find transfer code in email');
        console.log('   Email text sample:', text.substring(0, 200));
        return;
      }

      // Parse số tiền - ACB format: "10,000.00" (comma = thousands, dot = decimal)
      // Cần phân biệt: 10,000.00 = 10 nghìn vs 10.000,00 = 10 nghìn (European)
      let amountStr = amountMatch[1];
      
      // ACB dùng format US: comma for thousands, dot for decimal
      // Ví dụ: "10,000.00" = 10000, "500,000.50" = 500000.5
      if (amountStr.includes(',') && amountStr.includes('.')) {
        // Has both: remove comma (thousands), keep dot (decimal)
        amountStr = amountStr.replace(/,/g, '');
      } else if (amountStr.includes(',')) {
        // Only comma: treat as thousands separator, remove it
        amountStr = amountStr.replace(/,/g, '');
      } else if (amountStr.includes('.')) {
        // Only dot: could be decimal or thousands
        // ACB usually shows decimal: "10000.00"
        // Keep it as is
      }
      
      const amount = parseFloat(amountStr);
      
      // Chuẩn hóa transferNote - loại bỏ số tiền nếu có
      // "PNHN1234 10000" -> "PNHN1234"
      let transferNote = codeMatch[1].trim().toUpperCase();
      transferNote = transferNote.replace(/\s+\d+$/, ''); // Remove trailing numbers

      console.log(`💰 Found: ${transferNote} - ${amount.toLocaleString()} VND`);

      // Tìm deposit request theo transferNote (case-insensitive)
      // Thử cả 2 format: "PNHN1234" và "PNHN1234 10000"
      const transferNoteWithAmount = `${transferNote} ${Math.floor(amount)}`;
      
      let deposit = await DepositRequest.findOne({ 
        transferNote: new RegExp(`^${transferNote}$`, 'i'),
        status: 'pending'
      }).populate('userId');
      
      // Nếu không tìm thấy, thử format có số tiền
      if (!deposit) {
        deposit = await DepositRequest.findOne({ 
          transferNote: new RegExp(`^${transferNote}\\s+\\d+$`, 'i'),
          status: 'pending'
        }).populate('userId');
      }

      if (!deposit) {
        console.log(`❌ Deposit not found or already processed: ${transferNote}`);
        // Debug: Kiểm tra xem có deposit nào pending không
        const allPending = await DepositRequest.find({ 
          status: 'pending',
          depositMethod: 'bank'
        }).select('transferNote amount userId');
        console.log(`   📋 Current pending deposits:`, allPending.map(d => `${d.transferNote} (${d.amount}đ)`).join(', ') || 'None');
        return;
      }

      // Kiểm tra số tiền khớp (cho phép sai lệch ±1000đ)
      const diff = Math.abs(deposit.amount - amount);
      if (diff > 1000) {
        console.log(`❌ Amount mismatch: Expected ${deposit.amount.toLocaleString()}, got ${amount.toLocaleString()}`);
        console.log(`   Difference: ${diff.toLocaleString()}đ - Please review manually`);
        return;
      }

      // Auto approve với MongoDB transaction (giống admin.js)
      await this.autoApproveDeposit(deposit, amount, transferNote);

    } catch (error) {
      console.error('❌ Error processing email:', error);
    }
  }

  async autoApproveDeposit(deposit, emailAmount, transferNote) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Lấy user trước khi update deposit
      const user = await User.findById(deposit.userId).session(session);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        console.error(`❌ User not found for deposit ${transferNote}`);
        return;
      }

      // Update deposit
      deposit.status = 'approved';
      deposit.processedAt = new Date();
      deposit.processedBy = null; // null = auto system
      deposit.adminNote = `Auto approved via email - Received: ${emailAmount.toLocaleString()}đ`;
      deposit.autoApproved = true;
      deposit.emailProcessedAt = new Date();
      await deposit.save({ session });

      // Update user balance
      const oldBalance = user.balance;
      user.balance += deposit.amount;

      // Award spins based on cumulative deposit (mỗi 200k = 1 lượt, cộng dồn)
      const prevTotalDeposited = user.totalDeposited || 0;
      const newTotalDeposited = prevTotalDeposited + deposit.amount;
      const spinsAwarded = calculateSpinsAwarded(prevTotalDeposited, newTotalDeposited);
      
      const oldSpins = user.spins || 0;
      user.totalDeposited = newTotalDeposited;
      user.spins = oldSpins + spinsAwarded;

      await user.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      console.log(`✅ Auto approved: ${transferNote} - ${deposit.amount.toLocaleString()}đ`);
      console.log(`   User: ${user.username}`);
      console.log(`   Balance: ${oldBalance.toLocaleString()} → ${user.balance.toLocaleString()}`);
      console.log(`   Spins: ${oldSpins} → ${user.spins} (awarded ${spinsAwarded})`);
      console.log(`   Total deposited: ${prevTotalDeposited.toLocaleString()} → ${newTotalDeposited.toLocaleString()}`);

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(`❌ Transaction error for ${transferNote}:`, error.message);
      throw error;
    }
  }

  stop() {
    console.log('📧 Email checker service stopping...');
    this.disable();
    if (this.imap) {
      this.imap.end();
    }
    console.log('📧 Email checker stopped');
  }
}

export default new EmailChecker();
