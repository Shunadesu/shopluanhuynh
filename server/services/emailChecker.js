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
  }

  async start() {
    console.log('📧 Email checker started - checking every 30s');
    
    // Check ngay khi start
    await this.checkEmails();
    
    // Check định kỳ
    this.intervalId = setInterval(() => {
      if (!this.isChecking) {
        this.checkEmails();
      }
    }, this.checkInterval);
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
              this.imap.end();
              this.isChecking = false;
              return resolve();
            }

            console.log(`📬 Found ${results.length} unread email(s)`);

            const fetch = this.imap.fetch(results, { bodies: '' });
            let processedCount = 0;

            fetch.on('message', (msg, seqno) => {
              msg.on('body', async (stream) => {
                try {
                  const parsed = await simpleParser(stream);
                  await this.processEmail(parsed);
                } catch (error) {
                  console.error('❌ Parse error:', error.message);
                }
              });

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

            fetch.once('end', () => {
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
      // Format ACB thường là:
      // "Tai khoan: 123456789"
      // "Giao dich: +500,000 VND" hoặc "+500.000 VND"
      // "Noi dung: NAP123456"
      
      // Try multiple amount patterns
      let amountMatch = text.match(/\+\s*([0-9,\.]+)\s*(VND|đ|d)/i);
      if (!amountMatch) {
        // Try: "So tien: +500,000"
        amountMatch = text.match(/(?:So tien|Sotien|Amount):\s*\+?\s*([0-9,\.]+)/i);
      }

      // Try multiple code patterns
      let codeMatch = text.match(/(?:Noi dung|ND|Ma GD|Dien giai|Content):\s*([A-Z0-9]+)/i);
      if (!codeMatch) {
        // Try finding NAP pattern directly
        codeMatch = text.match(/(NAP[0-9]+)/i);
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

      // Parse số tiền (bỏ dấu phẩy/chấm)
      const amountStr = amountMatch[1].replace(/[,\.]/g, '');
      const amount = parseFloat(amountStr);
      const transferNote = codeMatch[1].trim().toUpperCase();

      console.log(`💰 Found: ${transferNote} - ${amount.toLocaleString()} VND`);

      // Tìm deposit request theo transferNote
      const deposit = await DepositRequest.findOne({ 
        transferNote: transferNote,
        status: 'pending'
      }).populate('userId');

      if (!deposit) {
        console.log(`❌ Deposit not found or already processed: ${transferNote}`);
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
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.imap) {
      this.imap.end();
    }
    console.log('📧 Email checker stopped');
  }
}

export default new EmailChecker();
