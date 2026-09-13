import { simpleParser } from 'mailparser';

console.log('🧪 Testing ACB Email Parser...\n');

// Mẫu email ACB (format thực tế có thể khác)
const sampleEmails = [
  {
    name: 'Format 1: ACB Standard',
    text: `
Quy khach thoi men,

Tai khoan cua Quy khach vua co giao dich:
Tai khoan: 123456789
So tien: +500,000 VND
Noi dung: NAP123456
Tai khoan nhan: Shop Luan Huynh
So du hien tai: 1,000,000 VND

Tran trong!
`
  },
  {
    name: 'Format 2: ACB With Comma',
    text: `
Thong bao giao dich
Tai khoan: 123456789  
Giao dich: +500,000 VND
Ma GD: NAP123456
Tai khoan nhan: Shop Luan Huynh
`
  },
  {
    name: 'Format 3: ACB With Dot',
    text: `
Dear Customer,

Your account has a new transaction:
Account: 123456789
Amount: +500.000 VND
Content: NAP123456
Receiver: Shop Luan Huynh
`
  },
  {
    name: 'Format 4: Short Format',
    text: `
+500,000d
ND: NAP123456
TK: 123456789
`
  }
];

function parseEmail(text) {
  console.log('📧 Email content:');
  console.log(text.substring(0, 200));
  console.log('...\n');

  // Parse amount - try multiple patterns
  let amountMatch = text.match(/\+\s*([0-9,\.]+)\s*(VND|đ|d)/i);
  if (!amountMatch) {
    amountMatch = text.match(/(?:So tien|Sotien|Amount|Giao dich):\s*\+?\s*([0-9,\.]+)/i);
  }

  // Parse transfer code - try multiple patterns  
  let codeMatch = text.match(/(?:Noi dung|ND|Ma GD|Dien giai|Content):\s*([A-Z0-9]+)/i);
  if (!codeMatch) {
    codeMatch = text.match(/(NAP[0-9]+)/i);
  }

  const results = {};

  if (amountMatch) {
    const amountStr = amountMatch[1].replace(/[,\.]/g, '');
    results.amount = parseFloat(amountStr);
    results.amountFormatted = results.amount.toLocaleString();
  }

  if (codeMatch) {
    results.transferNote = codeMatch[1].trim().toUpperCase();
  }

  return results;
}

console.log('Testing multiple ACB email formats:\n');
console.log('='.repeat(60));
console.log('');

sampleEmails.forEach((sample, index) => {
  console.log(`Test ${index + 1}: ${sample.name}`);
  console.log('-'.repeat(60));
  
  const result = parseEmail(sample.text);
  
  if (result.amount && result.transferNote) {
    console.log('✅ Parse successful!');
    console.log(`   Amount: ${result.amountFormatted} VND`);
    console.log(`   Transfer code: ${result.transferNote}`);
  } else {
    console.log('❌ Parse failed!');
    if (!result.amount) console.log('   Missing: amount');
    if (!result.transferNote) console.log('   Missing: transfer code');
  }
  
  console.log('');
});

console.log('='.repeat(60));
console.log('');
console.log('💡 Nếu email ACB thực tế không match các format trên:');
console.log('   1. Chuyển tiền thật vào ACB');
console.log('   2. Forward email ACB về một email khác');
console.log('   3. Copy toàn bộ nội dung email');
console.log('   4. Gửi cho developer để update regex trong emailChecker.js');
console.log('');
console.log('📝 Các pattern hiện tại:');
console.log('   Amount: /\\+\\s*([0-9,\\.]+)\\s*(VND|đ|d)/i');
console.log('   Amount alt: /(?:So tien|Sotien|Amount|Giao dich):\\s*\\+?\\s*([0-9,\\.]+)/i');
console.log('   Code: /(?:Noi dung|ND|Ma GD|Dien giai|Content):\\s*([A-Z0-9]+)/i');
console.log('   Code alt: /(NAP[0-9]+)/i');
console.log('');
