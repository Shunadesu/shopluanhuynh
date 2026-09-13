import Imap from 'imap';
import dotenv from 'dotenv';

dotenv.config();

const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_APP_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

console.log('🔍 Testing email search...');
console.log('📧 Looking for emails FROM:', process.env.BANK_EMAIL_FROM);

imap.once('ready', () => {
  imap.openBox('INBOX', false, (err, box) => {
    if (err) throw err;
    
    console.log('\n=== Test 1: UNSEEN + FROM ===');
    const criteria1 = ['UNSEEN', ['FROM', process.env.BANK_EMAIL_FROM]];
    imap.search(criteria1, (err, results) => {
      if (err) console.error('Error:', err.message);
      else console.log(`Found ${results?.length || 0} emails`);
      
      console.log('\n=== Test 2: ALL FROM (last 5) ===');
      const criteria2 = [['FROM', process.env.BANK_EMAIL_FROM]];
      imap.search(criteria2, (err, results) => {
        if (err) console.error('Error:', err.message);
        else {
          console.log(`Found ${results?.length || 0} emails from ACB`);
          
          if (results && results.length > 0) {
            const lastFive = results.slice(-5);
            console.log('\n📬 Fetching last 5 emails...');
            
            const fetch = imap.fetch(lastFive, { 
              bodies: 'HEADER.FIELDS (FROM SUBJECT DATE)',
              struct: true 
            });
            
            fetch.on('message', (msg, seqno) => {
              console.log(`\n--- Email #${seqno} ---`);
              msg.on('body', (stream) => {
                let buffer = '';
                stream.on('data', (chunk) => buffer += chunk.toString('utf8'));
                stream.once('end', () => console.log(buffer));
              });
              msg.once('attributes', (attrs) => {
                const flags = attrs.flags || [];
                console.log('Flags:', flags.join(', '));
                console.log('Is UNSEEN?', !flags.includes('\\Seen'));
              });
            });
            
            fetch.once('end', () => {
              imap.end();
            });
          } else {
            imap.end();
          }
        }
      });
    });
  });
});

imap.once('error', (err) => {
  console.error('❌ IMAP error:', err);
});

imap.once('end', () => {
  console.log('\n✅ Done');
  process.exit(0);
});

imap.connect();
