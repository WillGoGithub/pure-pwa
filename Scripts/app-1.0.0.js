const MENU1 = 'Welcome';
const MENU2 = 'Intro';
const MENU3 = 'Slot';
const MENU4 = 'Wheel';
const MENU5 = 'Poker';
const applicationServerPublicKey = 'BPKG6mdbOcsA_m_g4CUnEuVIQQhAm4KwJv3Hp8xCvy37VSDRURlROvw9QyS8Sr98Q-A_m3aexKy7ucUFaaR_jNA';
let registration = null;
let isSubscribed = null;
let dataReaded = false;
let installPromptEvent;

// 增加日期天數
Date.prototype.addDays = function (days) {
    let dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};

// 取得週數
Date.prototype.getWeekOfDay = function () {
    let dat = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    let onejan = new Date(this.getFullYear(), 0, 1);
    return Math.floor(1 + ((((dat - onejan) / 86400000) + onejan.getDay()) / 7));
};

// 轉換日期字串 YYYY-MM-DD
Date.prototype.toDateString = function () {
    let date = this.getDate();
    let month = this.getMonth() + 1;
    let dateStr = ((date < 10) ? '0' : '') + date;
    let monthStr = ((month < 10) ? '0' : '') + month;
    return this.getFullYear() + '-' + monthStr + '-' + dateStr;
};

Init();

/* ===== Event ===== */

// 新增至桌面
$('#btn-addHome').click(function () {
    $('#btn-addHome').toggleClass('invisible');
    installPromptEvent.prompt();
    installPromptEvent.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        } else {
            console.log('User dismissed the A2HS prompt');
        }
        installPromptEvent = null;
    });
});

// 重新整理
$('#btn-refresh').click(function () {
    RefreshApp();
});

// 開啟通知
$('#btn-openNotice').click(function () {
    InitNoticeUI();
});

// 時間變更觸發事件
$('#dtp-startDate').change(function () {
    ChangeWeeklyDateInput();
});

// 必填欄位變更觸發事件
$('.js-edit-required').change(function () {
    AddDangerBorder($(this));
});

// 電話欄位驗證
$('.js-validate').change(function () { Validate($(this), $(this).data('role')); });
$('.js-validate').keyup(function () { Validate($(this), $(this).data('role')); });

// 貼上電話欄位欄位執行驗證規則
$('.js-validate').bind('paste', function (e) {
    var data = e.originalEvent.clipboardData.getData('Text');
    $(this).val(data);
    Validate($(this), $(this).data('role'));
    event.preventDefault();
});

// Enter
$('.js-enter-trigger').keypress(function (e) {
    if (e.which === 13) {
        let target = $(this).data('target');
        $('#' + target).focus();
        $('#' + target).click();
    }
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

// 新增必填提示框
function AddDangerBorder(element) {
    let target = $(this).data('target');

    if (target !== undefined && target.indexOf(sessionStorage.Page) < 0) {
        return;
    }

    let value = element.val().trim();

    element.val(value);

    if (IsNull(value) === true) {
        element.parent().find('.selectize-input').addClass('border-danger');
        element.addClass('border-danger');
        element.attr('placeholder', '請輸入這個欄位');
    }
    else {
        element.parent().find('.selectize-input').removeClass('border-danger');
        element.removeClass('border-danger');
        element.attr('placeholder', '');
    }
}

// 錯誤訊息
function AjaxErrorHandler(status, responseText, exception) {
    Loading(false);

    switch (status) {
        case 0:
            $('#form-disconnected-main').text('您目前未連上網路僅提供離線資料，');
            $('#form-disconnected-msg').text('請檢查行動網路/WiFi是否正常連接。');
            $('#form-app').show();
            $('#form-signin').hide();
            $('#form-disconnected').show();
            break;
        case 401:
            $('#form-app').hide();
            $('#form-signin').show();
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
        navigator.serviceWorker
            .register('/service-worker-1.0.0.min.js')
            .then(function (reg) {
                registration = reg;
                InitNoticeUI();
            });
    }

    // 加至主畫面
    window.addEventListener('beforeinstallprompt', (event) => {
        //console.log('addEventListener');
        event.preventDefault();
        installPromptEvent = event;
        $('#btn-addHome').toggleClass('invisible');
    });

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
    console.log('in');
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

// 設定使用者名稱
function SetUserData() {
    $('#txt-userName').val(sessionStorage.UserName);
    $('.js-userName').text(sessionStorage.UserName);

    if (IsNull(sessionStorage.UserImage) === false) {
        $('#img-userImage').attr('src', 'data:image/jpeg;base64,' + sessionStorage.UserImage);
    }
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

// 驗證欄位
function ValidateField(required) {
    var validateState = true;

    $(required + ':not(div)').each(function () {
        let target = $(this).data('target');

        if (target !== undefined && target.indexOf(sessionStorage.Page) < 0) {
            return;
        }
        else if (IsNull($(this).val().trim()) === true) {
            validateState = false;
        }

        AddDangerBorder($(this));
    });

    return validateState;
}