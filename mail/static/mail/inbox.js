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
    // Print emails
    console.log(emails);
    // Do something else
    emails.forEach(function(element) {
      // Creat div for each email in mailbox
      const email = document.createElement('div');
      if (mailbox == 'sent') {
        email.innerHTML = 
          `<div style="font-weight: bold; font-size:120%">${element.recipients}</div>
          <div style="text-align: left; font-size:110%">${element.subject}</div>
          <div style="text-align: right;">${element.timestamp}</div>`;
      }
      else {
        email.innerHTML = 
        `<div style="font-weight: bold; font-size:120%">${element.sender}</div>
        <div style="text-align: left; font-size:110%">${element.subject}</div>
        <div style="text-align: right;">${element.timestamp}</div>`;
      };
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
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function send_mail() {
  
  // Send mail
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: 'daniel@daniel.pl',
      subject: 'Mail powitalny' ,
      body: 'Witam serdecznie na naszej stronie @Hello_world',
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