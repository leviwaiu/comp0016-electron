const {ipcRenderer} = require('electron');

const service_username = document.getElementById('service-username');
const service_password = document.getElementById('service-password');

document.getElementById('return-button').addEventListener('click', function(){
  const username = service_username.value;
  const password = service_password.value;
  service_password.value = "What";
<<<<<<< Updated upstream
=======
  console.log("tero")
>>>>>>> Stashed changes
  ipcRenderer.send('credentials-change', username, password);
})