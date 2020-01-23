window.addEventListener('message', (event) => {
    document.getElementById('table-content').innerHTML = event.data;
})