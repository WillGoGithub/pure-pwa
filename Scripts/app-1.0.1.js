const MENU1 = 'Welcome';
const MENU2 = 'Intro';
const MENU3 = 'Slot';
const MENU4 = 'Wheel';
const MENU5 = 'Poker';
const applicationServerPublicKey = 'BPKG6mdbOcsA_m_g4CUnEuVIQQhAm4KwJv3Hp8xCvy37VSDRURlROvw9QyS8Sr98Q-A_m3aexKy7ucUFaaR_jNA';
let registration = null;
let isSubscribed = null;

Init();

/* ===== Event ===== */

// 重新整理
$('#btn-refresh').click(function () {
    RefreshApp();
});

// 開啟通知
$('#btn-openNotice').click(function () {
    InitNoticeUI();
});

// menu 切換
$('.js-menu-item').click(function () {
    sessionStorage.Page = $(this).data('target');
    SwitchPage();
});

// 展開側邊功能欄
$('.js-navbar-toggler').click(function () {
    $('.js-side-nav').toggleClass('visible');
});

// 關閉側邊功能欄
$('.js-side-nav').click(function () {
    if ($(event.target).hasClass("visible") === true) {
        $('.js-side-nav').toggleClass('visible');
    }
});

/* ===== Funtion ===== */

// 錯誤訊息
function AjaxErrorHandler(status, responseText, exception) {
    Loading(false);

    switch (status) {
        case 0:
            $('#form-disconnected-main').text('您目前未連上網路僅提供離線資料，');
            $('#form-disconnected-msg').text('請檢查行動網路/WiFi是否正常連接。');
            $('#form-app').show();
            $('#form-disconnected').show();
            break;
        case 401:
            $('#form-app').hide();
            return;
        default:
            alert(status + '系統發生錯誤：' + responseText);
            break;
    }
}

// 驗證是否有網路
function DetectOnLine() {
    if (navigator.onLine === false) {
        AjaxErrorHandler(0, null, null);
    }
    else {
        $('#form-disconnected').hide();
    }

    setTimeout(DetectOnLine, 5000);
}

// 初始化
function Init() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker-1.0.1.min.js')
                .then((reg) => {
                    registration = reg;
                    InitNoticeUI();
                });
        });
    }

    // 初始化頁面
    if (sessionStorage.Page === undefined) {
        sessionStorage.Page = MENU1;
    }

    // Init
    DetectOnLine();
    //CheckLogin();
    SwitchPage();
}

// 初始化通知
function InitNoticeUI() {
    if (registration !== null && 'PushManager' in window) {
        // Set the initial subscription value
        registration.pushManager.getSubscription()
            .then(function (subscription) {
                isSubscribed = !(subscription === null);
                SubscribeNotice();
            });
    }
}

// 判斷是否空值
function IsNull(value) {
    return (value === null || typeof value === 'undefined' || value === '' || value === 'null');
}

// 讀取中
function Loading(state) {
    switch (state) {
        case true:
            $(".loader").fadeIn(300);
            break;
        default:
            $(".loader").fadeOut(300);
            break;
    }
}

// 重新整理
function RefreshApp() {
    caches.keys().then(function (names) {
        $.map(names, function (v) {
            caches.delete(name);

        });
    });

    registration.update();
    location.reload();
}

// 頁面切換
function SwitchPage() {
    let $pageTitle = $('.js-pageName');

    $('.js-menu-item').removeClass('active');
    $('.js-container-content').removeClass('active');

    switch (sessionStorage.Page) {
        case MENU1:
            $pageTitle.text('首頁');
            break;
        case MENU2:
            $pageTitle.text('PWA 介紹');
            break;
        case MENU3:
            $pageTitle.text('Slot 遊戲');
            break;
        case MENU4:
            $pageTitle.text('Wheel 遊戲');
            break;
        case MENU5:
            $pageTitle.text('Poker 遊戲');
            break;
    }

    $('.js-menu-item[data-target="' + sessionStorage.Page + '"]').addClass('active');
    $('.js-container-content[data-trigger="' + sessionStorage.Page + '"]').addClass('active');
    $('.js-side-nav').removeClass('visible');
}

// 通知
function SubscribeNotice() {
    registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: UrlB64ToUint8Array(applicationServerPublicKey)
    })
        .then(function (subscription) {
            //console.log('User is subscribed:', subscription);
            isSubscribed = true;
            UpdateSubscribe();
        })
        .catch(function (err) {
            UpdateSubscribe();
        });
}

// 更新訂閱通知按鈕
function UpdateSubscribe() {
    if (isSubscribed) {
        $('#btn-openNotice').addClass('invisible');
    } else {
        $('#btn-openNotice').removeClass('invisible');
    }
}

function UrlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
