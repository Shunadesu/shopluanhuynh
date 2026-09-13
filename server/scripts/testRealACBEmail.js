// Test với email ACB thực tế
console.log('🧪 Testing Real ACB Email Format\n');

const realACBEmail = `
Kính gửi Quý khách hàng.

ACB trân trọng thông báo tài khoản 27550951 của Quý khách đã thay đổi số dư như sau:
Số dư mới của tài khoản trên là: 10,000.00 VND tính đến 13/09/2026.
Giao dịch mới nhất:Ghi có +10,000.00 VND.
Nội dung giao dịch: PNHN1234 10000 GD 6256IBT1AJQYKLVM 130926-13:37:09.

Cảm ơn Quý khách hàng đã sử dụng Sản phẩm/ Dịch vụ của ACB. Chúng tôi mong được tiếp tục phục vụ Quý khách hàng.
Trân trọng.


------------------------------------------------------------------------------------------------------------------
Dear Customers,

ACB respectfully updates your 27550951 account balance, as follows:
Updated account balance: 10,000.00 VND up to 13/09/2026.
Latest transaction: Credit +10,000.00 VND.
Content: PNHN1234 10000 GD 6256IBT1AJQYKLVM 130926-13:37:09.

Thank you for using ACB's Product/Service. We look forward to serving you in the future.
Yours faithfully,
`;

function parseACBEmail(text) {
  console.log('📧 Parsing ACB Email...\n');

  // Parse amount - ACB format: "Ghi có +10,000.00 VND"
  let amountMatch = text.match(/Ghi c[oóôồốổỗộ]\s*\+\s*([0-9,\.]+)\s*VND/i);
  if (!amountMatch) {
    amountMatch = text.match(/\+\s*([0-9,\.]+)\s*(VND|đ|d)/i);
  }
  if (!amountMatch) {
    amountMatch = text.match(/(?:So tien|Sotien|Amount|Credit):\s*\+?\s*([0-9,\.]+)/i);
  }

  // Parse transfer note - ACB format: "Nội dung giao dịch: PNHN1234 10000 GD ..."
  let codeMatch = text.match(/N[oôộốồổỗ]i dung giao d[iịíìỉĩ]ch:\s*([A-Z0-9]+(?:\s+[0-9]+)?)\s*(?:GD|$)/i);
  if (!codeMatch) {
    codeMatch = text.match(/(?:Noi dung|ND|Ma GD|Dien giai|Content):\s*([A-Z0-9]+(?:\s+[0-9]+)?)/i);
  }
  if (!codeMatch) {
    codeMatch = text.match(/([A-Z]+[0-9]+(?:\s+[0-9]+)?)/i);
  }

  const results = {};

  if (amountMatch) {
    console.log(`✅ Amount pattern matched: "${amountMatch[0]}"`);
    console.log(`   Captured: "${amountMatch[1]}"`);
    
    // ACB format: "10,000.00" (comma = thousands, dot = decimal)
    let amountStr = amountMatch[1];
    
    if (amountStr.includes(',') && amountStr.includes('.')) {
      // Has both: remove comma (thousands), keep dot (decimal)
      amountStr = amountStr.replace(/,/g, '');
    } else if (amountStr.includes(',')) {
      // Only comma: treat as thousands separator, remove it
      amountStr = amountStr.replace(/,/g, '');
    }
    
    results.amount = parseFloat(amountStr);
    results.amountFormatted = results.amount.toLocaleString('vi-VN');
  } else {
    console.log('❌ Amount NOT found');
  }

  if (codeMatch) {
    console.log(`✅ Transfer note pattern matched: "${codeMatch[0]}"`);
    console.log(`   Captured: "${codeMatch[1]}"`);
    results.transferNote = codeMatch[1].trim().toUpperCase();
  } else {
    console.log('❌ Transfer note NOT found');
  }

  return results;
}

const result = parseACBEmail(realACBEmail);

console.log('\n' + '='.repeat(60));
console.log('📊 PARSING RESULT:');
console.log('='.repeat(60));

if (result.amount && result.transferNote) {
  console.log('✅ Parse SUCCESSFUL!');
  console.log(`   Amount: ${result.amountFormatted} VND (${result.amount})`);
  console.log(`   Transfer Note: ${result.transferNote}`);
  console.log('');
  console.log('🎯 This email will be auto-approved if:');
  console.log(`   1. DepositRequest exists with transferNote = "${result.transferNote}"`);
  console.log(`   2. Status = "pending"`);
  console.log(`   3. Amount difference < 1000đ`);
} else {
  console.log('❌ Parse FAILED!');
  if (!result.amount) console.log('   Missing: amount');
  if (!result.transferNote) console.log('   Missing: transfer note');
}

console.log('\n' + '='.repeat(60));
console.log('💡 NOTES:');
console.log('='.repeat(60));
console.log('• ACB format: "Nội dung giao dịch: CODE AMOUNT GD ..."');
console.log('• Transfer note includes both code AND amount: "PNHN1234 10000"');
console.log('• Amount format: "Ghi có +10,000.00 VND" (comma for thousands, dot for decimal)');
console.log('• System will match this against DepositRequest.transferNote');
console.log('');
