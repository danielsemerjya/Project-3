document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = () => { 
    send_mail();
    return false;
  };


  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-body').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {

  // Get emails from mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(function(element) {
      // Creat div for each email in mailbox
      const email = document.createElement('div');
      const box = document.createElement('div');

      box.innerHTML = '<button class="btn btn-sm btn-outline-primary" onclick="archiv_email(${element.id})">Archive</button>'
      

      if (mailbox == 'sent') {
        email.innerHTML = 
          `<div style="font-weight: bold; font-size:120%";" onclick="display_email(${element.id})">${element.recipients}</div>
          <div style="text-align: left; font-size:110%" onclick="display_email(${element.id})">${element.subject}</div>
          <div style="text-align: right;">${element.timestamp}</div>`;
      }
      else if (mailbox == 'archive') {
        email.innerHTML = 
        `<div style="font-weight: bold; font-size:120%" onclick="display_email(${element.id})">${element.sender}</div>
        <div style="text-align: left; font-size:110%" onclick="display_email(${element.id})">${element.subject}</div>
        <div style="text-align: right;">${element.timestamp} 
        <button class="btn btn-sm btn-outline-primary" onclick="unarchiv_email(${element.id})">Unarchive</button>
        </div>`;
        
      }
      else if (mailbox == 'inbox') {
        email.innerHTML = 
        `<div style="font-weight: bold; font-size:120%";" onclick="display_email(${element.id})">${element.sender}</div>
        <div style="text-align: left; font-size:110%";" onclick="display_email(${element.id})">${element.subject}</div>
        <div style="text-align: right;">${element.timestamp}
        <button class="btn btn-sm btn-outline-primary" onclick="archiv_email(${element.id})">Archive</button>
        </div>
        `;
      };

      
      // Check if the mail has been read
      if (element.read == false){
        email.style.backgroundColor= 'lightgray';
      }
      

      // Listen for click in email
      //email.addEventListener('click', function() {
      //  display_email(element);
      //});

      // Make some CSS for each div
      email.style.borderColor = "black";
      email.style.borderStyle = "solid";
      email.style.borderWidth = "thin";
      email.style.columnCount = "3";

      document.querySelector(`#emails-view`).append(email);
    });
  })
  .catch(error => {
    console.log("Error:", error);
  });
  

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-body').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function send_mail() {
  // Get data from form
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Send mail
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject ,
      body: body,
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
  })
  alert('Email was sent');
  // After sent go to sent-mailbox
  load_mailbox('sent');
}

function display_email(id) {

  // Get the email
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    // Display content
  const box = document.querySelector('#email-body');
  box.innerHTML = `
  <div id='sender'><strong>Sender:</strong> ${email.sender}</div>
  <div id='recipients'><strong> Recipients:</strong> ${email.recipients}</div>
  <div id='time'><strong> Timestamp:</strong> ${email.timestamp}</div>
  <button class="btn btn-sm btn-outline-primary" onclick='reply(${email.id})'>Reply</button>
  <hr>
  <div id='body'>${email.body}</div>
  `;
  });

  // Show email-body view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-body').style.display = 'block';

  // Set this mail as readed
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: false
    })
  });

}


function archiv_email(id) {
// mark the mail as achived
fetch(`/emails/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: true
  })
  
});
load_mailbox('inbox');
}

function unarchiv_email(id) {
// make the mail stop being archived
fetch(`/emails/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: false
  })
});
load_mailbox('archive');
}

function reply(id) {
  // open compose form
  compose_email();


  // Get the email
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Put right elements to their places
    document.querySelector('#compose-recipients').value = `${email.sender}`;
    // Check last email subject
    if (email.subject.substring(0,3) == 'Re:') {
      document.querySelector('#compose-subject').value = `${email.subject}`;
    }
    else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    // fill the body
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

  });

}