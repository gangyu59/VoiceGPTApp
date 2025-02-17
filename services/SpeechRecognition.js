let recognition = null;
let selectedLanguage = 'zh-CN'; // 默认中文
let isRecognizing = false; // 防止重复启动

function startSpeechRecognition(callback) {
    if (isRecognizing) return; // 避免重复启动
    isRecognizing = true;

    // 确保 `recognition` 只初始化一次
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            isRecognizing = false;
            callback(transcript);
        };

        recognition.onend = function () {
            isRecognizing = false; // 允许下次启动
        };
    }

    recognition.lang = selectedLanguage; // 设置当前选择的语言
    recognition.start();
}

// **停止语音识别（在朗读前调用，防止冲突）**
function stopSpeechRecognition() {
    if (isRecognizing && recognition) {
        recognition.stop();
        isRecognizing = false;
    }
}

// **设置语言**
function setRecognitionLanguage(lang) {
    selectedLanguage = lang;
}