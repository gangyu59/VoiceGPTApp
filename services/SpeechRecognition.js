// SpeechRecognition.js

function startSpeechRecognition(callback) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'zh-CN';  // 设置中文语音识别
    recognition.continuous = false; // 只识别一次

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        callback(transcript);
    };

    recognition.start();
}