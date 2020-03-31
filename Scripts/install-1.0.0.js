let installPromptEvent = null;
const installButton = document.getElementById('btn-addHome');
installButton.addEventListener('click', installPWA);

window.addEventListener('beforeinstallprompt', saveBeforeInstallPromptEvent);

function saveBeforeInstallPromptEvent(evt) {
    installPromptEvent = event;
}

// 加至主畫面
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installButton.removeAttribute('hidden');
});

function installPWA(evt) {
    installPromptEvent.prompt();
    evt.srcElement.setAttribute('hidden', true);

    installPromptEvent.userChoice
        .then((choice) => {
            if (choice.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt', choice);
            } else {
                console.log('User dismissed the A2HS prompt', choice);
            }
            installPromptEvent = null;
        });
}

window.addEventListener('appinstalled', logAppInstalled);

function logAppInstalled(evt) {
    alert('App 已安裝完成，請至您的桌面查看');
}