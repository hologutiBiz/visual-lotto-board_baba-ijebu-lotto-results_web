export function showError(htmlMessage) {
    const status = document.getElementById('statusMessage');
    status.innerHTML = htmlMessage;
    document.body.classList.remove('loading');

    const link = document.getElementById('errorReportLink');
    if (link) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const textarea = document.getElementById('reportMessage');
            if (textarea) {
                textarea.value = `[System Error] ${stripHTML(htmlMessage)}`;
            }
            document.getElementById('reportModal')?.classList.remove('hidden');
        });
    }
}

function stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}
